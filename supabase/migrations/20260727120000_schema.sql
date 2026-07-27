-- ===========================================================================
-- Menú Digital — core schema
--
-- Conventions used throughout:
--   * Money is integer cents. Never numeric, never float.
--   * Enum-like columns are text + CHECK, not Postgres ENUM types. Adding
--     'dine_in' when the tables module ships must be a one-line migration.
--   * Every tenant table carries business_id and is protected by RLS.
--   * Child rows reference their parent through a composite (id, business_id)
--     foreign key, so a product can never point at another tenant's category
--     even if application code is wrong.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Businesses (tenants). One business = one location, by product decision.
-- ---------------------------------------------------------------------------

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  logo_url text,
  brand_color text not null default '#D1420A'
    check (brand_color ~* '^#[0-9a-f]{6}$'),
  -- Digits only, country code included: 5493811234567. wa.me rejects '+' and spaces.
  whatsapp_phone text not null check (whatsapp_phone ~ '^[0-9]{10,15}$'),
  address text,
  timezone text not null default 'America/Argentina/Tucuman',
  currency text not null default 'ARS',
  -- The "we're slammed, stop taking orders" switch. Independent of schedule.
  is_open_manual boolean not null default true,
  status text not null default 'active'
    check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Per-business operating settings (1:1). Kept out of `businesses` so the row
-- the public menu reads stays small and cacheable.
-- ---------------------------------------------------------------------------

create table public.business_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  delivery_enabled boolean not null default true,
  pickup_enabled boolean not null default true,
  min_order_cents integer not null default 0 check (min_order_cents >= 0),
  cash_enabled boolean not null default true,
  transfer_enabled boolean not null default false,
  transfer_alias text,
  transfer_cbu text,
  transfer_holder text,
  prep_time_minutes integer not null default 30 check (prep_time_minutes between 0 and 240),
  updated_at timestamptz not null default now(),
  -- Turning off both ways of receiving an order silently kills the menu.
  constraint at_least_one_fulfillment check (delivery_enabled or pickup_enabled),
  constraint at_least_one_payment check (cash_enabled or transfer_enabled),
  -- Transfer without an alias leaves the customer with nowhere to send money.
  constraint transfer_needs_destination
    check (not transfer_enabled or coalesce(transfer_alias, transfer_cbu) is not null)
);

create trigger business_settings_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Subscription. Billing is manual: the superadmin sets status and period end.
-- ---------------------------------------------------------------------------

create table public.subscriptions (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  plan text not null default 'base',
  status text not null default 'trial'
    check (status in ('trial', 'active', 'past_due', 'suspended')),
  current_period_end date,
  monthly_amount_cents integer check (monthly_amount_cents is null or monthly_amount_cents >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Premium module flags. Rows exist only for enabled modules.
-- ---------------------------------------------------------------------------

create table public.business_modules (
  business_id uuid not null references public.businesses(id) on delete cascade,
  module_key text not null check (module_key in (
    'crm_loyalty',
    'mercadopago',
    'kitchen_printing',
    'kitchen_display',
    'inventory',
    'tables'
  )),
  enabled boolean not null default true,
  enabled_at timestamptz not null default now(),
  primary key (business_id, module_key)
);

-- ---------------------------------------------------------------------------
-- Opening hours. Several ranges per day (lunch and dinner service).
-- ---------------------------------------------------------------------------

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  opens_at time not null,
  closes_at time not null,
  -- Kitchens close after midnight. 20:00-01:00 is normal and must be allowed,
  -- so equality is the only thing rejected here.
  constraint hours_not_empty check (opens_at <> closes_at)
);

create index business_hours_business_day_idx
  on public.business_hours (business_id, day_of_week);

-- ---------------------------------------------------------------------------
-- Staff. profiles.id mirrors auth.users.id.
-- business_id is null only for the superadmin.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  role text not null check (role in ('superadmin', 'owner', 'manager', 'cashier')),
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint superadmin_has_no_business
    check ((role = 'superadmin') = (business_id is null))
);

create index profiles_business_idx on public.profiles (business_id);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Menu
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, business_id)
);

create index categories_business_sort_idx
  on public.categories (business_id, sort_order);

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  description text,
  image_url text,
  base_price_cents integer not null check (base_price_cents >= 0),
  -- "Agotado" is a toggle, not a delete: tomorrow it is back on the menu.
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, business_id),
  foreign key (category_id, business_id)
    references public.categories (id, business_id) on delete cascade
);

create index products_business_category_idx
  on public.products (business_id, category_id, sort_order);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Variant / extras groups: "Tamaño" (single, required), "Agregados" (multiple).
create table public.option_groups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  selection_type text not null check (selection_type in ('single', 'multiple')),
  is_required boolean not null default false,
  min_select integer not null default 0 check (min_select >= 0),
  max_select integer check (max_select is null or max_select > 0),
  sort_order integer not null default 0,
  unique (id, business_id),
  foreign key (product_id, business_id)
    references public.products (id, business_id) on delete cascade,
  constraint min_not_above_max
    check (max_select is null or min_select <= max_select),
  -- A required group the customer can satisfy with zero picks is a bug.
  constraint required_implies_min
    check (not is_required or min_select >= 1),
  constraint single_select_caps_at_one
    check (selection_type <> 'single' or coalesce(max_select, 1) = 1)
);

