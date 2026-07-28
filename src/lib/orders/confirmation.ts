import type { FulfillmentType, OrderStatus } from "@/lib/orders/status";
import type { PricedOrder } from "@/lib/pricing";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OrderConfirmation {
  code: string;
  status: OrderStatus;
  createdAt: string;
  whatsappOpenedAt: string | null;
  businessName: string;
  businessSlug: string;
  order: PricedOrder;
  fulfillment: FulfillmentType;
  tableLabel: string | null;
  customerName: string;
  address: string | null;
  addressReference: string | null;
  deliveryZoneName: string | null;
  paymentMethod: "cash" | "transfer";
  cashChangeForCents: number | null;
  notes: string | null;
  currency: string;
  waUrl: string;
}

/**
 * Rebuilds the confirmation view — and the exact WhatsApp message the diner
 * is about to send — purely from what was persisted at checkout. Nothing here
 * re-reads current menu prices: order_items stores a snapshot precisely so
 * that a price change tomorrow can't alter today's already-placed order.
 */
export async function loadOrderConfirmation(
  orderId: string,
  businessSlug: string,
): Promise<OrderConfirmation | null> {
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return null;

  const { data: business } = await admin
    .from("businesses")
    .select("id, slug, name, whatsapp_phone, currency")
    .eq("id", order.business_id)
    .maybeSingle();

  // The id is a real order, but not one belonging to the business in this URL
  // (or, defensively, an order whose business row is somehow gone).
  if (!business || business.slug !== businessSlug) return null;

  const [itemsResult, zoneResult, tableResult] = await Promise.all([
    admin.from("order_items").select("*").eq("order_id", order.id).order("sort_order"),
    order.delivery_zone_id
      ? admin.from("delivery_zones").select("name").eq("id", order.delivery_zone_id).maybeSingle()
      : Promise.resolve({ data: null }),
    order.table_id
      ? admin.from("restaurant_tables").select("label").eq("id", order.table_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const items = itemsResult.data ?? [];
  // PostgREST rejects `in.()` with an empty list, so skip the round trip
  // entirely rather than special-casing an order that somehow has no items.
  const optionRows =
    items.length > 0
      ? (
          await admin
            .from("order_item_options")
            .select("*")
            .in(
              "order_item_id",
              items.map((item) => item.id),
            )
        ).data ?? []
      : [];

  const optionsByItem = new Map<string, typeof optionRows>();
  for (const option of optionRows) {
    const list = optionsByItem.get(option.order_item_id) ?? [];
    list.push(option);
    optionsByItem.set(option.order_item_id, list);
  }

  const pricedOrder: PricedOrder = {
    subtotalCents: order.subtotal_cents,
    deliveryFeeCents: order.delivery_fee_cents,
    totalCents: order.total_cents,
    deliveryZoneId: order.delivery_zone_id,
    lines: items.map((item) => ({
      lineId: item.id,
      productId: item.product_id ?? item.id,
      productName: item.product_name,
      unitBasePriceCents: item.unit_base_price_cents,
      quantity: item.quantity,
      notes: item.item_notes,
      lineTotalCents: item.line_total_cents,
      options: (optionsByItem.get(item.id) ?? []).map((option) => ({
        optionId: option.option_id ?? option.id,
        groupName: option.group_name,
        optionName: option.option_name,
        priceDeltaCents: option.price_delta_cents,
      })),
    })),
  };

  // A table order never went to WhatsApp in the first place — see
  // create-order.ts — so there is no message to rebuild here either.
  const waUrl =
    order.fulfillment_type === "dine_in"
      ? ""
      : buildWhatsAppUrl(
          business.whatsapp_phone,
          buildWhatsAppMessage({
            code: order.code,
            businessName: business.name,
            order: pricedOrder,
            fulfillment: order.fulfillment_type,
            customerName: order.customer_name,
            address: order.address,
            addressReference: order.address_reference,
            deliveryZoneName: zoneResult.data?.name ?? null,
            paymentMethod: order.payment_method,
            cashChangeForCents: order.cash_change_for_cents,
            notes: order.notes,
            currency: business.currency,
          }),
        );

  return {
    code: order.code,
    status: order.status,
    createdAt: order.created_at,
    whatsappOpenedAt: order.whatsapp_opened_at,
    businessName: business.name,
    businessSlug: business.slug,
    order: pricedOrder,
    fulfillment: order.fulfillment_type,
    tableLabel: tableResult.data?.label ?? null,
    customerName: order.customer_name,
    address: order.address,
    addressReference: order.address_reference,
    deliveryZoneName: zoneResult.data?.name ?? null,
    paymentMethod: order.payment_method,
    cashChangeForCents: order.cash_change_for_cents,
    notes: order.notes,
    currency: business.currency,
    waUrl,
  };
}
