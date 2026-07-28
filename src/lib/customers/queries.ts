import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { BoardOrder, BoardOrderItem, BoardOrderOption } from "@/lib/orders/board-queries";
import type { Database, Views } from "@/types/database";

const ORDERS_LIMIT = 100;

export async function fetchCustomers(
  supabase: SupabaseClient<Database>,
  businessId: string,
): Promise<Views<"customer_stats">[]> {
  const { data, error } = await supabase
    .from("customer_stats")
    .select("*")
    .eq("business_id", businessId)
    .order("last_order_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(`fetchCustomers: ${error.message}`);
  return data ?? [];
}

export async function fetchCustomer(
  supabase: SupabaseClient<Database>,
  businessId: string,
  customerId: string,
): Promise<Views<"customer_stats"> | null> {
  const { data } = await supabase
    .from("customer_stats")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .maybeSingle();
  return data ?? null;
}

/**
 * One customer's order history — same item/option shaping as
 * board-queries.fetchBoardOrders and history-queries.fetchOrderHistory, just
 * filtered by customer rather than status or date range.
 */
export async function fetchCustomerOrders(
  supabase: SupabaseClient<Database>,
  businessId: string,
  customerId: string,
): Promise<BoardOrder[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(ORDERS_LIMIT);

  if (error) throw new Error(`fetchCustomerOrders: ${error.message}`);
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
