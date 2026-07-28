import { describe, expect, it } from "vitest";

import type { PricedOrder } from "@/lib/pricing";
import {
  buildConfirmationRequest,
  buildConfirmationRequestUrl,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  normalizeArgentinePhone,
} from "@/lib/whatsapp";

const order: PricedOrder = {
  lines: [
    {
      lineId: "l1",
      productId: "p1",
      productName: "Pizza muzzarella",
      unitBasePriceCents: 1_200_000,
      quantity: 1,
      notes: "bien cocida",
      options: [
        {
          optionId: "o1",
          groupName: "Tamaño",
          optionName: "Grande",
          priceDeltaCents: 450_000,
        },
        {
          optionId: "o2",
          groupName: "Quitar",
          optionName: "Sin cebolla",
          priceDeltaCents: 0,
        },
      ],
      lineTotalCents: 1_650_000,
    },
  ],
  subtotalCents: 1_650_000,
  deliveryFeeCents: 150_000,
  totalCents: 1_800_000,
  deliveryZoneId: "z1",
};

const base = {
  code: "D-0142",
  businessName: "Pizzería Don José",
  order,
  fulfillment: "delivery" as const,
  customerName: "Gastón",
  address: "San Martín 450",
  addressReference: "Portón negro",
  deliveryZoneName: "Centro",
  paymentMethod: "cash" as const,
  cashChangeForCents: 2_000_000,
};

describe("buildWhatsAppMessage", () => {
  it("puts the order code on the first line so a truncated message stays useful", () => {
    const message = buildWhatsAppMessage(base);
    expect(message.split("\n")[0]).toBe("*PEDIDO D-0142*");
  });

  it("includes items, options, totals and the change requested", () => {
    // es-AR renders currency as "$ 16.500" with a non-breaking space. Collapse
    // every kind of space so the assertions describe intent, not Intl trivia.
    const message = buildWhatsAppMessage(base).replace(/\s+/g, " ");

    expect(message).toContain("1x Pizza muzzarella");
    expect(message).toContain("Grande");
    expect(message).toContain("Sin cebolla");
    expect(message).toContain("Subtotal: $ 16.500");
    expect(message).toContain("Envío: $ 1.500");
    expect(message).toContain("*TOTAL: $ 18.000*");
    expect(message).toContain("abona con $ 20.000");
  });

  it("omits the shipping line on a pickup order", () => {
    const message = buildWhatsAppMessage({
      ...base,
      fulfillment: "pickup",
      order: { ...order, deliveryFeeCents: 0, totalCents: 1_650_000 },
    });

    expect(message).toContain("Retiro en el local");
    expect(message).not.toContain("Envío:");
  });

  it("strips WhatsApp formatting characters out of customer-supplied text", () => {
    const message = buildWhatsAppMessage({
      ...base,
      customerName: "Ana *la jefa* _test_",
    });

    expect(message).toContain("*Cliente:* Ana la jefa test");
  });

  it("caps the message so the wa.me URL cannot grow unbounded", () => {
    const bigOrder: PricedOrder = {
      ...order,
      lines: Array.from({ length: 80 }, (_, index) => ({
        ...order.lines[0],
        lineId: `l${index}`,
        productName: `Producto con nombre bastante largo ${index}`,
      })),
    };

    const message = buildWhatsAppMessage({ ...base, order: bigOrder });

    expect(message.length).toBeLessThanOrEqual(1400);
    expect(message).toContain("D-0142");
  });
});

describe("buildWhatsAppUrl", () => {
  it("keeps digits only and encodes the message", () => {
    const url = buildWhatsAppUrl("+54 9 381 123-4567", "hola mundo & cia");
    expect(url).toBe("https://wa.me/5493811234567?text=hola%20mundo%20%26%20cia");
  });
});

describe("normalizeArgentinePhone", () => {
  it("leaves an already-correct 549 number untouched", () => {
    expect(normalizeArgentinePhone("5493811234567")).toBe("5493811234567");
  });

  it("inserts the mobile 9 when the number has the country code but not it", () => {
    expect(normalizeArgentinePhone("543811234567")).toBe("5493811234567");
  });

  it("prefixes 549 onto a locally-typed 10-digit number", () => {
    expect(normalizeArgentinePhone("3811234567")).toBe("5493811234567");
  });

  it("strips a leading local-dialing 0 before prefixing", () => {
    expect(normalizeArgentinePhone("0381-123-4567")).toBe("5493811234567");
  });

  it("handles spaces, dashes and a leading +", () => {
    expect(normalizeArgentinePhone("+54 9 381 123-4567")).toBe("5493811234567");
  });
});

describe("buildConfirmationRequest", () => {
  it("uses the customer's first name and names the order", () => {
    const message = buildConfirmationRequest({
      businessName: "Burger House",
      code: "D-0099",
      customerName: "Gastón Ruiz",
    });

    expect(message).toContain("Hola Gastón,");
    expect(message).toContain("Burger House");
    expect(message).toContain("D-0099");
    expect(message).toContain("confirm");
  });

  it("strips WhatsApp formatting characters from customer-supplied text", () => {
    const message = buildConfirmationRequest({
      businessName: "Burger House",
      code: "D-0099",
      customerName: "*Ana* la jefa",
    });
    expect(message).toContain("Hola Ana,");
  });
});

describe("buildConfirmationRequestUrl", () => {
  it("normalizes the phone before building the wa.me link", () => {
    const url = buildConfirmationRequestUrl("0381-123-4567", {
      businessName: "Burger House",
      code: "D-0099",
      customerName: "Gastón",
    });
    expect(url).toContain("https://wa.me/5493811234567?text=");
  });
});
