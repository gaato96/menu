-- ===========================================================================
-- Branding images + catalog scroll toggle.
--
-- Same storage pattern as 20260728000000_product_images_bucket.sql: public
-- read bucket, no storage.objects RLS, every write goes through a Server
-- Action using the ADMIN client after verifying the caller's staff session.
-- ===========================================================================

alter table public.businesses add column cover_image_url text;
alter table public.business_settings
  add column catalog_view_enabled boolean not null default false;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-images',
  'business-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
