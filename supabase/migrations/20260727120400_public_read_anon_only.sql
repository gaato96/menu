-- ===========================================================================
-- Restrict public menu reads to the `anon` role.
--
-- Found by tests/rls/isolation.test.ts: policies are OR'd, so granting public
-- read to `anon, authenticated` meant a logged-in cashier's
-- `from("products").select()` returned every business's menu, not their own.
--
-- No private data was exposed — menus are public by definition, and orders,
-- profiles and subscriptions were correctly isolated. The problem is that it
-- pushed tenant scoping back into application code, which is exactly what this
-- schema exists to avoid: one forgotten `.eq("business_id", ...)` in the panel
-- and a shop is editing someone else's menu.
--
-- Safe because public menu pages are server-rendered with a cookie-less client
-- (see createPublicClient in src/lib/supabase/server.ts), so they hit Postgres
-- as `anon` regardless of who is browsing. Staff keep access to their own
-- business through the *_staff_read policies, and the superadmin through
-- is_superadmin().
-- ===========================================================================

drop policy businesses_public_read on public.businesses;

create policy businesses_public_read on public.businesses
  for select to anon
  using (public.business_is_servable(id));

do $$
declare
  t text;
begin
  foreach t in array array[
    'business_settings', 'business_hours', 'categories',
    'products', 'option_groups', 'options', 'delivery_zones'
  ]
  loop
    execute format('drop policy %1$I_public_read on public.%1$I;', t);

    execute format($f$
      create policy %1$I_public_read on public.%1$I
        for select to anon
        using (public.business_is_servable(business_id));
    $f$, t);
  end loop;
end;
$$;
