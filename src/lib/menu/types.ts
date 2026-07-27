import type { MenuProduct, MenuSnapshot } from "@/lib/pricing";
import type { Tables } from "@/types/database";

/**
 * Pure shapes and mappers shared between server (queries.ts) and client
 * (menu-client.tsx, product-sheet.tsx) code.
 *
 * Kept in a separate module on purpose: queries.ts imports the Supabase
 * server client, which pulls in `next/headers`. A client component importing
 * anything from that file — even just a type — drags that server-only
 * dependency into the browser bundle and fails the build. This file has zero
 * server imports, so it's safe from either side.
 */

export interface PublicMenuData {
  business: Tables<"businesses">;
  settings: Tables<"business_settings">;
  categories: (Tables<"categories"> & { products: DisplayProduct[] })[];
  zones: Tables<"delivery_zones">[];
  isOpenNow: boolean;
}

export interface DisplayProduct extends Tables<"products"> {
  groups: (Tables<"option_groups"> & { options: Tables<"options">[] })[];
}

/** Shapes a display product into the pricing engine's input format. */
export function toMenuProduct(product: DisplayProduct): MenuProduct {
  return {
    id: product.id,
    name: product.name,
    basePriceCents: product.base_price_cents,
    isAvailable: product.is_available,
    groups: product.groups.map((group) => ({
      id: group.id,
      name: group.name,
      selectionType: group.selection_type,
      isRequired: group.is_required,
      minSelect: group.min_select,
      maxSelect: group.max_select,
      options: group.options.map((option) => ({
        id: option.id,
        name: option.name,
        priceDeltaCents: option.price_delta_cents,
        isAvailable: option.is_available,
      })),
    })),
  };
}

/**
 * Builds the pricing engine's input from data already fetched for the page,
 * so the cart and product sheets can price client-side without a second
 * round trip. This is a UX convenience only — /api/orders always re-derives
 * prices from the database independently before charging anyone.
 */
export function buildMenuSnapshot(data: PublicMenuData): MenuSnapshot {
  const products = new Map<string, MenuProduct>();
  for (const category of data.categories) {
    for (const product of category.products) {
      products.set(product.id, toMenuProduct(product));
    }
  }

  const zones = new Map(
    data.zones.map((zone) => [
      zone.id,
      { id: zone.id, name: zone.name, feeCents: zone.fee_cents, isActive: zone.is_active },
    ]),
  );

  return {
    products,
    zones,
    settings: {
      deliveryEnabled: data.settings.delivery_enabled,
      pickupEnabled: data.settings.pickup_enabled,
      minOrderCents: data.settings.min_order_cents,
    },
  };
}
