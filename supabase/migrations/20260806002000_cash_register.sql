-- ===========================================================================
-- Cash register module.
--
-- The design constraint that shapes everything here: `orders` is not touched.
-- Its `totals_add_up` constraint (total = subtotal + delivery_fee) is a
-- deliberate invariant, and tips and discounts do not belong inside it — a
-- tip is not part of what the food cost. So money collected lives in its own
-- table, `order_payments`, and an order's own totals stay exactly what the
-- customer agreed to at checkout.
--
-- Consequence: enabling this module cannot change a single existing row, and
-- turning it off later leaves the order history intact.
-- ===========================================================================

alter table public.business_modules
  drop constraint business_modules_module_key_check;

alter table public.business_modules
  add constraint business_modules_module_key_check check (module_key in (
    'crm_loyalty',
    'mercadopago',
    'kitchen_printing',
    'kitchen_display',
    'inventory',
    'tables',
    'cash_register'
  ));

-- ---------------------------------------------------------------------------
-- Fiscal identity for the printed receipt. Nullable: a business that never
-- loads them still gets a valid non-fiscal ticket, just without the header.
--
-- Added here, but with no panel screen yet on purpose — nothing renders a
-- receipt until thermal printing ships, and asking an owner for a CUIT that
-- goes nowhere is a form field that only generates questions. The columns
-- are additive and free; the UI lands with the thing that consumes them.
--
-- NOT a replacement for electronic invoicing (CAE). Nothing here talks to
-- ARCA, and the receipt must never be presented as a factura.
-- ---------------------------------------------------------------------------

alter table public.business_settings
  add column cuit text check (cuit is null or cuit ~ '^[0-9]{11}$'),
  add column iva_condition text check (iva_condition is null or iva_condition in (
    'responsable_inscripto', 'monotributo', 'exento', 'consumidor_final'
  ));

-- ---------------------------------------------------------------------------
-- A shift. Opened with a float, closed with a physical count.
-- ---------------------------------------------------------------------------

create table public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  opened_by uuid not null references public.profiles(id),
  opened_at timestamptz not null default now(),
  opening_float_cents integer not null default 0 check (opening_float_cents >= 0),
  closed_by uuid references public.profiles(id),
  closed_at timestamptz,
  -- What was physically counted in the drawer at close.
  counted_cents integer check (counted_cents is null or counted_cents >= 0),
  -- What the system says should be there. Frozen at close rather than
  -- computed on read: a later correction to an old payment must not silently
  -- rewrite the arqueo somebody already signed off on.
  expected_cents integer,
  difference_cents integer,
  notes text,
  unique (id, business_id),
  -- Every closing field arrives together or none does.
  constraint close_is_atomic check (
    (closed_at is null and closed_by is null and counted_cents is null
      and expected_cents is null and difference_cents is null)
    or
    (closed_at is not null and closed_by is not null and counted_cents is not null
      and expected_cents is not null and difference_cents is not null)
  )
);

-- One open drawer per business, enforced here rather than in the application:
-- two cashiers opening at once on different devices is exactly the race a
-- SELECT-then-INSERT check misses.
create unique index cash_sessions_one_open_per_business
  on public.cash_sessions (business_id)
  where closed_at is null;

create index cash_sessions_business_opened_idx
  on public.cash_sessions (business_id, opened_at desc);

-- ---------------------------------------------------------------------------
-- Movements that are not order payments: paying a supplier from the drawer,
-- a withdrawal to the safe, cash put in mid-shift.
-- ---------------------------------------------------------------------------

create table public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  cash_session_id uuid not null,
  kind text not null check (kind in ('expense', 'income', 'withdrawal')),
  -- Always positive; `kind` carries the sign. A signed amount plus a kind is
  -- two sources of truth for one fact, and they drift.
  amount_cents integer not null check (amount_cents > 0),
  concept text not null check (length(trim(concept)) > 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (cash_session_id, business_id)
    references public.cash_sessions (id, business_id) on delete cascade
);

create index cash_movements_session_idx
  on public.cash_movements (cash_session_id, created_at);

-- ---------------------------------------------------------------------------
-- Collecting an order. This is where tip and discount live.
-- ---------------------------------------------------------------------------

create table public.order_payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid not null,
  cash_session_id uuid not null,
  method text not null check (method in ('cash', 'card', 'transfer', 'mercadopago', 'other')),
  -- What the order was worth at collection time, copied from orders.total_cents.
  -- Copied, not joined: a price correction next week must not rewrite what the
  -- drawer actually took today.
  amount_cents integer not null check (amount_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  tip_cents integer not null default 0 check (tip_cents >= 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  -- An order is collected once. Re-collecting is a correction, which means
  -- deleting this row first — deliberately noisier than a silent second row.
  unique (order_id),
  constraint discount_within_amount check (discount_cents <= amount_cents),
  foreign key (order_id, business_id)
    references public.orders (id, business_id) on delete cascade,
  foreign key (cash_session_id, business_id)
    references public.cash_sessions (id, business_id)
);

create index order_payments_session_idx
  on public.order_payments (cash_session_id, created_at);

-- What the customer actually handed over. Generated so no caller can store a
-- total that disagrees with its own parts.
alter table public.order_payments
  add column collected_cents integer
  generated always as (amount_cents - discount_cents + tip_cents) stored;

-- ---------------------------------------------------------------------------
-- Guard: nothing may be attached to a closed session.
--
-- A trigger rather than a CHECK because the condition lives on the parent
-- row. Without it, a shift closed at 23:00 keeps absorbing payments typed at
-- 23:30 and the arqueo everyone already signed stops matching.
-- ---------------------------------------------------------------------------

create or replace function public.assert_cash_session_open()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.cash_sessions s
    where s.id = new.cash_session_id and s.closed_at is not null
  ) then
    raise exception 'La caja ya está cerrada.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger cash_movements_session_open
  before insert or update on public.cash_movements
  for each row execute function public.assert_cash_session_open();

