-- ===========================================================================
-- Fix: the first order of every new day failed.
--
-- order_counters resets per business_date, so the counter hands out 1 again
-- each morning and next_order_code returns "B-0001" again. But orders carried
-- `unique (business_id, code)` with no date in it, so that second "B-0001"
-- violated the constraint and create_priced_order raised — meaning the first
-- order a local took on day two, by QR or by waiter, simply failed.
--
-- It never surfaced because no business here has yet taken orders on two
-- different days; the demo data is all from one afternoon.
--
-- The fix keeps the human-facing code exactly as it is. "B-0142" is what a
-- cashier reads out over the phone and what the diner sees on their ticket,
-- and padding a date into it would make it unreadable for the sake of a
-- database detail. Instead the order records which business day it belongs
-- to, and uniqueness moves to (business, day, code) — which is what the
-- daily counter always meant.
-- ===========================================================================

alter table public.orders add column business_date date;

-- Backfill from created_at in each business's own timezone, the same way
-- next_order_code computes it. Doing it in UTC would put every order created
-- after 21:00 Tucumán time on the wrong day and could collide during the
-- index build.
update public.orders o
set business_date = (o.created_at at time zone b.timezone)::date
from public.businesses b
where b.id = o.business_id
  and o.business_date is null;

alter table public.orders alter column business_date set not null;

alter table public.orders drop constraint orders_business_id_code_key;

alter table public.orders
  add constraint orders_business_day_code_key unique (business_id, business_date, code);

-- ---------------------------------------------------------------------------
-- create_priced_order stores the business day it just reserved a number for.
-- next_order_code is left exactly as it was: its signature is fine, and the
-- date it uses for the counter is derived from now(), which Postgres holds
-- fixed for the whole transaction. The date computed here therefore cannot
-- disagree with the one the counter was keyed on, even across midnight.
--
-- Body is otherwise identical to the version in 20260731000400_tables.sql.
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
  v_date date;
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

  select (now() at time zone b.timezone)::date
    into v_date
  from public.businesses b
  where b.id = p_business_id;

  insert into public.orders (
    business_id, code, business_date, fulfillment_type, customer_name, customer_phone,
    address, address_reference, delivery_zone_id, table_id, payment_method,
    cash_change_for_cents, notes, subtotal_cents, delivery_fee_cents,
    total_cents, idempotency_key
  ) values (
    p_business_id,
    v_code,
    v_date,
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
      (v_item ->> 'sort_order')::integer
    )
    returning id into v_item_id;

    for v_option in select * from jsonb_array_elements(v_item -> 'options')
    loop
      insert into public.order_item_options (
        business_id, order_item_id, option_id, group_name, option_name, price_delta_cents
      ) values (
        p_business_id,
        v_item_id,
        nullif(v_option ->> 'option_id', '')::uuid,
        v_option ->> 'group_name',
        v_option ->> 'option_name',
        (v_option ->> 'price_delta_cents')::integer
      );
    end loop;
  end loop;

  return jsonb_build_object('id', v_order_id, 'code', v_code, 'reused', false);
end;
$$;

revoke execute on function public.create_priced_order(uuid, jsonb) from anon, authenticated;
