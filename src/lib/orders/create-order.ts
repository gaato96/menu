import { isBusinessOpenNow } from "@/lib/business/hours";
import { loadMenuSnapshotForPricing } from "@/lib/menu/queries";
import type { PricingError } from "@/lib/pricing";
import { priceOrder } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { OrderRequest } from "./schema";

export type CreateOrderResult =
  | { ok: true; orderId: string; code: string; waUrl: string }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "suspended" }
  | { ok: false; reason: "closed" }
  | { ok: false; reason: "pricing"; errors: PricingError[] };

/**
 * The one place an order is allowed to come into existence.
 *
 * Re-derives everything from the database rather than trusting the request:
 * whether the business can sell right now, what things cost, and whether the
 * cart is even legal (required groups, stock, minimums). The caller (the
 * route handler) only supplies what a diner actually chose — ids, quantities,
 * their own contact details.
 */
export async function createOrder(
  businessSlug: string,
  request: OrderRequest,
): Promise<CreateOrderResult> {
  const admin = createAdminClient();

  // Separate queries rather than a PostgREST embed: the hand-authored
  // Database type (see src/types/database.ts) carries no Relationships
  // metadata, so supabase-js can't infer whether an embedded field is a
  // single row or an array. Plain queries keep the types honest.
  const { data: business } = await admin.from("businesses").select("*").eq("slug", businessSlug).maybeSingle();
  if (!business) return { ok: false, reason: "not_found" };

  const [subscriptionResult, hoursResult] = await Promise.all([
    admin.from("subscriptions").select("status").eq("business_id", business.id).single(),
    admin.from("business_hours").select("day_of_week, opens_at, closes_at").eq("business_id", business.id),
  ]);

  const subscriptionStatus = subscriptionResult.data?.status;
  const isServable =
    business.status === "active" &&
    (subscriptionStatus === "trial" || subscriptionStatus === "active" || subscriptionStatus === "past_due");
  if (!isServable) return { ok: false, reason: "suspended" };

  const isOpen = isBusinessOpenNow(business.timezone, hoursResult.data ?? [], business.is_open_manual);
  if (!isOpen) return { ok: false, reason: "closed" };

  const snapshot = await loadMenuSnapshotForPricing(business.id);

  const priced = priceOrder(
    {
      lines: request.lines.map((line) => ({
        lineId: line.lineId,
        productId: line.productId,
        quantity: line.quantity,
        optionIds: line.optionIds,
        notes: line.notes ?? null,
      })),
      fulfillment: request.fulfillment,
      deliveryZoneId: request.deliveryZoneId ?? null,
    },
    snapshot,
  );

  if (!priced.ok) return { ok: false, reason: "pricing", errors: priced.errors };

  const { order } = priced;

  const { data: rpcResult, error: rpcError } = await admin.rpc("create_priced_order", {
    p_business_id: business.id,
    p_order: {
      fulfillment_type: request.fulfillment,
      customer_name: request.customerName,
      customer_phone: request.customerPhone,
      address: request.fulfillment === "delivery" ? (request.address ?? null) : null,
      address_reference:
        request.fulfillment === "delivery" ? (request.addressReference ?? null) : null,
      delivery_zone_id: order.deliveryZoneId,
      payment_method: request.paymentMethod,
      cash_change_for_cents:
        request.paymentMethod === "cash" ? (request.cashChangeForCents ?? null) : null,
      notes: request.notes ?? null,
      subtotal_cents: order.subtotalCents,
      delivery_fee_cents: order.deliveryFeeCents,
      total_cents: order.totalCents,
      idempotency_key: request.idempotencyKey,
      items: order.lines.map((line, index) => ({
        product_id: line.productId,
        product_name: line.productName,
        unit_base_price_cents: line.unitBasePriceCents,
        quantity: line.quantity,
        item_notes: line.notes,
        line_total_cents: line.lineTotalCents,
        sort_order: index,
        options: line.options.map((option) => ({
          option_id: option.optionId,
          group_name: option.groupName,
          option_name: option.optionName,
          price_delta_cents: option.priceDeltaCents,
        })),
      })),
    },
  });

  if (rpcError || !rpcResult) {
    throw new Error(`create_priced_order falló: ${rpcError?.message ?? "sin resultado"}`);
  }

  const result = rpcResult as { id: string; code: string };
  const zoneName = order.deliveryZoneId ? snapshot.zones.get(order.deliveryZoneId)?.name : null;

  const message = buildWhatsAppMessage({
    code: result.code,
    businessName: business.name,
    order,
    fulfillment: request.fulfillment,
    customerName: request.customerName,
    address: request.fulfillment === "delivery" ? request.address : null,
    addressReference: request.fulfillment === "delivery" ? request.addressReference : null,
    deliveryZoneName: zoneName,
    paymentMethod: request.paymentMethod,
    cashChangeForCents: request.paymentMethod === "cash" ? request.cashChangeForCents : null,
    notes: request.notes,
    currency: business.currency,
  });

  return {
    ok: true,
    orderId: result.id,
    code: result.code,
    waUrl: buildWhatsAppUrl(business.whatsapp_phone, message),
  };
}
