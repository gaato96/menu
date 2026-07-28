-- ===========================================================================
-- Storage bucket for product photos.
--
-- Public read (menu photos are public by definition — next.config.ts already
-- expects /storage/v1/object/public/**). No storage.objects RLS policies:
-- every write goes through a Server Action using the ADMIN client after
-- verifying the caller's staff session server-side (src/app/(panel)/panel/menu),
-- the same pattern already used for order creation and push. That sidesteps
-- storage RLS entirely rather than half-configuring it under time pressure.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
