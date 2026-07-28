import "server-only";

import { notFound } from "next/navigation";

import { isBusinessOpenNow } from "@/lib/business/hours";
import type { MenuProduct, MenuSnapshot } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

import type { DisplayProduct, PublicMenuData } from "./types";

export type { DisplayProduct, PublicMenuData } from "./types";
export { buildMenuSnapshot, toMenuProduct } from "./types";

/**
 * Looks up a business by its public slug. 404s if it does not exist or is
 * not servable.
 *
 * `tableLabel` comes from a scanned QR's `?mesa=` query param. It is looked
 * up with the SAME anon client as everything else here, so the tables
 * module's RLS policy (restaurant_tables_public_read, gated on
 * business_has_module) is what decides whether it resolves — a business
 * without the module returns zero rows and this silently falls back to the
 * normal delivery/pickup flow, exactly as if no `?mesa=` had been given.
 */
export async function getPublicMenu(slug: string, tableLabel?: string): Promise<PublicMenuData> {
  const supabase = createPublicClient();

  const { data: business } = await supabase.from("businesses").select("*").eq("slug", slug).maybeSingle();
  if (!business) notFound();

  const [
    settingsResult,
    hoursResult,
    categoriesResult,
    productsResult,
    groupsResult,
    optionsResult,
    zonesResult,
    tableResult,
  ] = await Promise.all([
    supabase.from("business_settings").select("*").eq("business_id", business.id).single(),
    supabase.from("business_hours").select("day_of_week, opens_at, closes_at").eq("business_id", business.id),
    supabase
      .from("categories")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("products")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order"),
    supabase
      .from("option_groups")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order"),
    supabase
      .from("options")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order"),
    supabase
      .from("delivery_zones")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order"),
    tableLabel
      ? supabase
          .from("restaurant_tables")
          .select("id, label")
          .eq("business_id", business.id)
          .eq("label", tableLabel)
          .eq("is_active", true)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (settingsResult.error) notFound();

  const optionsByGroup = new Map<string, Tables<"options">[]>();
  for (const option of optionsResult.data ?? []) {
    const list = optionsByGroup.get(option.option_group_id) ?? [];
    list.push(option);
    optionsByGroup.set(option.option_group_id, list);
  }

  const groupsByProduct = new Map<string, (Tables<"option_groups"> & { options: Tables<"options">[] })[]>();
  for (const group of groupsResult.data ?? []) {
    const list = groupsByProduct.get(group.product_id) ?? [];
    list.push({ ...group, options: optionsByGroup.get(group.id) ?? [] });
    groupsByProduct.set(group.product_id, list);
  }

  const productsByCategory = new Map<string, DisplayProduct[]>();
  for (const product of productsResult.data ?? []) {
    const list = productsByCategory.get(product.category_id) ?? [];
    list.push({ ...product, groups: groupsByProduct.get(product.id) ?? [] });
    productsByCategory.set(product.category_id, list);
  }

  const categories = (categoriesResult.data ?? [])
    .map((category) => ({ ...category, products: productsByCategory.get(category.id) ?? [] }))
    // A category with every product deleted or hidden shows nothing useful.
    .filter((category) => category.products.length > 0);

  return {
    business,
    settings: settingsResult.data,
    categories,
    zones: zonesResult.data ?? [],
    table: tableResult.data ?? null,
    isOpenNow: isBusinessOpenNow(business.timezone, hoursResult.data ?? [], business.is_open_manual),
  };
}

/**
 * Re-reads the menu with the SERVICE ROLE and shapes it into the pricing
 * engine's input. Used by the order endpoint: the browser is never trusted for
 * prices, so this is a second, independent fetch at checkout time, not the one
 * that rendered the page.
 */
export async function loadMenuSnapshotForPricing(businessId: string): Promise<MenuSnapshot> {
  const supabase = createAdminClient();

  const [settingsResult, productsResult, groupsResult, optionsResult, zonesResult, tablesModule] =
    await Promise.all([
      supabase.from("business_settings").select("*").eq("business_id", businessId).single(),
      supabase.from("products").select("*").eq("business_id", businessId),
      supabase.from("option_groups").select("*").eq("business_id", businessId),
      supabase.from("options").select("*").eq("business_id", businessId),
      supabase.from("delivery_zones").select("*").eq("business_id", businessId),
      supabase
        .from("business_modules")
        .select("enabled")
        .eq("business_id", businessId)
        .eq("module_key", "tables")
        .maybeSingle(),
    ]);

  if (settingsResult.error) {
    throw new Error(`No pude leer business_settings de ${businessId}: ${settingsResult.error.message}`);
  }

  const optionsByGroup = new Map<string, Tables<"options">[]>();
  for (const option of optionsResult.data ?? []) {
    const list = optionsByGroup.get(option.option_group_id) ?? [];
    list.push(option);
    optionsByGroup.set(option.option_group_id, list);
  }

  const groupsByProduct = new Map<string, Tables<"option_groups">[]>();
  for (const group of groupsResult.data ?? []) {
    const list = groupsByProduct.get(group.product_id) ?? [];
    list.push(group);
    groupsByProduct.set(group.product_id, list);
  }

  const products = new Map<string, MenuProduct>();
  for (const product of productsResult.data ?? []) {
    products.set(product.id, {
      id: product.id,
      name: product.name,
      basePriceCents: product.base_price_cents,
      isAvailable: product.is_available,
      groups: (groupsByProduct.get(product.id) ?? []).map((group) => ({
        id: group.id,
        name: group.name,
        selectionType: group.selection_type,
        isRequired: group.is_required,
        minSelect: group.min_select,
        maxSelect: group.max_select,
        options: (optionsByGroup.get(group.id) ?? []).map((option) => ({
          id: option.id,
          name: option.name,
          priceDeltaCents: option.price_delta_cents,
          isAvailable: option.is_available,
        })),
      })),
    });
  }

  const zones = new Map(
    (zonesResult.data ?? []).map((zone) => [
      zone.id,
      { id: zone.id, name: zone.name, feeCents: zone.fee_cents, isActive: zone.is_active },
    ]),
  );

  return {
    products,
    zones,
    settings: {
      deliveryEnabled: settingsResult.data.delivery_enabled,
      pickupEnabled: settingsResult.data.pickup_enabled,
      minOrderCents: settingsResult.data.min_order_cents,
      dineInEnabled: tablesModule.data?.enabled ?? false,
    },
  };
}
