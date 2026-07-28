-- ===========================================================================
-- CRM module — customers matched by phone, no points, no manual editing.
--
-- Nothing in the panel ever inserts or updates a customer row by hand: a
-- BEFORE INSERT trigger on orders is the only writer, so there is no
-- customers_staff_write policy at all — see the RLS block below.
-- ===========================================================================

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  -- Last 8 digits: "381 123-4567", "0381-15-123456" and "+5493811234567"
  -- typed across three separate orders all resolve to this same value, so
  -- the same person becomes one customer instead of three.
  phone_key text generated always as (right(regexp_replace(phone, '\D', '', 'g'), 8)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, business_id),
  unique (business_id, phone_key)
);

create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

alter table public.orders
  add constraint orders_customer_fk foreign key (customer_id, business_id)
  references public.customers (id, business_id);

-- ---------------------------------------------------------------------------
-- Match-or-create. Runs before the row is inserted, so order_insert_audit
-- and every other insert trigger see the final customer_id.
-- ---------------------------------------------------------------------------

create or replace function public.match_or_create_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone_key text := right(regexp_replace(coalesce(new.customer_phone, ''), '\D', '', 'g'), 8);
begin
  -- customer_id already set (should never happen from application code today,
  -- but a future path might set it directly), or no usable phone at all — a
  -- dine_in order once the tables module ships can be phoneless, and a
  -- customer nobody can look up by phone is not worth fabricating a row for.
  if new.customer_id is not null or v_phone_key = '' then
    return new;
  end if;

  insert into public.customers (business_id, name, phone)
  values (new.business_id, new.customer_name, new.customer_phone)
  on conflict (business_id, phone_key)
  do update set name = excluded.name, updated_at = now()
  returning id into new.customer_id;

  return new;
end;
$$;

create trigger orders_match_customer
  before insert on public.orders
  for each row execute function public.match_or_create_customer();

-- ---------------------------------------------------------------------------
-- Stats, as a view rather than counter columns on customers: a counter
-- desyncs the moment an order is cancelled, and each way it can desync would
-- need its own trigger branch to fix. security_invoker means the view carries
-- no more access than the caller already has on customers + orders directly.
-- Facturación = only completed orders, same convention as summarizeOrders()
-- in src/lib/orders/history-queries.ts.
-- ---------------------------------------------------------------------------

create view public.customer_stats
with (security_invoker = true) as
select
  c.id as customer_id,
  c.business_id,
  c.name,
  c.phone,
  count(o.id) filter (where o.status = 'completed') as completed_orders,
  coalesce(sum(o.total_cents) filter (where o.status = 'completed'), 0) as total_spent_cents,
  max(o.created_at) as last_order_at
from public.customers c
left join public.orders o on o.customer_id = c.id and o.business_id = c.business_id
group by c.id, c.business_id, c.name, c.phone;

grant select on public.customer_stats to authenticated;

-- ---------------------------------------------------------------------------
-- RLS. customers holds personal data and gets no anon policy, ever — the
-- diner-facing menu has no reason to touch this table under any role.
-- ---------------------------------------------------------------------------

alter table public.customers enable row level security;

create policy customers_staff_read on public.customers
  for select to authenticated
  using (business_id = public.auth_business_id() or public.is_superadmin());
