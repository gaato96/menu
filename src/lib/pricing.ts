import type { FulfillmentType } from "@/lib/orders/status";

/**
 * The single source of truth for what an order costs.
 *
 * This module is pure: it takes a cart and a snapshot of the menu and returns
 * either a fully priced order or a list of reasons why not. The browser calls
 * it to render the cart, the order endpoint calls it again with data re-read
 * from the database, and the two must agree to the cent.
 *
 * The browser never sends prices. It sends ids and quantities, and the server
 * looks up what those actually cost — otherwise a crafted request buys a
 * milanesa for zero pesos.
 */

export interface MenuOption {
  id: string;
  name: string;
  priceDeltaCents: number;
  isAvailable: boolean;
}

export interface MenuOptionGroup {
  id: string;
  name: string;
  selectionType: "single" | "multiple";
  isRequired: boolean;
  minSelect: number;
  maxSelect: number | null;
  options: MenuOption[];
}

export interface MenuProduct {
  id: string;
  name: string;
  basePriceCents: number;
  isAvailable: boolean;
  groups: MenuOptionGroup[];
}

export interface DeliveryZoneSnapshot {
  id: string;
  name: string;
  feeCents: number;
  isActive: boolean;
}

export interface PricingSettings {
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  minOrderCents: number;
}

export interface MenuSnapshot {
  products: Map<string, MenuProduct>;
  zones: Map<string, DeliveryZoneSnapshot>;
  settings: PricingSettings;
}

export interface CartLineInput {
  /** Stable id for this line in the browser, so errors can point at it. */
  lineId: string;
  productId: string;
  quantity: number;
  optionIds: string[];
  notes?: string | null;
}

export interface CartInput {
  lines: CartLineInput[];
  fulfillment: FulfillmentType;
  deliveryZoneId?: string | null;
}

export interface PricedOptionSelection {
  optionId: string;
  groupName: string;
  optionName: string;
  priceDeltaCents: number;
}

export interface PricedLine {
  lineId: string;
  productId: string;
  productName: string;
  unitBasePriceCents: number;
  quantity: number;
  notes: string | null;
  options: PricedOptionSelection[];
  /** (base + option deltas) x quantity */
  lineTotalCents: number;
}

