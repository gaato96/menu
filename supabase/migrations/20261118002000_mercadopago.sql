-- ===========================================================================
-- Mercado Pago checkout (module `mercadopago`).
--
-- Each local charges into ITS OWN Mercado Pago account: the owner pastes the
-- Access Token of their production credentials once, in /panel/config. The
-- token lives in its own table with RLS on and NO policies — only the service
-- role reads it, never the browser, never the anon menu (which does read
-- business_settings).
--
-- A payment is only ever marked paid after the server fetched it from Mercado
-- Pago with that local's token (webhook or return URL alike). The webhook
-- body itself is never trusted, so a forged notification changes nothing.
-- ===========================================================================

create table public.business_mp_credentials (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  access_token text not null check (length(access_token) > 20),
  mp_user_id text,
  mp_nickname text,
  connected_at timestamptz not null default now()
);

alter table public.business_mp_credentials enable row level security;
-- Deliberately no policies.

alter table public.business_settings
  add column mercadopago_enabled boolean not null default false;

alter table public.orders
  drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
    check (payment_method in ('cash', 'transfer', 'mercadopago'));

alter table public.orders
  add column mp_preference_id text;