create index option_groups_product_idx
  on public.option_groups (business_id, product_id, sort_order);

create table public.options (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  option_group_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  -- Positive for paid extras, 0 for "sin cebolla", negative is allowed for
  -- a discount but never below the product price (enforced at pricing time).
  price_delta_cents integer not null default 0,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  unique (id, business_id),
  foreign key (option_group_id, business_id)
    references public.option_groups (id, business_id) on delete cascade
);

create index options_group_idx
  on public.options (business_id, option_group_id, sort_order);

-- ---------------------------------------------------------------------------
-- Delivery zones
-- ---------------------------------------------------------------------------

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  fee_cents integer not null default 0 check (fee_cents >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  unique (id, business_id)
);

create index delivery_zones_business_idx
  on public.delivery_zones (business_id, sort_order);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  code text not null,
  status text not null default 'pending_payment' check (status in (
    'pending_payment', 'confirmed', 'in_kitchen',
    'on_the_way', 'ready_for_pickup', 'completed', 'cancelled'
  )),
  -- 'dine_in' joins this list when the tables module ships.
  fulfillment_type text not null check (fulfillment_type in ('delivery', 'pickup')),

  customer_name text not null check (length(trim(customer_name)) > 0),
  customer_phone text not null check (length(trim(customer_phone)) > 0),
  address text,
  address_reference text,
  delivery_zone_id uuid,

  payment_method text not null check (payment_method in ('cash', 'transfer')),
  cash_change_for_cents integer
    check (cash_change_for_cents is null or cash_change_for_cents >= 0),
  notes text,

  subtotal_cents integer not null check (subtotal_cents >= 0),
  delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0),
  total_cents integer not null check (total_cents >= 0),

  -- Set when the customer actually reaches WhatsApp. Null means the order is
  -- real but the customer never sent the message — the board flags it.
  whatsapp_opened_at timestamptz,
  -- Guards against double taps and customer retries.
  idempotency_key text not null,

  cancel_reason text,
  created_at timestamptz not null default now(),
  status_changed_at timestamptz not null default now(),

  -- Reserved for premium modules. Nullable now so enabling them later is
  -- additive rather than a destructive migration.
  customer_id uuid,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed')),
  external_payment_id text,
  table_id uuid,

  unique (business_id, code),
  unique (business_id, idempotency_key),
  unique (id, business_id),
  foreign key (delivery_zone_id, business_id)
    references public.delivery_zones (id, business_id),

  constraint delivery_requires_address
    check (fulfillment_type <> 'delivery' or nullif(trim(coalesce(address, '')), '') is not null),
  constraint change_only_for_cash
    check (cash_change_for_cents is null or payment_method = 'cash'),
  constraint pickup_has_no_delivery_fee
    check (fulfillment_type = 'delivery' or delivery_fee_cents = 0),
  -- The acceptance criterion "totals match to the cent" enforced in the database
  -- rather than trusted to the application.
  constraint totals_add_up
    check (total_cents = subtotal_cents + delivery_fee_cents)
);

-- The board's main query: active orders for one business, newest first.
create index orders_board_idx
  on public.orders (business_id, status, created_at desc);

create index orders_history_idx
  on public.orders (business_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Order line items. Names and prices are SNAPSHOTS: if the owner raises the
-- price of the muzzarella on Saturday, Friday's orders must not change.
-- ---------------------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid not null,
  -- Kept for future analytics; nulled rather than cascading if a product is
  -- deleted, because the order must survive the menu changing.
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_base_price_cents integer not null check (unit_base_price_cents >= 0),
  quantity integer not null check (quantity between 1 and 99),
  item_notes text,
  -- (base + sum of option deltas) * quantity
  line_total_cents integer not null check (line_total_cents >= 0),
  sort_order integer not null default 0,
  unique (id, business_id),
  foreign key (order_id, business_id)
    references public.orders (id, business_id) on delete cascade
);

create index order_items_order_idx on public.order_items (order_id, sort_order);

create table public.order_item_options (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_item_id uuid not null,
  option_id uuid references public.options(id) on delete set null,
  group_name text not null,
  option_name text not null,
  price_delta_cents integer not null default 0,
  foreign key (order_item_id, business_id)
    references public.order_items (id, business_id) on delete cascade
);

create index order_item_options_item_idx
  on public.order_item_options (order_item_id);

-- ---------------------------------------------------------------------------
-- Status audit trail. Doubles as the data source for real kitchen timings
-- without any extra instrumentation.
-- ---------------------------------------------------------------------------

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid not null,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (order_id, business_id)
    references public.orders (id, business_id) on delete cascade
);

create index order_status_events_order_idx
  on public.order_status_events (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Daily order counter, per business, in the business's own timezone.
-- ---------------------------------------------------------------------------

create table public.order_counters (
  business_id uuid not null references public.businesses(id) on delete cascade,
  business_date date not null,
  last_number integer not null default 0,
  primary key (business_id, business_date)
);

-- ---------------------------------------------------------------------------
-- Web Push devices. One installed PWA = one row.
-- ---------------------------------------------------------------------------

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index push_subscriptions_business_idx
  on public.push_subscriptions (business_id);
