"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireModule, requireStaff } from "@/lib/auth/context";
import { createOrder } from "@/lib/orders/create-order";
import { createClient } from "@/lib/supabase/server";
import type { FloorShape } from "@/types/database";

export async function createTable(formData: FormData) {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();

  const label = String(formData.get("label") ?? "").trim();
  const seats = Math.max(1, Math.trunc(Number(formData.get("seats")) || 2));
  const zone = String(formData.get("zone") ?? "").trim() || null;
  if (!label) return;

  const { count } = await supabase
    .from("restaurant_tables")
    .select("id", { count: "exact", head: true })
    .eq("business_id", staff.business.id);

  await supabase.from("restaurant_tables").insert({
    business_id: staff.business.id,
    label,
    seats,
    zone,
    sort_order: count ?? 0,
  });

  revalidatePath("/panel/salon");
}

export async function toggleTableActive(tableId: string, isActive: boolean) {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();
  await supabase.from("restaurant_tables").update({ is_active: isActive }).eq("id", tableId);
  revalidatePath("/panel/salon");
}

export async function deleteTable(tableId: string) {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();
  // A table with order history keeps existing — restaurant_tables has no
  // ON DELETE CASCADE from orders, and orders.table_id is a real record of
  // where that order happened. Deactivating (above) is the day-to-day tool;
  // this is only for a table that was created by mistake and never used.
  await supabase.from("restaurant_tables").delete().eq("id", tableId);
  revalidatePath("/panel/salon");
}

// --- Floor plan ------------------------------------------------------------

/**
 * Persists where a table sits after a drag, as a percentage of the plan area.
 *
 * Clamped here as well as in the CHECK constraint: a drag that ends slightly
 * outside the box should snap to the edge, not be rejected with an error the
 * waiter cannot act on.
 */
export async function moveTable(tableId: string, x: number, y: number) {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();

  const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value * 100) / 100));

  await supabase
    .from("restaurant_tables")
    .update({ position_x: clamp(x), position_y: clamp(y) })
    .eq("id", tableId);

  revalidatePath("/panel/salon");
}

export async function setTableShape(tableId: string, shape: FloorShape) {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();
  await supabase.from("restaurant_tables").update({ shape }).eq("id", tableId);
  revalidatePath("/panel/salon");
}

// --- Waiter-entered order --------------------------------------------------

export type WaiterOrderResult = { ok: true; code: string } | { ok: false; error: string };

/**
 * Takes an order at the table, from the waiter's own phone.
 *
 * Goes through the same createOrder() as a QR order rather than inserting
 * directly: that function is the only place allowed to bring an order into
 * existence, and it is what re-prices the cart from the database. A panel
 * path that trusted prices sent by the browser would be a hole straight
 * through the pricing design, and staff devices get lost and borrowed like
 * any other.
 *
 * Difference from a QR order: it lands already confirmed. The waiter took it
 * face to face, so asking someone at the counter to confirm it again is a
 * step that buys nothing and delays the kitchen.
 */
export async function createWaiterOrder(
  tableId: string,
  formData: FormData,
): Promise<WaiterOrderResult> {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();

  const { data: table } = await supabase
    .from("restaurant_tables")
    .select("id, label, is_active")
    .eq("id", tableId)
    .maybeSingle();
  if (!table) return { ok: false, error: "Mesa no encontrada." };
  if (!table.is_active) return { ok: false, error: "Esa mesa está desactivada." };

  let lines: { productId: string; quantity: number; optionIds: string[]; notes: string | null }[];
  try {
    lines = JSON.parse(String(formData.get("lines") ?? "[]"));
  } catch {
    return { ok: false, error: "No pudimos leer el pedido." };
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: false, error: "Agregá al menos un producto." };
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;

  const result = await createOrder(
    staff.business.slug,
    {
      businessSlug: staff.business.slug,
      fulfillment: "dine_in",
      tableId,
      // Shows on the board and the kitchen screen. The table is the identity
      // of a dine-in order — nobody asks a seated customer for their name.
      customerName: table.label.toLowerCase().startsWith("mesa")
        ? table.label
        : `Mesa ${table.label}`,
      customerPhone: null,
      // Dine-in is settled later at the counter (or in Caja). 'cash' is the
      // schema's required placeholder, not a claim about how they will pay.
      paymentMethod: "cash",
      notes,
      idempotencyKey: randomUUID(),
      lines: lines.map((line, index) => ({
        lineId: `w${index}`,
        productId: line.productId,
        quantity: line.quantity,
        optionIds: line.optionIds ?? [],
        notes: line.notes ?? null,
      })),
    },
    // The waiter is physically in the local. A schedule loaded once and never
    // updated must not stop them taking an order from a seated customer.
    { bypassSchedule: true },
  );

  if (!result.ok) {
    if (result.reason === "table_invalid") return { ok: false, error: "Esa mesa no es válida." };
    if (result.reason === "pricing") {
      return { ok: false, error: result.errors[0]?.message ?? "Revisá el pedido." };
    }
    return { ok: false, error: "No pudimos crear el pedido." };
  }

  // Straight past pending_payment. Goes through the same update path as the
  // board, so orders_update_guard still vets the transition and the status
  // event is recorded with this waiter as the author.
  const { error: statusError } = await supabase
    .from("orders")
    .update({ status: "confirmed" })
    .eq("id", result.orderId);

  // The order exists and is on the board either way — reporting a failure
  // here would invite the waiter to enter it a second time.
  if (statusError) console.error("[salon] no se pudo confirmar el pedido", statusError);

  revalidatePath("/panel/salon");
  revalidatePath("/panel");
  return { ok: true, code: result.code };
}
