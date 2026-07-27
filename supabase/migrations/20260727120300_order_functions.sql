-- ===========================================================================
-- Order code generation, status guards and realtime
-- ===========================================================================

/**
 * Atomic per-business, per-day order code: "P-0142".
 *
 * The date is computed in the BUSINESS's timezone, not UTC. Tucumán is UTC-3,
 * so a UTC-based counter would roll over at 21:00 local — right in the middle
 * of the dinner rush, which is exactly when a jump in numbering gets noticed.
 *
 * SECURITY DEFINER because order_counters is closed to clients by RLS.
 */
create or replace function public.next_order_code(p_business_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_timezone text;
  v_name text;
  v_prefix text;
  v_date date;
  v_number integer;
begin
  select b.timezone, b.name
    into v_timezone, v_name
  from public.businesses b
  where b.id = p_business_id;

  if v_timezone is null then
    raise exception 'Business % does not exist', p_business_id;
  end if;

  v_date := (now() at time zone v_timezone)::date;

  insert into public.order_counters (business_id, business_date, last_number)
  values (p_business_id, v_date, 1)
  on conflict (business_id, business_date)
    do update set last_number = public.order_counters.last_number + 1
  returning last_number into v_number;

  -- First letter of the business name, so a cashier reading "P-0142" over the
  -- phone knows it is theirs. Falls back to 'P' for names that start with a
  -- digit or symbol.
  v_prefix := upper(substring(regexp_replace(v_name, '[^a-zA-Z]', '', 'g') from 1 for 1));

  return coalesce(nullif(v_prefix, ''), 'P') || '-' || lpad(v_number::text, 4, '0');
end;
$$;

revoke execute on function public.next_order_code(uuid) from anon, authenticated;

/**
 * Progress rank, mirroring src/lib/orders/status.ts.
 *
 * The duplication is deliberate: the TypeScript copy gives the API good error
 * messages, this one makes the rule hold even if someone calls PostgREST
 * directly with a staff token. Both must change together.
 */
create or replace function public.order_status_rank(p_status text)
returns integer
language sql
immutable
as $$
  select case p_status
    when 'pending_payment'  then 0
    when 'confirmed'        then 1
    when 'in_kitchen'       then 2
    when 'on_the_way'       then 3
    when 'ready_for_pickup' then 3
    when 'completed'        then 4
    when 'cancelled'        then -1
  end;
$$;

/**
 * Guards every order UPDATE and writes the audit trail.
 *
 * Auditing here rather than in the API means a status change is recorded no
 * matter which path produced it.
 */
create or replace function public.on_order_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := public.auth_user_role();
begin
  -- Snapshots are snapshots. Money and identity never change after checkout.
  if new.business_id is distinct from old.business_id
     or new.code is distinct from old.code
     or new.subtotal_cents is distinct from old.subtotal_cents
     or new.delivery_fee_cents is distinct from old.delivery_fee_cents
     or new.total_cents is distinct from old.total_cents
     or new.created_at is distinct from old.created_at then
    raise exception 'No se pueden modificar los importes ni el identificador de un pedido';
  end if;

  if new.status is distinct from old.status then
    -- A ready state has to match how the order leaves the shop, or a takeaway
    -- order sits in "en camino" forever waiting for a driver that never comes.
    if new.status = 'on_the_way' and new.fulfillment_type <> 'delivery' then
      raise exception 'Un pedido de retiro no puede pasar a En camino';
    end if;
    if new.status = 'ready_for_pickup' and new.fulfillment_type <> 'pickup' then
      raise exception 'Un pedido de delivery no puede pasar a Listo para retirar';
    end if;

    -- Moving forward is free. Going back or cancelling is a correction, and
    -- corrections belong to whoever is accountable for the shift.
    if v_role = 'cashier'
       and (new.status = 'cancelled'
            or public.order_status_rank(new.status) <= public.order_status_rank(old.status)) then
      raise exception 'Solo el encargado o el dueño pueden retroceder o cancelar un pedido';
    end if;

    new.status_changed_at := now();

    insert into public.order_status_events
      (business_id, order_id, from_status, to_status, changed_by)
    values
      (new.business_id, new.id, old.status, new.status, auth.uid());
  end if;

  return new;
end;
$$;

create trigger orders_update_guard
  before update on public.orders
  for each row execute function public.on_order_update();

-- Record the opening move so the audit trail starts at creation.
create or replace function public.on_order_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.order_status_events
    (business_id, order_id, from_status, to_status, changed_by)
  values
    (new.business_id, new.id, null, new.status, auth.uid());
  return new;
end;
$$;

create trigger orders_insert_audit
  after insert on public.orders
  for each row execute function public.on_order_insert();

-- ---------------------------------------------------------------------------
-- Realtime
--
-- REPLICA IDENTITY FULL so UPDATE and DELETE events carry the whole old row.
-- Without it the board cannot tell which column a card moved out of, and
-- business_id filters on those events do not match.
-- ---------------------------------------------------------------------------

alter table public.orders replica identity full;
alter publication supabase_realtime add table public.orders;
