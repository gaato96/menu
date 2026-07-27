-- ===========================================================================
-- Atomic order creation.
--
-- The order endpoint (Next.js server, using the service-role client) re-prices
-- the cart from the database with src/lib/pricing.ts, then calls this ONE
-- function with the fully-priced payload. Order + items + option selections
-- land in a single transaction — a Postgres function body runs in the calling
-- transaction, so there is no window where a comanda exists on the board with
-- no items because a second or third insert failed.
--
-- SECURITY DEFINER, and revoked from anon/authenticated below: this is only
-- ever called by the trusted server using the service-role key, the same
-- pattern documented in src/lib/supabase/admin.ts. A diner's browser calling
-- this directly would bypass pricing entirely, which is exactly what the
-- browser-never-sends-prices design in pricing.ts exists to prevent.
-- ===========================================================================

create or replace function public.create_priced_order(p_business_id uuid, p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_code text;
  v_item jsonb;
  v_item_id uuid;
  v_option jsonb;
  v_existing record;
begin
  -- Idempotency: a double-tapped submit button must not create two orders.
  -- Returning the existing one is a normal, silent outcome here, not an error.
  select id, code into v_existing
  from public.orders
  where business_id = p_business_id
    and idempotency_key = p_order ->> 'idempotency_key';

  if found then
    return jsonb_build_object('id', v_existing.id, 'code', v_existing.code, 'reused', true);
  end if;

  v_code := public.next_order_code(p_business_id);

  insert into public.orders (
    business_id, code, fulfillment_type, customer_name, customer_phone,
    address, address_reference, delivery_zone_id, payment_method,
    cash_change_for_cents, notes, subtotal_cents, delivery_fee_cents,
    total_cents, idempotency_key
  ) values (
    p_business_id,
    v_code,
    p_order ->> 'fulfillment_type',
    p_order ->> 'customer_name',
    p_order ->> 'customer_phone',
    p_order ->> 'address',
    p_order ->> 'address_reference',
    nullif(p_order ->> 'delivery_zone_id', '')::uuid,
    p_order ->> 'payment_method',
    nullif(p_order ->> 'cash_change_for_cents', '')::integer,
    p_order ->> 'notes',
    (p_order ->> 'subtotal_cents')::integer,
    (p_order ->> 'delivery_fee_cents')::integer,
    (p_order ->> 'total_cents')::integer,
    p_order ->> 'idempotency_key'
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_order -> 'items')
  loop
    insert into public.order_items (
      business_id, order_id, product_id, product_name,
      unit_base_price_cents, quantity, item_notes, line_total_cents, sort_order
    ) values (
      p_business_id,
      v_order_id,
      nullif(v_item ->> 'product_id', '')::uuid,
      v_item ->> 'product_name',
      (v_item ->> 'unit_base_price_cents')::integer,
      (v_item ->> 'quantity')::integer,
      v_item ->> 'item_notes',
      (v_item ->> 'line_total_cents')::integer,
      coalesce((v_item ->> 'sort_order')::integer, 0)
    )
    returning id into v_item_id;

    for v_option in select * from jsonb_array_elements(coalesce(v_item -> 'options', '[]'::jsonb))
    loop
      insert into public.order_item_options (
        business_id, order_item_id, option_id, group_name, option_name, price_delta_cents
      ) values (
        p_business_id,
        v_item_id,
        nullif(v_option ->> 'option_id', '')::uuid,
        v_option ->> 'group_name',
        v_option ->> 'option_name',
        coalesce((v_option ->> 'price_delta_cents')::integer, 0)
      );
    end loop;
  end loop;

  return jsonb_build_object('id', v_order_id, 'code', v_code, 'reused', false);
end;
$$;

revoke execute on function public.create_priced_order(uuid, jsonb) from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Registers or refreshes a Web Push device. Kept as an atomic upsert (rather
-- than plain client-side insert) so re-subscribing after a browser clears its
-- push endpoint updates the existing row instead of accumulating dead ones.
--
-- SECURITY DEFINER and service-role only, same reasoning as above: it does not
-- check that p_profile_id/p_business_id match the caller, so it must only be
-- reachable from POST /api/push/subscribe (Fase 2), which resolves those from
-- the staff member's own session server-side before calling this.
-- ---------------------------------------------------------------------------

create or replace function public.upsert_push_subscription(
  p_business_id uuid,
  p_profile_id uuid,
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.push_subscriptions (business_id, profile_id, endpoint, p256dh, auth, user_agent)
  values (p_business_id, p_profile_id, p_endpoint, p_p256dh, p_auth, p_user_agent)
  on conflict (endpoint) do update
    set business_id = excluded.business_id,
        profile_id = excluded.profile_id,
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        user_agent = excluded.user_agent,
        last_seen_at = now();
$$;

revoke execute on function public.upsert_push_subscription(uuid, uuid, text, text, text, text)
  from anon, authenticated;
