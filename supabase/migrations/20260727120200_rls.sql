-- ===========================================================================
-- Row Level Security
--
-- Three audiences:
--   anon           the diner opening a menu link. Reads menu data only, and
--                  only for businesses whose subscription is being honoured.
--   authenticated  staff. Scoped to auth_business_id() from the JWT.
--   superadmin     Galu. Everything.
--
-- Note that staff read policies do NOT depend on business_is_servable():
-- someone whose subscription lapsed still needs to log in and see the notice
-- explaining why the menu is down.
-- ===========================================================================

alter table public.businesses          enable row level security;
alter table public.business_settings   enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.business_modules    enable row level security;
alter table public.business_hours      enable row level security;
alter table public.profiles            enable row level security;
alter table public.categories          enable row level security;
alter table public.products            enable row level security;
alter table public.option_groups       enable row level security;
alter table public.options             enable row level security;
alter table public.delivery_zones      enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.order_item_options  enable row level security;
alter table public.order_status_events enable row level security;
alter table public.order_counters      enable row level security;
alter table public.push_subscriptions  enable row level security;

-- ---------------------------------------------------------------------------
-- Businesses
-- ---------------------------------------------------------------------------

create policy businesses_public_read on public.businesses
  for select to anon, authenticated
  using (public.business_is_servable(id));

create policy businesses_staff_read on public.businesses
  for select to authenticated
  using (id = public.auth_business_id() or public.is_superadmin());

create policy businesses_owner_update on public.businesses
  for update to authenticated
  using (
    public.is_superadmin()
    or (id = public.auth_business_id() and public.auth_user_role() in ('owner', 'manager'))
  )
  with check (
    public.is_superadmin()
    or (id = public.auth_business_id() and public.auth_user_role() in ('owner', 'manager'))
  );

-- Creating and deleting tenants is Galu's job alone.
create policy businesses_superadmin_insert on public.businesses
  for insert to authenticated with check (public.is_superadmin());

create policy businesses_superadmin_delete on public.businesses
  for delete to authenticated using (public.is_superadmin());

-- ---------------------------------------------------------------------------
-- Menu-facing tables: identical shape, so the policies are generated.
-- Public may read; owners and managers may write; superadmin may do anything.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'business_settings', 'business_hours', 'categories',
    'products', 'option_groups', 'options', 'delivery_zones'
  ]
  loop
    execute format($f$
      create policy %1$I_public_read on public.%1$I
        for select to anon, authenticated
        using (public.business_is_servable(business_id));

      create policy %1$I_staff_read on public.%1$I
        for select to authenticated
        using (business_id = public.auth_business_id() or public.is_superadmin());

      create policy %1$I_staff_write on public.%1$I
        for all to authenticated
        using (
          public.is_superadmin()
          or (business_id = public.auth_business_id()
              and public.auth_user_role() in ('owner', 'manager'))
        )
        with check (
          public.is_superadmin()
          or (business_id = public.auth_business_id()
              and public.auth_user_role() in ('owner', 'manager'))
        );
    $f$, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Subscription and modules: readable by the business, writable only by Galu.
-- The panel needs to read its own subscription to render the "past due" banner.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['subscriptions', 'business_modules']
  loop
    execute format($f$
      create policy %1$I_staff_read on public.%1$I
        for select to authenticated
        using (business_id = public.auth_business_id() or public.is_superadmin());

      create policy %1$I_superadmin_write on public.%1$I
        for all to authenticated
        using (public.is_superadmin())
        with check (public.is_superadmin());
    $f$, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create policy profiles_self_read on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or business_id = public.auth_business_id()
    or public.is_superadmin()
  );

-- Anyone may rename themselves; nobody may promote themselves.
--
-- The checks compare against JWT claims rather than re-reading `profiles`.
-- A subquery on profiles inside a policy on profiles re-enters the same policy
-- and Postgres aborts with infinite recursion.
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = public.auth_user_role()
    and business_id is not distinct from public.auth_business_id()
  );

create policy profiles_owner_manage on public.profiles
  for all to authenticated
  using (
    public.is_superadmin()
    or (business_id = public.auth_business_id() and public.auth_user_role() = 'owner')
  )
  with check (
    public.is_superadmin()
    or (
      business_id = public.auth_business_id()
      and public.auth_user_role() = 'owner'
      -- An owner cannot mint a superadmin.
      and role in ('owner', 'manager', 'cashier')
    )
  );

-- ---------------------------------------------------------------------------
-- Orders and their children
--
-- Deliberately NOT readable by anon. The order confirmation page is rendered
-- server-side and addressed by the order's uuid, so a diner never needs — and
-- never gets — read access to the orders table.
--
-- Inserts happen only through the server-side endpoint using the service role,
-- because prices must be recomputed from the database rather than trusted.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'orders', 'order_items', 'order_item_options', 'order_status_events'
  ]
  loop
    execute format($f$
      create policy %1$I_staff_read on public.%1$I
        for select to authenticated
        using (business_id = public.auth_business_id() or public.is_superadmin());
    $f$, t);
  end loop;
end;
$$;

-- Staff move comandas across the board. Which transitions they are allowed to
-- make is enforced by the trigger below, not here.
create policy orders_staff_update on public.orders
  for update to authenticated
  using (business_id = public.auth_business_id() or public.is_superadmin())
  with check (business_id = public.auth_business_id() or public.is_superadmin());

-- The status trigger writes these rows; staff never insert them by hand.
create policy order_status_events_staff_insert on public.order_status_events
  for insert to authenticated
  with check (business_id = public.auth_business_id() or public.is_superadmin());

-- ---------------------------------------------------------------------------
-- Order counters: reachable only through next_order_code(), which is SECURITY
-- DEFINER. No policies at all, so RLS denies every direct client access.
-- ---------------------------------------------------------------------------

revoke all on public.order_counters from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Push subscriptions: a device registers itself and can remove itself.
-- ---------------------------------------------------------------------------

create policy push_subscriptions_staff_all on public.push_subscriptions
  for all to authenticated
  using (business_id = public.auth_business_id() or public.is_superadmin())
  with check (
    (business_id = public.auth_business_id() and profile_id = auth.uid())
    or public.is_superadmin()
  );
