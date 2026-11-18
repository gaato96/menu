import { describe, expect, it } from "vitest";

import { summarizeWeek, summaryHeadlines, type SummaryOrderRow } from "@/lib/orders/weekly-summary";

const TZ = "America/Argentina/Tucuman";

function order(id: string, overrides: Partial<SummaryOrderRow> = {}): SummaryOrderRow {
  return {
    id,
    status: "completed",
    fulfillment_type: "delivery",
    total_cents: 1_000_000,
    // Friday 2026-11-13 21:30 in Argentina (UTC-3) = 00:30 UTC Saturday.
    created_at: "2026-11-14T00:30:00.000Z",
    customer_phone: "381 555-0001",
    whatsapp_opened_at: "2026-11-14T00:31:00.000Z",
    ...overrides,
  };
}

describe("summarizeWeek", () => {
  const current = [
    order("a"),
    order("b", { customer_phone: "3815550002", fulfillment_type: "pickup", total_cents: 500_000 }),
    order("c", { status: "cancelled", total_cents: 9_999_999 }),
    order("d", { fulfillment_type: "dine_in", customer_phone: null, whatsapp_opened_at: null }),
    order("e", { whatsapp_opened_at: null, created_at: "2026-11-12T15:10:00.000Z" }),
  ];
  const previous = [order("p1", { total_cents: 2_000_000 })];

  const summary = summarizeWeek({
    current,
    previous,
    currentItems: [
      { order_id: "a", product_name: "Burger", quantity: 2, line_total_cents: 800_000 },
      { order_id: "b", product_name: "Papas", quantity: 1, line_total_cents: 200_000 },
      { order_id: "e", product_name: "Burger", quantity: 1, line_total_cents: 400_000 },
      { order_id: "c", product_name: "Cancelada", quantity: 50, line_total_cents: 1 },
    ],
    knownPhones: new Set(["3815550001"]),
    timeZone: TZ,
  });

  it("excludes cancelled orders from sales but counts them", () => {
    expect(summary.current.orders).toBe(4);
    expect(summary.current.revenueCents).toBe(3_500_000);
    expect(summary.current.avgTicketCents).toBe(875_000);
    expect(summary.current.cancelled).toBe(1);
  });

  it("compares against the previous week", () => {
    expect(summary.revenueChangePct).toBe(75);
    expect(summary.ordersChangePct).toBe(300);
  });

  it("buckets by business-local hour and weekday", () => {
    expect(summary.peakHour).toBe(21);
    expect(summary.bestWeekday).toBe(5); // viernes
    expect(summary.byHour[12]).toBe(1);
  });

  it("ranks products and ignores cancelled orders' items", () => {
    expect(summary.topProducts[0]).toEqual({ name: "Burger", quantity: 3, revenueCents: 1_200_000 });
    expect(summary.topProducts.find((p) => p.name === "Cancelada")).toBeUndefined();
  });

  it("splits new and repeat customers by phone digits, and counts unconfirmed", () => {
    expect(summary.repeatCustomers).toBe(1);
    expect(summary.newCustomers).toBe(1);
    expect(summary.unconfirmed).toBe(1);
    expect(summary.byFulfillment).toEqual({ delivery: 2, pickup: 1, dine_in: 1 });
  });

  it("writes plain headlines", () => {
    const lines = summaryHeadlines(summary, (c) => `$${c / 100}`);
    expect(lines[0]).toBe("Vendiste $35000, un 75% más que la semana anterior.");
    expect(lines[1]).toContain("viernes");
    expect(lines[2]).toBe("Lo más pedido: Burger (3).");
  });

  it("handles an empty week", () => {
    const empty = summarizeWeek({ current: [], previous: [], currentItems: [], knownPhones: new Set(), timeZone: TZ });
    expect(empty.revenueChangePct).toBeNull();
    expect(empty.peakHour).toBeNull();
    expect(summaryHeadlines(empty, String)).toEqual(["Esta semana no entraron pedidos por VivoMenu."]);
  });
});
