import "server-only";

import { randomUUID } from "node:crypto";

import type { createClient } from "@/lib/supabase/server";

import type { MenuImportDraft } from "./import";

type Client = Awaited<ReturnType<typeof createClient>>;

/**
 * Writes a reviewed import into the menu, through the caller's SESSION
 * client — RLS (`*_staff_write`: owner/manager of this business, or a
 * superadmin) is what authorizes it, exactly like typing it by hand.
 *
 * Ids are generated here rather than read back from the inserts, so the
 * product -> option group -> option chain never depends on PostgREST
 * returning rows in input order. Categories whose name already exists
 * (case-insensitive) are reused, so importing a second page adds to "Pizzas"
 * instead of creating "Pizzas" twice. New things go after what is already
 * there; nothing existing is touched or deleted.
 *
 * Not one transaction (PostgREST has none across tables). If a later insert
 * fails, earlier rows stay — they are ordinary menu rows the owner can see
 * and delete, which beats an all-or-nothing that silently loses the work.
 */
export async function applyMenuImport(
  supabase: Client,
  businessId: string,
  draft: MenuImportDraft,
): Promise<{ ok: true; products: number; categories: number } | { ok: false; error: string }> {
  const { data: existing, error: readError } = await supabase
    .from("categories")
    .select("id, name, sort_order")
    .eq("business_id", businessId);
  if (readError) return { ok: false, error: "No pudimos leer el menú actual." };

  const byName = new Map((existing ?? []).map((c) => [c.name.trim().toLowerCase(), c.id]));
  let nextCategorySort = Math.max(0, ...(existing ?? []).map((c) => c.sort_order + 1));

  const newCategories: { id: string; business_id: string; name: string; sort_order: number }[] = [];
  const products: {
    id: string;
    business_id: string;
    category_id: string;
    name: string;
    description: string | null;
    base_price_cents: number;
    sort_order: number;
  }[] = [];
  const groups: {
    id: string;
    business_id: string;
    product_id: string;
    name: string;
    selection_type: "single" | "multiple";
    is_required: boolean;
    min_select: number;
    max_select: number | null;
    sort_order: number;
  }[] = [];
  const options: {
    business_id: string;
    option_group_id: string;
    name: string;
    price_delta_cents: number;
    sort_order: number;
  }[] = [];

  const touchedCategories = new Set<string>();

  for (const category of draft.categories) {
    const included = category.products.filter((product) => product.include);
    if (included.length === 0) continue;

    const key = category.name.trim().toLowerCase();
    let categoryId = byName.get(key);
    if (!categoryId) {
      categoryId = randomUUID();
      byName.set(key, categoryId);
      newCategories.push({ id: categoryId, business_id: businessId, name: category.name, sort_order: nextCategorySort++ });
    }
    touchedCategories.add(categoryId);

    included.forEach((product, productIndex) => {
      const productId = randomUUID();
      products.push({
        id: productId,
        business_id: businessId,
        category_id: categoryId,
        name: product.name,
        description: product.description || null,
        base_price_cents: product.priceCents,
        // Offset so imported dishes land after anything already in the category.
        sort_order: 10_000 + productIndex,
      });

      product.optionGroups.forEach((group, groupIndex) => {
        const groupId = randomUUID();
        groups.push({
          id: groupId,
          business_id: businessId,
          product_id: productId,
          name: group.name,
          selection_type: group.selection,
          is_required: group.required,
          min_select: group.required ? 1 : 0,
          max_select: group.selection === "single" ? 1 : null,
          sort_order: groupIndex,
        });
        group.options.forEach((option, optionIndex) => {
          options.push({
            business_id: businessId,
            option_group_id: groupId,
            name: option.name,
            price_delta_cents: option.priceDeltaCents,
            sort_order: optionIndex,
          });
        });
      });
    });
  }

  if (products.length === 0) return { ok: false, error: "No elegiste ningún producto para cargar." };

  if (newCategories.length > 0) {
    const { error } = await supabase.from("categories").insert(newCategories);
    if (error) return { ok: false, error: "No pudimos crear las categorías." };
  }

  const { error: productError } = await supabase.from("products").insert(products);
  if (productError) return { ok: false, error: "No pudimos cargar los productos." };

  if (groups.length > 0) {
    const { error } = await supabase.from("option_groups").insert(groups);
    if (error) return { ok: false, error: "Se cargaron los productos, pero no sus variantes." };
  }
  if (options.length > 0) {
    const { error } = await supabase.from("options").insert(options);
    if (error) return { ok: false, error: "Se cargaron los productos, pero no todas sus opciones." };
  }

  return { ok: true, products: products.length, categories: touchedCategories.size };
}
