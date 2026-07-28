import type { SupabaseClient } from "@supabase/supabase-js";

import { type BoardOrder, fetchBoardOrders } from "@/lib/orders/board-queries";
import type { Database } from "@/types/database";

/**
 * The cooking queue: orders a cook needs to act on. `pending_payment` isn't
 * cocina's problem yet (nobody has said yes to the order), and anything past
 * `in_kitchen` already left the kitchen's hands — that is dispatch, the
 * board's job. Same underlying data as the board (one status machine, see
 * status.ts), just a narrower slice of it.
 */
const KITCHEN_STATUSES = new Set(["confirmed", "in_kitchen"]);

export function isKitchenOrder(order: Pick<BoardOrder, "status">): boolean {
  return KITCHEN_STATUSES.has(order.status);
}

export async function fetchKitchenOrders(
  supabase: SupabaseClient<Database>,
  businessId: string,
): Promise<BoardOrder[]> {
  const orders = await fetchBoardOrders(supabase, businessId);
  return orders.filter(isKitchenOrder);
}
