import { describe, expect, it } from "vitest";

import {
  type CartInput,
  type MenuProduct,
  type MenuSnapshot,
  priceOrder,
} from "@/lib/pricing";

/* ---------------------------------------------------------------------------
   A real-ish menu: a pizza priced by size with paid extras and a free
   "sin ingrediente" group, plus a fixed-price empanada.
--------------------------------------------------------------------------- */

const pizza: MenuProduct = {
  id: "prod-pizza",
  name: "Pizza muzzarella",
  basePriceCents: 1_200_000, // $12.000
  isAvailable: true,
  groups: [
    {
      id: "grp-size",
      name: "Tamaño",
      selectionType: "single",
      isRequired: true,
      minSelect: 1,
      maxSelect: 1,
      options: [
        { id: "opt-small", name: "Chica", priceDeltaCents: 0, isAvailable: true },
        { id: "opt-large", name: "Grande", priceDeltaCents: 450_000, isAvailable: true },
      ],
    },
    {
      id: "grp-extras",
      name: "Agregados",
      selectionType: "multiple",
      isRequired: false,
      minSelect: 0,
      maxSelect: 3,
      options: [
        { id: "opt-cheese", name: "Extra queso", priceDeltaCents: 150_000, isAvailable: true },
        { id: "opt-ham", name: "Jamón", priceDeltaCents: 200_000, isAvailable: true },
        { id: "opt-olive", name: "Aceitunas", priceDeltaCents: 80_000, isAvailable: false },
      ],
    },
    {
      id: "grp-remove",
      name: "Quitar ingredientes",
      selectionType: "multiple",
      isRequired: false,
      minSelect: 0,
      maxSelect: null,
      options: [{ id: "opt-no-onion", name: "Sin cebolla", priceDeltaCents: 0, isAvailable: true }],
    },
  ],
};

const empanada: MenuProduct = {
  id: "prod-empanada",
  name: "Empanada de carne",
  basePriceCents: 180_000,
  isAvailable: true,
  groups: [],
};

function buildMenu(overrides: Partial<MenuSnapshot> = {}): MenuSnapshot {
  return {
    products: new Map([
      [pizza.id, pizza],
      [empanada.id, empanada],
    ]),
    zones: new Map([
      ["zone-centro", { id: "zone-centro", name: "Centro", feeCents: 150_000, isActive: true }],
      ["zone-old", { id: "zone-old", name: "Yerba Buena", feeCents: 300_000, isActive: false }],
    ]),
    settings: { deliveryEnabled: true, pickupEnabled: true, minOrderCents: 0, dineInEnabled: false },
    ...overrides,
  };
}

function pickupCart(lines: CartInput["lines"]): CartInput {
  return { lines, fulfillment: "pickup" };
}

