-- ===========================================================================
-- Menu import from a photo or PDF of the printed carta.
--
-- Paid by the platform, NOT the local: it does not count toward the local's
-- AI photo quota (ai_image_generations). Every read of a carta gets a row
-- here anyway, so the spend is auditable per local and the monthly cap
-- (MENU_IMPORTS_MONTHLY_CAP in src/lib/menu/import.ts) has something to count.
--
-- Cost in USD millionths (micros): a carta read costs fractions of a cent, so
-- millis would round every row to 0.
-- ===========================================================================

create table public.menu_imports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  file_count integer not null check (file_count > 0),
  model text not null,
  cost_usd_micros integer not null default 0 check (cost_usd_micros >= 0),
  products_found integer not null default 0,
  created_at timestamptz not null default now()
);

create index menu_imports_business_created_idx
  on public.menu_imports (business_id, created_at desc);

alter table public.menu_imports enable row level security;

-- Read-only for the local's staff and the superadmin. Writes only through the
-- server action with the admin client, after it has checked the caller.
create policy menu_imports_staff_read on public.menu_imports
  for select to authenticated
  using (business_id = public.auth_business_id() or public.is_superadmin());
