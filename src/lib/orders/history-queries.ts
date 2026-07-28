import type { SupabaseClient } from "@supabase/supabase-js";

import type { BoardOrder, BoardOrderItem, BoardOrderOption } from "@/lib/orders/board-queries";
import type { FulfillmentType, OrderStatus } from "@/lib/orders/status";
import type { Database } from "@/types/database";

const HISTORY_LIMIT = 300;

export interface HistoryFilters {
  startIso: string;
  endIsoExclusive: string;
  status?: OrderStatus;
  fulfillment?: FulfillmentType;
}

/**
 * Same item/option shaping as board-queries.fetchBoardOrders, but over an
 * arbitrary date range and every status — the board only ever loads active
 * orders, this is where "what happened last Friday" lives.
 */
export async function fetchOrderHistory(
  supabase: SupabaseClient<Database>,
  businessId: string,
  filters: HistoryFilters,
): Promise<BoardOrder[]> {
  let query = supabase
    .from("orders")
    .select("*")
    .eq("business_id", businessId)
    .gte("created_at", filters.startIso)
    .lt("created_at", filters.endIsoExclusive)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.fulfillment) query = query.eq("fulfillment_type", filters.fulfillment);

  const { data: orders, error } = await query;
  if (error) throw new Error(`fetchOrderHistory: ${error.message}`);
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds)
    .order("sort_order", { ascending: true });

  const itemIds = (items ?? []).map((i) => i.id);
  const { data: options } =
    itemIds.length > 0
      ? await supabase.from("order_item_options").select("*").in("order_item_id", itemIds)
      : { data: [] };

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

export interface DailySummary {
  orderCount: number;
  completedCount: number;
  revenueCents: number;
  averageTicketCents: number;
  cancelledCount: number;
}

/** Facturación = only orders that actually completed — the rest never became real sales. */
export function summarizeOrders(orders: BoardOrder[]): DailySummary {
  const completed = orders.filter((o) => o.status === "completed");
  const revenueCents = completed.reduce((sum, o) => sum + o.total_cents, 0);

  return {
    orderCount: orders.length,
    completedCount: completed.length,
    revenueCents,
    averageTicketCents: completed.length > 0 ? Math.round(revenueCents / completed.length) : 0,
    cancelledCount: orders.filter((o) => o.status === "cancelled").length,
  };
}