describe("priceOrder", () => {
  it("prices a pizza with a variant and two paid extras", () => {
    const result = priceOrder(
      pickupCart([
        {
          lineId: "l1",
          productId: pizza.id,
          quantity: 1,
          optionIds: ["opt-large", "opt-cheese", "opt-ham"],
        },
      ]),
      buildMenu(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // 12.000 + 4.500 + 1.500 + 2.000 = 20.000
    expect(result.order.subtotalCents).toBe(2_000_000);
    expect(result.order.totalCents).toBe(2_000_000);
    expect(result.order.lines[0].options).toHaveLength(3);
  });

  it("multiplies options by quantity, not just the base price", () => {
    const result = priceOrder(
      pickupCart([
        {
          lineId: "l1",
          productId: pizza.id,
          quantity: 3,
          optionIds: ["opt-small", "opt-cheese"],
        },
      ]),
      buildMenu(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // (12.000 + 0 + 1.500) x 3 = 40.500
    expect(result.order.subtotalCents).toBe(4_050_000);
  });

  it("treats a free 'remove ingredient' option as zero", () => {
    const result = priceOrder(
      pickupCart([
        {
          lineId: "l1",
          productId: pizza.id,
          quantity: 1,
          optionIds: ["opt-small", "opt-no-onion"],
        },
      ]),
      buildMenu(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.totalCents).toBe(1_200_000);
  });

  it("rejects a required group that was not chosen", () => {
    const result = priceOrder(
      pickupCart([{ lineId: "l1", productId: pizza.id, quantity: 1, optionIds: [] }]),
      buildMenu(),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("group_required");
  });

  it("rejects two picks in a single-selection group", () => {
    const result = priceOrder(
      pickupCart([
        {
          lineId: "l1",
          productId: pizza.id,
          quantity: 1,
          optionIds: ["opt-small", "opt-large"],
        },
      ]),
      buildMenu(),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("single_select_violation");
  });

  it("rejects an option that ran out while the cart was open", () => {
    const result = priceOrder(
      pickupCart([
        {
          lineId: "l1",
          productId: pizza.id,
          quantity: 1,
          optionIds: ["opt-small", "opt-olive"],
        },
      ]),
      buildMenu(),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("option_unavailable");
  });

  it("rejects an option id that does not belong to the product", () => {
    const result = priceOrder(
      pickupCart([
        { lineId: "l1", productId: empanada.id, quantity: 1, optionIds: ["opt-large"] },
      ]),
      buildMenu(),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("option_missing");
  });

  it("rejects a sold-out product", () => {
    const menu = buildMenu();
    menu.products.set(empanada.id, { ...empanada, isAvailable: false });

    const result = priceOrder(
      pickupCart([{ lineId: "l1", productId: empanada.id, quantity: 2, optionIds: [] }]),
      menu,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("product_unavailable");
  });

  it("adds the delivery fee of the chosen zone", () => {
    const result = priceOrder(
      {
        lines: [{ lineId: "l1", productId: empanada.id, quantity: 6, optionIds: [] }],
        fulfillment: "delivery",
        deliveryZoneId: "zone-centro",
      },
      buildMenu(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.subtotalCents).toBe(1_080_000);
    expect(result.order.deliveryFeeCents).toBe(150_000);
    expect(result.order.totalCents).toBe(1_230_000);
  });

  it("rejects a zone the business turned off", () => {
    const result = priceOrder(
      {
        lines: [{ lineId: "l1", productId: empanada.id, quantity: 6, optionIds: [] }],
        fulfillment: "delivery",
        deliveryZoneId: "zone-old",
      },
      buildMenu(),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("zone_invalid");
  });

  it("requires a zone when the order is a delivery", () => {
    const result = priceOrder(
      {
        lines: [{ lineId: "l1", productId: empanada.id, quantity: 6, optionIds: [] }],
        fulfillment: "delivery",
      },
      buildMenu(),
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("zone_required");
  });

  it("charges no delivery fee on a pickup order", () => {
    const result = priceOrder(
      pickupCart([{ lineId: "l1", productId: empanada.id, quantity: 6, optionIds: [] }]),
      buildMenu(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.deliveryFeeCents).toBe(0);
  });

  it("enforces the minimum against the food only, not the delivery fee", () => {
    const menu = buildMenu({
      settings: { deliveryEnabled: true, pickupEnabled: true, minOrderCents: 1_500_000, dineInEnabled: false },
    });

    // 6 empanadas = $10.800, plus $1.500 shipping = $12.300. Still under the
    // $15.000 minimum, because shipping must not count toward it.
    const result = priceOrder(
      {
        lines: [{ lineId: "l1", productId: empanada.id, quantity: 6, optionIds: [] }],
        fulfillment: "delivery",
        deliveryZoneId: "zone-centro",
      },
      menu,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("below_minimum");
  });

  it("rejects delivery when the business turned delivery off", () => {
    const menu = buildMenu({
      settings: { deliveryEnabled: false, pickupEnabled: true, minOrderCents: 0, dineInEnabled: false },
    });

    const result = priceOrder(
      {
        lines: [{ lineId: "l1", productId: empanada.id, quantity: 1, optionIds: [] }],
        fulfillment: "delivery",
        deliveryZoneId: "zone-centro",
      },
      menu,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("fulfillment_disabled");
  });

  it("rejects an empty cart", () => {
    const result = priceOrder(pickupCart([]), buildMenu());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe("empty_cart");
  });

  it("rejects a non-integer or out-of-range quantity", () => {
    for (const quantity of [0, -1, 1.5, 100]) {
      const result = priceOrder(
        pickupCart([{ lineId: "l1", productId: empanada.id, quantity, optionIds: [] }]),
        buildMenu(),
      );
      expect(result.ok, `quantity ${quantity} should be rejected`).toBe(false);
    }
  });

  it("respects the maximum number of extras", () => {
    const menu = buildMenu();
    const cappedPizza: MenuProduct = {
      ...pizza,
      groups: pizza.groups.map((group) =>
        group.id === "grp-extras" ? { ...group, maxSelect: 1 } : group,
      ),
    };
    menu.products.set(pizza.id, cappedPizza);

    const result = priceOrder(
      pickupCart([
        {
          lineId: "l1",
          productId: pizza.id,
          quantity: 1,
          optionIds: ["opt-small", "opt-cheese", "opt-ham"],
        },
      ]),
      menu,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toContain("group_max");
  });
});