create trigger order_payments_session_open
  before insert or update on public.order_payments
  for each row execute function public.assert_cash_session_open();

-- ---------------------------------------------------------------------------
-- Closing the drawer.
--
-- One function, so the expected total and the difference are computed from
-- the same snapshot the close is written in. Doing this in the application
-- means reading, computing, then writing, with a payment able to land in
-- between — the arqueo would be wrong by exactly that payment.
--
-- Only cash counts toward the drawer: a card or transfer payment never
-- passed through it.
-- ---------------------------------------------------------------------------

create or replace function public.close_cash_session(
  p_session_id uuid,
  p_counted_cents integer,
  p_notes text default null
)
returns public.cash_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.cash_sessions;
  v_expected integer;
begin
  -- FOR UPDATE serialises two cashiers hitting "cerrar" at once: the second
  -- waits, then finds closed_at set and raises.
  select * into v_session
  from public.cash_sessions
  where id = p_session_id
    and business_id = public.auth_business_id()
  for update;

  if v_session.id is null then
    raise exception 'Caja no encontrada.' using errcode = 'no_data_found';
  end if;
  if v_session.closed_at is not null then
    raise exception 'La caja ya está cerrada.' using errcode = 'check_violation';
  end if;

  select v_session.opening_float_cents
       + coalesce((
           select sum(p.collected_cents)
           from public.order_payments p
           where p.cash_session_id = p_session_id and p.method = 'cash'
         ), 0)
       + coalesce((
           select sum(case when m.kind = 'income' then m.amount_cents else -m.amount_cents end)
           from public.cash_movements m
           where m.cash_session_id = p_session_id
         ), 0)
    into v_expected;

  update public.cash_sessions
  set closed_by = auth.uid(),
      closed_at = now(),
      counted_cents = p_counted_cents,
      expected_cents = v_expected,
      difference_cents = p_counted_cents - v_expected,
      notes = p_notes
  where id = p_session_id
  returning * into v_session;

  return v_session;
end;
$$;

grant execute on function public.close_cash_session(uuid, integer, text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS. Every policy is gated on the module, so turning the flag off makes the
-- tables read as empty rather than leaving a half-visible feature behind.
-- No anon policies at all: none of this reaches the public menu.
-- ---------------------------------------------------------------------------

alter table public.cash_sessions enable row level security;
alter table public.cash_movements enable row level security;
alter table public.order_payments enable row level security;

create policy cash_sessions_staff_read on public.cash_sessions
  for select to authenticated
  using (
    public.is_superadmin()
    or (
      business_id = public.auth_business_id()
      and public.business_has_module(business_id, 'cash_register')
    )
  );

-- Cashiers included: working the drawer is the job this module exists for.
create policy cash_sessions_staff_write on public.cash_sessions
  for all to authenticated
  using (
    business_id = public.auth_business_id()
    and public.business_has_module(business_id, 'cash_register')
    and public.auth_user_role() in ('owner', 'manager', 'cashier')
  )
  with check (
    business_id = public.auth_business_id()
    and public.business_has_module(business_id, 'cash_register')
    and public.auth_user_role() in ('owner', 'manager', 'cashier')
  );

create policy cash_movements_staff_read on public.cash_movements
  for select to authenticated
  using (
    public.is_superadmin()
    or (
      business_id = public.auth_business_id()
      and public.business_has_module(business_id, 'cash_register')
    )
  );

create policy cash_movements_staff_write on public.cash_movements
  for all to authenticated
  using (
    business_id = public.auth_business_id()
    and public.business_has_module(business_id, 'cash_register')
    and public.auth_user_role() in ('owner', 'manager', 'cashier')
  )
  with check (
    business_id = public.auth_business_id()
    and public.business_has_module(business_id, 'cash_register')
    and public.auth_user_role() in ('owner', 'manager', 'cashier')
  );

create policy order_payments_staff_read on public.order_payments
  for select to authenticated
  using (
    public.is_superadmin()
    or (
      business_id = public.auth_business_id()
      and public.business_has_module(business_id, 'cash_register')
    )
  );

create policy order_payments_staff_write on public.order_payments
  for all to authenticated
  using (
    business_id = public.auth_business_id()
    and public.business_has_module(business_id, 'cash_register')
    and public.auth_user_role() in ('owner', 'manager', 'cashier')
  )
  with check (
    business_id = public.auth_business_id()
    and public.business_has_module(business_id, 'cash_register')
    and public.auth_user_role() in ('owner', 'manager', 'cashier')
  );
