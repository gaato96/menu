import { describe, expect, it } from "vitest";

import type { BoardOrder } from "@/lib/orders/board-queries";
import { buildComandaHtml } from "@/lib/printing/comanda";

const base = {
  id: "o1",
  business_id: "b1",
  code: "A-07",
  business_date: "2026-11-18",
  status: "confirmed",
  fulfillment_type: "delivery",
  customer_name: "Juan <Pérez>",
  customer_phone: "3815551234",
  address: "San Martín 123",
  address_reference: "timbre B",
  delivery_zone_id: null,
  payment_method: "cash",
  cash_change_for_cents: 2_000_000,
  notes: "sin sal",
  subtotal_cents: 1_500_000,
  delivery_fee_cents: 100_000,
  total_cents: 1_600_000,
  whatsapp_opened_at: null,
  idempotency_key: "x".repeat(12),
  cancel_reason: null,
  created_at: "2026-11-18T23:30:00.000Z",
  status_changed_at: "2026-11-18T23:30:00.000Z",
  customer_id: null,
  payment_status: "pending",
  external_payment_id: null,
  table_id: null,
  stock_applied: false,
  session_id: null,
  mp_preference_id: null,
  items: [
    {
      id: "i1",
      productName: "Burger doble",
      quantity: 2,
      itemNotes: "bien cocida",
      lineTotalCents: 1_500_000,
      options: [{ groupName: "Extras", optionName: "Cheddar", priceDeltaCents: 0 }],
    },
  ],
} as BoardOrder;

describe("buildComandaHtml", () => {
  it("prints the code, the dishes with options and notes, and the total", () => {
    const html = buildComandaHtml({ order: base, businessName: "Burger House", currency: "ARS", paperMm: 80 });
    expect(html).toContain("A-07");
    expect(html).toContain("2x</span> Burger doble");
    expect(html).toContain("+ Cheddar");
    expect(html).toContain("» bien cocida");
    expect(html).toContain("NOTA: sin sal");
    expect(html).toContain("DELIVERY");
    expect(html).toContain("San Martín 123 (timbre B)");
    expect(html).toContain("size: 80mm auto");
    expect(html).toMatch(/abona con \$\s?20\.000/);
  });

  it("escapes customer-typed text", () => {
    const html = buildComandaHtml({ order: base, businessName: "X", currency: "ARS", paperMm: 58 });
    expect(html).toContain("Juan &lt;Pérez&gt;");
    expect(html).not.toContain("<Pérez>");
    expect(html).toContain("size: 58mm auto");
  });

  it("shows the table for dine-in and the paid state for Mercado Pago", () => {
    const html = buildComandaHtml({
      order: { ...base, fulfillment_type: "dine_in", payment_method: "mercadopago", payment_status: "paid" },
      businessName: "X",
      currency: "ARS",
      paperMm: 80,
      tableLabel: "4",
    });
    expect(html).toContain("Mesa 4");
    expect(html).toContain("Mercado Pago · PAGADO");
  });
});
