-- ===========================================================================
-- AI dish photos — audit log and monthly quota.
--
-- Not gated by a module flag: generating a decent photo is part of loading a
-- menu, which every install needs. What is gated is the SPEND — each call
-- costs real money at Gemini, so every attempt gets a row here whether the
-- owner keeps the result or not. Counting only accepted images would let a
-- business generate two hundred and discard a hundred and ninety-nine at no
-- apparent cost.
--
-- Cost is stored in USD thousandths (millis) as an integer, following the
-- same "money is never a float" rule as *_cents everywhere else. US$0.067
-- per 1K image is 67.
-- ===========================================================================

create table public.ai_image_generations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  -- Kept when the product is deleted: the money was still spent, and the
  -- month's quota must not reset because someone removed a dish.
  product_id uuid references public.products(id) on delete set null,
  -- Which prompt produced this. Lets the prompt change without losing the
  -- ability to tell which version generated an image already on a menu.
  prompt_variant text not null,
  cost_usd_millis integer not null check (cost_usd_millis >= 0),
  -- Where the candidate landed in the product-images bucket. Held server-side
  -- precisely so accept/discard take only a generation id: a path travelling
  -- through the browser would let a caller point the swap at another file.
  -- Null once discarded, since the object is gone.
  storage_path text,
  -- False until the owner picks it. Rows stay either way — see header.
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

-- Serves the quota count, which is always "this business, this month".
create index ai_image_generations_business_created_idx
  on public.ai_image_generations (business_id, created_at desc);

alter table public.ai_image_generations enable row level security;

-- No anon policy at all: this table never reaches the public menu.
create policy ai_image_generations_staff_read on public.ai_image_generations
  for select to authenticated
  using (business_id = public.auth_business_id() or public.is_superadmin());

-- Writes go through the Server Action using the admin client (same trust
-- boundary as uploadProductImage), so staff never insert directly. The policy
-- exists anyway so a future direct write cannot cross tenants.
create policy ai_image_generations_staff_write on public.ai_image_generations
  for all to authenticated
  using (
    public.is_superadmin()
    or (business_id = public.auth_business_id() and public.auth_user_role() in ('owner', 'manager'))
  )
  with check (
    public.is_superadmin()
    or (business_id = public.auth_business_id() and public.auth_user_role() in ('owner', 'manager'))
  );

-- ---------------------------------------------------------------------------
-- Quota used this calendar month, in the business's own timezone.
--
-- The month boundary matters: a business in Tucumán at 22:00 on the 31st is
-- already on the 1st in UTC, and a quota that resets a day early is a support
-- call. businesses.timezone is the same column the order board formats with.
--
-- STABLE + SECURITY DEFINER for the same reason as business_has_module: the
-- caller must be able to read its own count without a direct table grant.
-- ---------------------------------------------------------------------------

create or replace function public.ai_images_used_this_month(p_business_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.ai_image_generations g
  join public.businesses b on b.id = g.business_id
  where g.business_id = p_business_id
    and g.created_at >= date_trunc('month', now() at time zone b.timezone)
                        at time zone b.timezone;
$$;

grant execute on function public.ai_images_used_this_month(uuid) to authenticated;
