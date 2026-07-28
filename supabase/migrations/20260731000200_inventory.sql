-- ===========================================================================
-- Inventory module — stock by product, no recipes, no per-option stock.
--
-- stock_quantity is nullable and defaults to null: an existing product with
-- no tracking behaves exactly as it did before this migration. A business
-- opts a product INTO tracking by setting a number.
-- ===========================================================================

alter table public.products
  add column stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  add column low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0);

alter table public.orders
  add column stock_applied boolean not null default false;

-- ---------------------------------------------------------------------------
-- Applies (or reverts) stock the first time an order's status crosses out of
-- pending_payment, exactly once per order (stock_applied is the marker).
--
-- A sibling of orders_update_guard, not folded into on_order_update(): that
-- function's own header documents its contract as "SQL and status.ts change
-- together" — mixing an unrelated concern like stock into it would widen that
-- contract for no reason. Trigger firing order on the same table+event is
-- alphabetical by name, and 'orders_update_guard' < 'orders_update_stock', so
-- the guard validates the transition (and can still raise/abort it) before
-- this ever runs.
-- ---------------------------------------------------------------------------

create or replace function public.apply_stock_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    -- Confirmed (or anything further forward, since a skip is legal) takes
    -- stock. Never at creation: a pending_payment order is not a commitment
    -- yet, and reserving stock for a cart that never gets confirmed would
    -- starve real orders behind it.
    if not old.stock_applied and new.status not in ('pending_payment', 'cancelled') then
      update public.products p
      set stock_quantity = greatest(0, p.stock_quantity - oi.quantity),
          -- Only ever flips to false here. Flipping it back to true belongs
          -- to the owner alone — an automatic republish the moment a
          -- cancellation returns stock could put an item back on the menu
          -- at 1am for a reason the owner marked it unavailable that has
          -- nothing to do with this counter.
          is_available = case
            when greatest(0, p.stock_quantity - oi.quantity) <= 0 then false
            else p.is_available
          end
      from public.order_items oi
      where oi.order_id = new.id
        and oi.product_id = p.id
        and p.stock_quantity is not null;

      new.stock_applied := true;

    elsif new.status = 'cancelled' and old.stock_applied then
      update public.products p
      set stock_quantity = p.stock_quantity + oi.quantity
      from public.order_items oi
      where oi.order_id = new.id
        and oi.product_id = p.id
        and p.stock_quantity is not null;

      new.stock_applied := false;
    end if;
  end if;

  return new;
end;
$$;

create trigger orders_update_stock
  before update on public.orders
  for each row execute function public.apply_stock_change();
