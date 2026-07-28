import type { SupabaseClient } from "@supabase/supabase-js";

import { ACTIVE_STATUSES } from "@/lib/orders/status";
import type { Database, Tables } from "@/types/database";

/**
 * Shared shape + fetch for "active orders with their line items", used both
 * for the server-rendered initial board state and the browser's realtime
 * refetch — one definition, so the first paint and every refresh agree.
 *
 * Separate queries rather than a PostgREST embed: the hand-authored Database
 * type carries no Relationships metadata (see src/types/database.ts), so
 * supabase-js can't infer array-vs-single shape for an embed. Same pattern as
 * create-order.ts.
 */

export interface BoardOrderOption {
  groupName: string;
  optionName: string;
  priceDeltaCents: number;
}

export interface BoardOrderItem {
  id: string;
  productName: string;
  quantity: number;
  itemNotes: string | null;
  lineTotalCents: number;
  options: BoardOrderOption[];
}

export interface BoardOrder extends Tables<"orders"> {
  items: BoardOrderItem[];
}

export async function fetchBoardOrders(
  supabase: SupabaseClient<Database>,
  businessId: string,
): Promise<BoardOrder[]> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", businessId)
    .in("status", ACTIVE_STATUSES)
    .order("created_at", { ascending: true });

  if (ordersError) throw new Error(`fetchBoardOrders: ${ordersError.message}`);
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds)
    .order("sort_order", { ascending: true });

  if (itemsError) throw new Error(`fetchBoardOrders items: ${itemsError.message}`);

  const itemIds = (items ?? []).map((i) => i.id);
  const { data: options, error: optionsError } =
    itemIds.length > 0
      ? await supabase.from("order_item_options").select("*").in("order_item_id", itemIds)
      : { data: [], error: null };

  if (optionsError) throw new Error(`fetchBoardOrders options: ${optionsError.message}`);

  const optionsByItem = new Map<string, BoardOrderOption[]>();
  for (const option of options ?? []) {
    const list = optionsByItem.get(option.order_item_id) ?? [];
    list.push({
      groupName: option.group_name,
      optionName: option.option_name,
      priceDeltaCents: option.price_delta_cents,
    });
    optionsByItem.set(option.order_item_id, list);
  }

  const itemsByOrder = new Map<string, BoardOrderItem[]>();
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      itemNotes: item.item_notes,
      lineTotalCents: item.line_total_cents,
      options: optionsByItem.get(item.id) ?? [],
    });
    itemsByOrder.set(item.order_id, list);
  }

  return orders.map((order) => ({ ...order, items: itemsByOrder.get(order.id) ?? [] }));
}

/** Items + options for a single order — used when a Realtime INSERT lands. */
export async function fetchOrderItems(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<BoardOrderItem[]> {
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("sort_order", { ascending: true });

  if (!items || items.length === 0) return [];

  const { data: options } = await supabase
    .from("order_item_options")
    .select("*")
    .in(
      "order_item_id",
      items.map((i) => i.id),
    );

  const optionsByItem = new Map<string, BoardOrderOption[]>();
  for (const option of options ?? []) {
    const list = optionsByItem.get(option.order_item_id) ?? [];
    list.push({
      groupName: option.group_name,
      optionName: option.option_name,
      priceDeltaCents: option.price_delta_cents,
    });
    optionsByItem.set(option.order_item_id, list);
  }

  return items.map((item) => ({
    id: item.id,
    productName: item.product_name,
    quantity: item.quantity,
    itemNotes: item.item_notes,
    lineTotalCents: item.line_total_cents,
    options: optionsByItem.get(item.id) ?? [],
  }));
}
