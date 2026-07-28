"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { OrderStatus } from "@/lib/orders/status";
import type { Database } from "@/types/database";

/**
 * Moves an order to a new status via the session-scoped Supabase client —
 * not an API route. RLS (`orders_staff_update`) scopes it to the caller's own
 * business, and the `orders_update_guard` trigger is the actual authority on
 * which transitions a role may make; it raises a Spanish, user-facing message
 * on rejection (cashier trying to cancel, wrong fulfillment for the ready
 * column, etc.), which this just relays.
 */
export async function updateOrderStatus(
  supabase: SupabaseClient<Database>,
  orderId: string,
  status: OrderStatus,
  options?: { cancelReason?: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      // Only ever written on the way to 'cancelled'; left untouched otherwise.
      ...(options?.cancelReason ? { cancel_reason: options.cancelReason } : {}),
    })
    .eq("id", orderId);

  if (error) {
    // Postgres RAISE EXCEPTION messages arrive prefixed; strip PostgREST's
    // wrapper so the toast shows only the sentence the trigger wrote.
    const message = error.message.replace(/^.*?:\s*/, "") || "No se pudo mover el pedido.";
    return { ok: false, message };
  }

  return { ok: true };
}