export interface PricedOrder {
  lines: PricedLine[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  deliveryZoneId: string | null;
}

export type PricingErrorCode =
  | "empty_cart"
  | "product_missing"
  | "product_unavailable"
  | "option_missing"
  | "option_unavailable"
  | "group_required"
  | "group_min"
  | "group_max"
  | "single_select_violation"
  | "invalid_quantity"
  | "fulfillment_disabled"
  | "zone_required"
  | "zone_invalid"
  | "below_minimum"
  | "negative_price";

export interface PricingError {
  code: PricingErrorCode;
  message: string;
  lineId?: string;
}

export type PricingResult =
  | { ok: true; order: PricedOrder }
  | { ok: false; errors: PricingError[] };

const MAX_QUANTITY = 99;

export function priceOrder(cart: CartInput, menu: MenuSnapshot): PricingResult {
  const errors: PricingError[] = [];
  const lines: PricedLine[] = [];

  if (cart.lines.length === 0) {
    return { ok: false, errors: [{ code: "empty_cart", message: "El carrito está vacío." }] };
  }

  for (const line of cart.lines) {
    const priced = priceLine(line, menu, errors);
    if (priced) lines.push(priced);
  }

  const subtotalCents = lines.reduce((total, line) => total + line.lineTotalCents, 0);

  // --- Fulfillment -------------------------------------------------------
  let deliveryFeeCents = 0;
  let deliveryZoneId: string | null = null;

  if (cart.fulfillment === "delivery") {
    if (!menu.settings.deliveryEnabled) {
      errors.push({
        code: "fulfillment_disabled",
        message: "El local no está haciendo delivery en este momento.",
      });
    }

    if (!cart.deliveryZoneId) {
      errors.push({ code: "zone_required", message: "Elegí una zona de entrega." });
    } else {
      const zone = menu.zones.get(cart.deliveryZoneId);
      if (!zone || !zone.isActive) {
        errors.push({
          code: "zone_invalid",
          message: "Esa zona de entrega ya no está disponible.",
        });
      } else {
        deliveryFeeCents = zone.feeCents;
        deliveryZoneId = zone.id;
      }
    }
  } else if (!menu.settings.pickupEnabled) {
    errors.push({
      code: "fulfillment_disabled",
      message: "El local no está aceptando pedidos para retirar.",
    });
  }

  // The minimum applies to the food, not to the delivery fee — charging someone
  // a shipping cost to reach the minimum that unlocks shipping is circular.
  if (subtotalCents < menu.settings.minOrderCents) {
    errors.push({
      code: "below_minimum",
      message: `El pedido mínimo es de ${(menu.settings.minOrderCents / 100).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}.`,
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    order: {
      lines,
      subtotalCents,
      deliveryFeeCents,
      totalCents: subtotalCents + deliveryFeeCents,
      deliveryZoneId,
    },
  };
}

function priceLine(
  line: CartLineInput,
  menu: MenuSnapshot,
  errors: PricingError[],
): PricedLine | null {
  const product = menu.products.get(line.productId);

  if (!product) {
    errors.push({
      code: "product_missing",
      message: "Uno de los productos ya no está en el menú.",
      lineId: line.lineId,
    });
    return null;
  }

  if (!product.isAvailable) {
    errors.push({
      code: "product_unavailable",
      message: `${product.name} está agotado.`,
      lineId: line.lineId,
    });
    return null;
  }

  if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) {
    errors.push({
      code: "invalid_quantity",
      message: `La cantidad de ${product.name} no es válida.`,
      lineId: line.lineId,
    });
    return null;
  }

  const selectedIds = new Set(line.optionIds);
  const selections: PricedOptionSelection[] = [];
  let lineHasError = false;

  for (const group of product.groups) {
    const chosen = group.options.filter((option) => selectedIds.has(option.id));

    for (const option of chosen) {
      if (!option.isAvailable) {
        errors.push({
          code: "option_unavailable",
          message: `"${option.name}" no está disponible.`,
          lineId: line.lineId,
        });
        lineHasError = true;
        continue;
      }
      selections.push({
        optionId: option.id,
        groupName: group.name,
        optionName: option.name,
        priceDeltaCents: option.priceDeltaCents,
      });
      selectedIds.delete(option.id);
    }

    if (group.selectionType === "single" && chosen.length > 1) {
      errors.push({
        code: "single_select_violation",
        message: `Elegí una sola opción en "${group.name}".`,
        lineId: line.lineId,
      });
      lineHasError = true;
    }

    if (group.isRequired && chosen.length === 0) {
      errors.push({
        code: "group_required",
        message: `Falta elegir "${group.name}" en ${product.name}.`,
        lineId: line.lineId,
      });
      lineHasError = true;
    }

    // A group nobody touched should not complain about its minimum; only a
    // group that is required, or one the customer started filling in, does.
    if (chosen.length > 0 && chosen.length < group.minSelect) {
      errors.push({
        code: "group_min",
        message: `Elegí al menos ${group.minSelect} en "${group.name}".`,
        lineId: line.lineId,
      });
      lineHasError = true;
    }

    if (group.maxSelect !== null && chosen.length > group.maxSelect) {
      errors.push({
        code: "group_max",
        message: `Podés elegir hasta ${group.maxSelect} en "${group.name}".`,
        lineId: line.lineId,
      });
      lineHasError = true;
    }
  }

  // Ids left over belong to another product, or to a group that was deleted
  // while the cart sat open in a tab.
  if (selectedIds.size > 0) {
    errors.push({
      code: "option_missing",
      message: `Alguna opción de ${product.name} ya no existe. Volvé a armar ese ítem.`,
      lineId: line.lineId,
    });
    lineHasError = true;
  }

  if (lineHasError) return null;

  const unitCents =
    product.basePriceCents +
    selections.reduce((total, selection) => total + selection.priceDeltaCents, 0);

  if (unitCents < 0) {
    errors.push({
      code: "negative_price",
      message: `El precio de ${product.name} quedó en negativo.`,
      lineId: line.lineId,
    });
    return null;
  }

  return {
    lineId: line.lineId,
    productId: product.id,
    productName: product.name,
    unitBasePriceCents: product.basePriceCents,
    quantity: line.quantity,
    notes: line.notes?.trim() || null,
    options: selections,
    lineTotalCents: unitCents * line.quantity,
  };
}
