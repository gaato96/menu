-- ===========================================================================
-- Waiter role ("mozo").
--
-- A mozo signs in with their own user and takes orders at the table from
-- their phone. What they may do is deliberately narrow: create a dine-in
-- order and push it forward. They may not go back, cancel, touch the menu,
-- the cash drawer, the floor layout, or another employee's account.
--
-- The permission model is the one already in place — the JWT `user_role`
-- claim plus the guard trigger — so this migration only widens the CHECK,
-- lets an owner grant the new role, and teaches the guard that a mozo is
-- restricted exactly like a cajero. No new policy surface is introduced:
-- every table a mozo reads (menu, tables, orders) is already readable by any
-- authenticated member of the business, and every table they must NOT write
-- already restricts writes to owner/manager.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- profiles.role gains 'waiter'. The CHECK was written inline in the core
-- schema, so its name is discovered rather than guessed — matching on conkey
-- (the role column alone) rather than on the rendered definition, which
-- Postgres rewrites into `= ANY (ARRAY[...])` when it stores it.
-- `superadmin_has_no_business` also references role but spans two columns, so
-- it can never match here.
-- ---------------------------------------------------------------------------

do $$
declare
  v_name text;
  v_attnum smallint;
begin
  select attnum into v_attnum
  from pg_attribute
  where attrelid = 'public.profiles'::regclass and attname = 'role';

  select conname into v_name
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and conkey = array[v_attnum];

  if v_name is not null then
    execute format('alter table public.profiles drop constraint %I', v_name);
  end if;
end;
$$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('superadmin', 'owner', 'manager', 'cashier', 'waiter'));

-- ---------------------------------------------------------------------------
-- An owner may now grant 'waiter' as well. Still never 'superadmin'.
-- ---------------------------------------------------------------------------

drop policy if exists profiles_owner_manage on public.profiles;

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
      and role in ('owner', 'manager', 'cashier', 'waiter')
    )
  );

-- ---------------------------------------------------------------------------
-- on_order_update(): a mozo is restricted like a cajero — forward only.
--
-- Rewritten whole (rather than patched) because the body is the current one
-- from 20260731000400_tables.sql; the only change is the role list on the
-- reverse/cancel check. Mirrors ROLES_THAT_CAN_REVERSE in
-- src/lib/orders/status.ts, which must change in the same commit.
-- ---------------------------------------------------------------------------

create or replace function public.on_order_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := public.auth_user_role();
begin
  if new.business_id is distinct from old.business_id
     or new.code is distinct from old.code
     or new.subtotal_cents is distinct from old.subtotal_cents
     or new.delivery_fee_cents is distinct from old.delivery_fee_cents
     or new.total_cents is distinct from old.total_cents
     or new.created_at is distinct from old.created_at then
    raise exception 'No se pueden modificar los importes ni el identificador de un pedido';
  end if;

  if new.status is distinct from old.status then
    if new.status = 'on_the_way' and new.fulfillment_type <> 'delivery' then
      raise exception 'Un pedido de retiro no puede pasar a En camino';
    end if;
    if new.status = 'ready_for_pickup' and new.fulfillment_type = 'delivery' then
      raise exception 'Un pedido de delivery no puede pasar a Listo para retirar';
    end if;

    if v_role in ('cashier', 'waiter')
       and (new.status = 'cancelled'
            or public.order_status_rank(new.status) <= public.order_status_rank(old.status)) then
      raise exception 'Solo el encargado o el dueño pueden retroceder o cancelar un pedido';
    end if;

    new.status_changed_at := now();

    insert into public.order_status_events
      (business_id, order_id, from_status, to_status, changed_by)
    values
      (new.business_id, new.id, old.status, new.status, auth.uid());
  end if;

  return new;
end;
$$;
