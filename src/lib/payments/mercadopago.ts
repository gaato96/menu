import "server-only";

import { siteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Mercado Pago Checkout Pro, per local.
 *
 * Every call uses the LOCAL's own access token (business_mp_credentials,
 * service-role only), so the money lands in the local's account and VivoMenu
 * never touches it. Plain fetch against the public REST API — no SDK.
 *
 * Trust rule: an order becomes `paid` only from `syncPayment`, which reads the
 * payment from Mercado Pago itself and checks it belongs to this order and
 * this local. Webhook bodies and return-URL query strings are only hints
 * about WHICH payment to go and look at.
 */

const API = "https://api.mercadopago.com";
const TIMEOUT_MS = 15_000;

async function mp<T>(token: string, path: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  try {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("[mercadopago]", path.split("?")[0], response.status, await response.text().catch(() => ""));
      return { ok: false, status: response.status };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    console.error("[mercadopago] request failed", path.split("?")[0], error);
    return { ok: false, status: 0 };
  }
}

export async function getAccessToken(businessId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("business_mp_credentials")
    .select("access_token")
    .eq("business_id", businessId)
    .maybeSingle();
  return data?.access_token ?? null;
}

/** Validates a pasted token against /users/me before saving it. */
export async function verifyAccessToken(
  token: string,
): Promise<{ ok: true; userId: string; nickname: string | null } | { ok: false; error: string }> {
  const result = await mp<{ id: number; nickname?: string }>(token, "/users/me");
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.status === 401 || result.status === 403
          ? "Mercado Pago rechazó ese Access Token. Copiá el de Credenciales de producción."
          : "No pudimos comprobar el token con Mercado Pago. Probá de nuevo.",
    };
  }
  return { ok: true, userId: String(result.data.id), nickname: result.data.nickname ?? null };
}

type MpPayment = {
  id: number;
  status: string;
  external_reference?: string | null;
  transaction_amount?: number;
  currency_id?: string;
};

/**
 * Creates (or reuses) the checkout for an unpaid Mercado Pago order and
 * returns where to send the diner.
 */
export async function checkoutUrlForOrder(orderId: string, slug: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order || order.payment_method !== "mercadopago" || order.payment_status === "paid") return null;

  const { data: business } = await admin
    .from("businesses")
    .select("id, slug, name, currency")
    .eq("id", order.business_id)
    .maybeSingle();
  if (!business || business.slug !== slug) return null;

  const token = await getAccessToken(business.id);
  if (!token) return null;

  // Reuse an existing preference: a diner who comes back to the page and taps
  // "Pagar" again must land on the same checkout, not open a second charge.
  if (order.mp_preference_id) {
    const existing = await mp<{ init_point?: string }>(token, `/checkout/preferences/${order.mp_preference_id}`);
    if (existing.ok && existing.data.init_point) return existing.data.init_point;
  }

  const origin = siteUrl();
  const back = `${origin}/m/${business.slug}/pedido/${order.id}`;
  const created = await mp<{ id: string; init_point: string }>(token, "/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": `order-${order.id}` },
    body: JSON.stringify({
      items: [
        {
          id: order.code,
          title: `Pedido ${order.code} — ${business.name}`,
          quantity: 1,
          unit_price: order.total_cents / 100,
          currency_id: business.currency || "ARS",
        },
      ],
      external_reference: order.id,
      statement_descriptor: business.name.slice(0, 22),
      notification_url: `${origin}/api/mercadopago/webhook?b=${business.id}`,
      back_urls: { success: back, pending: back, failure: back },
      auto_return: "approved",
      // Pending cash vouchers (Rapipago, Pago Fácil) make no sense for food
      // that leaves the kitchen in 20 minutes.
      payment_methods: { excluded_payment_types: [{ id: "ticket" }, { id: "atm" }] },
      expires: true,
      expiration_date_to: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    }),
  });
  if (!created.ok) return null;

  await admin.from("orders").update({ mp_preference_id: created.data.id }).eq("id", order.id);
  return created.data.init_point;
}

/**
 * Reads payment `paymentId` from Mercado Pago with the local's token and, if
 * it belongs to one of this local's orders, records its outcome. Idempotent.
 */
export async function syncPayment(businessId: string, paymentId: string): Promise<"paid" | "failed" | "pending" | null> {
  if (!/^\d{1,20}$/.test(paymentId)) return null;
  const token = await getAccessToken(businessId);
  if (!token) return null;

  const result = await mp<MpPayment>(token, `/v1/payments/${paymentId}`);
  if (!result.ok || !result.data.external_reference) return null;
  const payment = result.data;

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, business_id, total_cents, payment_status, payment_method")
    .eq("id", payment.external_reference!)
    .eq("business_id", businessId)
    .maybeSingle();
  if (!order || order.payment_method !== "mercadopago") return null;

  const status = mapStatus(payment.status);
  // Amount check: an approved payment for less than the order is not "paid".
  const amountCents = Math.round((payment.transaction_amount ?? 0) * 100);
  const effective = status === "paid" && amountCents < order.total_cents ? "failed" : status;

  // Never downgrade a paid order: MP sends several notifications per payment,
  // and a later rejected retry must not undo an approved one.
  if (order.payment_status === "paid") return "paid";
  if (effective !== "pending" || order.payment_status !== "pending") {
    await admin
      .from("orders")
      .update({ payment_status: effective, external_payment_id: String(payment.id) })
      .eq("id", order.id)
      .neq("payment_status", "paid");
  }
  return effective;
}

export function mapStatus(status: string): "paid" | "failed" | "pending" {
  if (status === "approved") return "paid";
  if (status === "rejected" || status === "cancelled" || status === "refunded" || status === "charged_back") {
    return "failed";
  }
  return "pending";
}
