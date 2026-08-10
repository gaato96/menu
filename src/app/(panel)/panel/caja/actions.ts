"use server";

import { revalidatePath } from "next/cache";

import { requireModule, requireStaff } from "@/lib/auth/context";
import { parseMoneyToCents } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import type { CashMovementKind, CashPaymentMethod } from "@/types/database";

/**
 * Every action here runs through the session client, so RLS decides — and
 * every cash policy is gated on business_has_module(..., 'cash_register'),
 * which means a business without the module writes nothing even if a route
 * check were somehow missed.
 *
 * requireModule() on top of that is for the redirect, not the security.
 */

const MOVEMENT_KINDS: readonly CashMovementKind[] = ["expense", "income", "withdrawal"];
const PAYMENT_METHODS: readonly CashPaymentMethod[] = [
  "cash",
  "card",
  "transfer",
  "mercadopago",
  "other",
];

type Result = { ok?: true; error?: string };

export async function openCashSession(formData: FormData): Promise<Result> {
  const staff = await requireStaff();
  requireModule(staff, "cash_register");
  const supabase = await createClient();

  const raw = String(formData.get("openingFloat") ?? "").trim();
  const openingFloatCents = raw === "" ? 0 : parseMoneyToCents(raw);
  if (openingFloatCents === null) return { error: "Ese monto no se entiende." };

  const { error } = await supabase.from("cash_sessions").insert({
    business_id: staff.business.id,
    opened_by: staff.userId,
    opening_float_cents: openingFloatCents,
  });

  if (error) {
    // The partial unique index is what rejects a second open drawer. Two
    // cashiers tapping "abrir" at the same time land here, and this is the
    // message that explains it rather than a raw constraint name.
    if (error.code === "23505") return { error: "Ya hay una caja abierta." };
    return { error: "No pudimos abrir la caja." };
  }

  revalidatePath("/panel/caja");
  return { ok: true };
}

export async function addCashMovement(sessionId: string, formData: FormData): Promise<Result> {
  const staff = await requireStaff();
  requireModule(staff, "cash_register");
  const supabase = await createClient();

  const kind = String(formData.get("kind") ?? "");
  if (!MOVEMENT_KINDS.includes(kind as CashMovementKind)) {
    return { error: "Elegí qué tipo de movimiento es." };
  }

  const concept = String(formData.get("concept") ?? "").trim();
  if (!concept) return { error: "Escribí de qué se trata." };

  const amountCents = parseMoneyToCents(String(formData.get("amount") ?? ""));
  if (amountCents === null || amountCents <= 0) return { error: "Poné un monto mayor a cero." };

  const { error } = await supabase.from("cash_movements").insert({
    business_id: staff.business.id,
    cash_session_id: sessionId,
    kind: kind as CashMovementKind,
    amount_cents: amountCents,
    concept,
    created_by: staff.userId,
  });

  // Raised by assert_cash_session_open when the drawer closed between the
  // page render and the submit.
  if (error) return { error: "No pudimos registrar el movimiento. ¿La caja sigue abierta?" };

  revalidatePath("/panel/caja");
  return { ok: true };
}

/**
 * Collects an order into the open drawer.
 *
 * `amount_cents` is copied from the order rather than joined at read time, so
 * a price fixed next week never rewrites what the drawer took today.
 */
export async function collectOrder(orderId: string, formData: FormData): Promise<Result> {
  const staff = await requireStaff();
  requireModule(staff, "cash_register");
  const supabase = await createClient();

  const method = String(formData.get("method") ?? "");
  if (!PAYMENT_METHODS.includes(method as CashPaymentMethod)) {
    return { error: "Elegí cómo pagó." };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, total_cents, status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { error: "Pedido no encontrado." };
  if (order.status === "cancelled") return { error: "Ese pedido está cancelado." };

  const { data: session } = await supabase
    .from("cash_sessions")
    .select("id")
    .is("closed_at", null)
    .maybeSingle();
  if (!session) return { error: "Abrí la caja antes de cobrar." };

  const discountCents = parseMoneyToCents(String(formData.get("discount") ?? "0")) ?? 0;
  const tipCents = parseMoneyToCents(String(formData.get("tip") ?? "0")) ?? 0;
  if (discountCents > order.total_cents) {
    return { error: "El descuento no puede superar el total del pedido." };
  }

  const { error } = await supabase.from("order_payments").insert({
    business_id: staff.business.id,
    order_id: orderId,
    cash_session_id: session.id,
    method: method as CashPaymentMethod,
    amount_cents: order.total_cents,
    discount_cents: discountCents,
    tip_cents: tipCents,
    created_by: staff.userId,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ese pedido ya está cobrado." };
    return { error: "No pudimos registrar el cobro." };
  }

  revalidatePath("/panel/caja");
  revalidatePath("/panel/pedidos");
  return { ok: true };
}

/** Undoes a collection. Deliberately explicit — see the unique(order_id). */
export async function uncollectOrder(paymentId: string): Promise<Result> {
  const staff = await requireStaff();
  requireModule(staff, "cash_register");
  const supabase = await createClient();

  const { error } = await supabase.from("order_payments").delete().eq("id", paymentId);
  if (error) return { error: "No pudimos anular el cobro. ¿La caja sigue abierta?" };

  revalidatePath("/panel/caja");
  revalidatePath("/panel/pedidos");
  return { ok: true };
}

/**
 * Closes the drawer. The expected total and the difference are computed
 * inside close_cash_session so they come from the same snapshot as the write
 * — doing it here would let a payment land between the read and the update.
 */
export async function closeCashSession(sessionId: string, formData: FormData): Promise<Result> {
  const staff = await requireStaff();
  requireModule(staff, "cash_register");
  const supabase = await createClient();

  const countedCents = parseMoneyToCents(String(formData.get("counted") ?? ""));
  if (countedCents === null) return { error: "Poné cuánto contaste en la caja." };

  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase.rpc("close_cash_session", {
    p_session_id: sessionId,
    p_counted_cents: countedCents,
    p_notes: notes,
  });

  if (error) return { error: "No pudimos cerrar la caja. Recargá y probá de nuevo." };

  revalidatePath("/panel/caja");
  return { ok: true };
}
