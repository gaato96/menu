-- ===========================================================================
-- Tables module — dine-in orders from a QR code, no phone, no WhatsApp.
-- ===========================================================================

create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  label text not null check (length(trim(label)) > 0),
  seats integer not null default 2 check (seats > 0),
  zone text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  unique (id, business_id),
  unique (business_id, label)
);

create index restaurant_tables_business_idx
  on public.restaurant_tables (business_id, sort_order);

alter table public.restaurant_tables enable row level security;

-- Gated by the module — the ONLY place business_has_module ever reaches
-- anon. If the module is off, anon reads zero rows: a ?mesa= link resolves
-- to nothing and the menu falls back to the normal delivery/pickup flow. The
-- flag itself never reaches the client, only this consequence of it.
create policy restaurant_tables_public_read on public.restaurant_tables
  for select to anon
  using (
    public.business_is_servable(business_id)
    and public.business_has_module(business_id, 'tables')
  );

create policy restaurant_tables_staff_read on public.restaurant_tables
  for select to authenticated
  using (business_id = public.auth_business_id() or public.is_superadmin());

create policy restaurant_tables_staff_write on public.restaurant_tables
  for all to authenticated
  using (
    public.is_superadmin()
    or (business_id = public.auth_business_id() and public.auth_user_role() in ('owner', 'manager'))
  )
  with check (
    public.is_superadmin()
    or (business_id = public.auth_business_id() and public.auth_user_role() in ('owner', 'manager'))
  );

-- A table's occupied/free state is derived from its own open orders, never
-- stored: a column can desync the moment an order is cancelled or completed
-- through a path that forgets to update it. This partial index is what makes
-- "does this table have an active order" a cheap lookup instead of a full
-- table scan of orders.
create index orders_open_table_idx
  on public.orders (table_id)
  where table_id is not null and status not in ('completed', 'cancelled');

-- ---------------------------------------------------------------------------
-- orders.fulfillment_type gains 'dine_in'. The CHECK was written inline back
-- in the core schema, so its name is discovered rather than guessed.
-- ---------------------------------------------------------------------------

do $$
declare
  v_name text;
  v_attnum smallint;
begin
  select attnum into v_attnum
  from pg_attribute
  where attrelid = 'public.orders'::regclass and attname = 'fulfillment_type';

  -- conkey = {fulfillment_type} exactly: the enum-list CHECK references only
  -- this one column, unlike delivery_requires_address or
  -- pickup_has_no_delivery_fee which also reference fulfillment_type but
  -- span two columns. Matching on conkey rather than the rendered
  -- definition text survives Postgres rewriting `IN (...)` into
  -- `= ANY (ARRAY[...])` when it stores the constraint.
  select conname into v_name
  from pg_constraint
  where conrelid = 'public.orders'::regclass
    and contype = 'c'
    and conkey = array[v_attnum];

  if v_name is not null then
    execute format('alter table public.orders drop constraint %I', v_name);
  end if;
end;
$$;

alter table public.orders
  add constraint orders_fulfillment_type_check
  check (fulfillment_type in ('delivery', 'pickup', 'dine_in'));

alter table public.orders
  add constraint orders_table_fk foreign key (table_id, business_id)
  references public.restaurant_tables (id, business_id),
  add constraint dine_in_requires_table
    check (fulfillment_type <> 'dine_in' or table_id is not null),
  add constraint table_only_for_dine_in
    check (table_id is null or fulfillment_type = 'dine_in');

-- The customer at a table is sitting in the room; nobody needs their phone
-- to hand them a plate. Every other fulfillment type still requires one.
alter table public.orders alter column customer_phone drop not null;

alter table public.orders
  add constraint phone_required_unless_dine_in
    check (
      fulfillment_type = 'dine_in'
      or nullif(trim(coalesce(customer_phone, '')), '') is not null
    );

-- Reserved for a future "cuenta de mesa" / session grouping. Costs nothing
-- now and avoids a destructive migration the day it's needed — same
-- reasoning as customer_id and table_id when the core schema was written.
alter table public.orders add column session_id uuid;

-- ---------------------------------------------------------------------------
-- on_order_update(): mirrors the same change made to checkTransition() in
-- src/lib/orders/status.ts, in this same commit. 'ready_for_pickup' now
-- means "ready to hand over" for BOTH pickup and dine_in — a table's food is
-- also "picked up", just by a server instead of the customer walking to the
-- counter. Only a delivery order is barred from that status, so the
-- rejection inverts from "not pickup" to "is delivery".
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

    if v_role = 'cashier'
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

-- ---------------------------------------------------------------------------
-- create_priced_order() gains table_id.
-- ---------------------------------------------------------------------------

create or replace function public.create_priced_order(p_business_id uuid, p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_code text;
  v_item jsonb;
  v_item_id uuid;
  v_option jsonb;
  v_existing record;
begin
  select id, code into v_existing
  from public.orders
  where business_id = p_business_id
    and idempotency_key = p_order ->> 'idempotency_key';

  if found then
    return jsonb_build_object('id', v_existing.id, 'code', v_existing.code, 'reused', true);
  end if;

  v_code := public.next_order_code(p_business_id);

  insert into public.orders (
    business_id, code, fulfillment_type, customer_name, customer_phone,
    address, address_reference, delivery_zone_id, table_id, payment_method,
    cash_change_for_cents, notes, subtotal_cents, delivery_fee_cents,
    total_cents, idempotency_key
  ) values (
    p_business_id,
    v_code,
    p_order ->> 'fulfillment_type',
    p_order ->> 'customer_name',
    nullif(p_order ->> 'customer_phone', ''),
    p_order ->> 'address',
    p_order ->> 'address_reference',
    nullif(p_order ->> 'delivery_zone_id', '')::uuid,
    nullif(p_order ->> 'table_id', '')::uuid,
    p_order ->> 'payment_method',
    nullif(p_order ->> 'cash_change_for_cents', '')::integer,
    p_order ->> 'notes',
    (p_order ->> 'subtotal_cents')::integer,
    (p_order ->> 'delivery_fee_cents')::integer,
    (p_order ->> 'total_cents')::integer,
    p_order ->> 'idempotency_key'
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_order -> 'items')
  loop
    insert into public.order_items (
      business_id, order_id, product_id, product_name,
      unit_base_price_cents, quantity, item_notes, line_total_cents, sort_order
    ) values (
      p_business_id,
      v_order_id,
      nullif(v_item ->> 'product_id', '')::uuid,
      v_item ->> 'product_name',
      (v_item ->> 'unit_base_price_cents')::integer,
      (v_item ->> 'quantity')::integer,
      v_item ->> 'item_notes',
      (v_item ->> 'line_total_cents')::integer,
      coalesce((v_item ->> 'sort_order')::integer, 0)
    )
    returning id into v_item_id;

    for v_option in select * from jsonb_array_elements(coalesce(v_item -> 'options', '[]'::jsonb))
    loop
      insert into public.order_item_options (
        business_id, order_item_id, option_id, group_name, option_name, price_delta_cents
      ) values (
        p_business_id,
        v_item_id,
        nullif(v_option ->> 'option_id', '')::uuid,
        v_option ->> 'group_name',
        v_option ->> 'option_name',
        coalesce((v_option ->> 'price_delta_cents')::integer, 0)
      );
    end loop;
  end loop;

  return jsonb_build_object('id', v_order_id, 'code', v_code, 'reused', false);
end;
$$;
