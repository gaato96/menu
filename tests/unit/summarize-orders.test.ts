import { describe, expect, it } from "vitest";

import type { BoardOrder } from "@/lib/orders/board-queries";
import { summarizeOrders } from "@/lib/orders/history-queries";
import type { OrderStatus } from "@/lib/orders/status";

function order(status: OrderStatus, totalCents: number): BoardOrder {
  return {
    id: crypto.randomUUID(),
    business_id: "b1",
    code: "T-0001",
    status,
    fulfillment_type: "pickup",
    customer_name: "Test",
    customer_phone: "123",
    address: null,
    address_reference: null,
    delivery_zone_id: null,
    payment_method: "cash",
    cash_change_for_cents: null,
    notes: null,
    subtotal_cents: totalCents,
    delivery_fee_cents: 0,
    total_cents: totalCents,
    whatsapp_opened_at: null,
    idempotency_key: crypto.randomUUID(),
    cancel_reason: null,
    created_at: new Date().toISOString(),
    status_changed_at: new Date().toISOString(),
    customer_id: null,
    payment_status: "pending",
    external_payment_id: null,
    table_id: null,
    items: [],
  };
}

describe("summarizeOrders", () => {
  it("counts only completed orders toward revenue and average ticket", () => {
    const summary = summarizeOrders([
      order("completed", 10_000),
      order("completed", 20_000),
      order("cancelled", 99_999),
      order("in_kitchen", 15_000),
    ]);

    expect(summary.orderCount).toBe(4);
    expect(summary.completedCount).toBe(2);
    expect(summary.revenueCents).toBe(30_000);
    expect(summary.averageTicketCents).toBe(15_000);
    expect(summary.cancelledCount).toBe(1);
  });

  it("does not divide by zero with no completed orders", () => {
    const summary = summarizeOrders([order("cancelled", 5_000)]);
    expect(summary.averageTicketCents).toBe(0);
    expect(summary.revenueCents).toBe(0);
  });

  it("returns zeros for an empty set", () => {
    expect(summarizeOrders([])).toEqual({
      orderCount: 0,
      completedCount: 0,
      revenueCents: 0,
      averageTicketCents: 0,
      cancelledCount: 0,
    });
  });
});
