-- ===========================================================================
-- Module gating
--
-- business_modules has existed since the core schema, but nothing ever read
-- it: no route was protected, no policy checked it. This is the single
-- function every later module migration (inventory, crm, tables) calls from
-- its own restrictive write policies, plus what src/lib/auth/context.ts calls
-- from the app side.
--
-- STABLE, not IMMUTABLE: enabling a module must be visible without a schema
-- change. SECURITY DEFINER because anon needs to evaluate this against
-- business_modules, a table anon has no direct read policy on.
-- ===========================================================================

create or replace function public.business_has_module(p_business_id uuid, p_module_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_modules m
    where m.business_id = p_business_id
      and m.module_key = p_module_key
      and m.enabled
  );
$$;

grant execute on function public.business_has_module(uuid, text) to anon, authenticated;
