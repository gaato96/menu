-- ===========================================================================
-- Tenant resolution via JWT claims
--
-- Why not read `profiles` inside each RLS policy: that costs a subquery per row
-- checked and, on `profiles` itself, recurses. Instead a Custom Access Token
-- Hook stamps business_id and the staff role into the JWT at sign-in, and every
-- policy reads them for free.
--
-- The claim is called `user_role`, NOT `role`. PostgREST reserves the `role`
-- claim to switch the Postgres role it connects as — putting 'owner' there
-- would try to SET ROLE owner and break every request.
-- ===========================================================================

create or replace function public.auth_business_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'business_id', '')::uuid;
$$;

create or replace function public.auth_user_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'user_role', '');
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'user_role', '') = 'superadmin';
$$;

/**
 * True when this business may serve its public menu.
 *
 * `past_due` is deliberately still servable: nobody shuts a restaurant down on
 * a Friday night because a bank transfer arrived late. Only an explicit
 * `suspended` closes the doors.
 */
create or replace function public.business_is_servable(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses b
    join public.subscriptions s on s.business_id = b.id
    where b.id = p_business_id
      and b.status = 'active'
      and s.status in ('trial', 'active', 'past_due')
  );
$$;

-- ---------------------------------------------------------------------------
-- The hook itself. Runs as supabase_auth_admin on every token issue/refresh.
-- ---------------------------------------------------------------------------

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_claims jsonb;
  v_business_id uuid;
  v_role text;
  v_is_active boolean;
begin
  select p.business_id, p.role, p.is_active
    into v_business_id, v_role, v_is_active
  from public.profiles p
  where p.id = (event ->> 'user_id')::uuid;

  v_claims := coalesce(event -> 'claims', '{}'::jsonb);

  -- A deactivated employee keeps a valid Supabase session but loses the claims,
  -- so every tenant policy stops matching and they see nothing.
  if v_role is null or v_is_active is not true then
    v_claims := jsonb_set(v_claims, '{user_role}', to_jsonb(''::text));
    v_claims := jsonb_set(v_claims, '{business_id}', 'null'::jsonb);
  else
    v_claims := jsonb_set(v_claims, '{user_role}', to_jsonb(v_role));
    v_claims := jsonb_set(
      v_claims,
      '{business_id}',
      case
        when v_business_id is null then 'null'::jsonb
        else to_jsonb(v_business_id::text)
      end
    );
  end if;

  return jsonb_set(event, '{claims}', v_claims);
end;
$$;

-- The hook runs as supabase_auth_admin, which needs to reach profiles.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb)
  from authenticated, anon, public;
grant select on public.profiles to supabase_auth_admin;
