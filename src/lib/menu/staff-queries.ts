import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

/**
 * Everything for the ABM screens — unlike getPublicMenu (src/lib/menu/queries.ts)
 * this does NOT filter by is_active/is_available: staff need to see and
 * re-enable a hidden category or a sold-out product, not just the customer view.
 */

export interface StaffCategory extends Tables<"categories"> {
  products: Tables<"products">[];
}

export async function fetchStaffMenu(
  supabase: SupabaseClient<Database>,
  businessId: string,
): Promise<StaffCategory[]> {
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("*").eq("business_id", businessId).order("sort_order"),
    supabase.from("products").select("*").eq("business_id", businessId).order("sort_order"),
  ]);

  const productsByCategory = new Map<string, Tables<"products">[]>();
  for (const product of productsResult.data ?? []) {
    const list = productsByCategory.get(product.category_id) ?? [];
    list.push(product);
    productsByCategory.set(product.category_id, list);
  }

  return (categoriesResult.data ?? []).map((category) => ({
    ...category,
    products: productsByCategory.get(category.id) ?? [],
  }));
}

export interface StaffProductDetail extends Tables<"products"> {
  groups: (Tables<"option_groups"> & { options: Tables<"options">[] })[];
}

export async function fetchStaffProduct(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<StaffProductDetail | null> {
  const { data: product } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
  if (!product) return null;

  const { data: groups } = await supabase
    .from("option_groups")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");

  const groupIds = (groups ?? []).map((g) => g.id);
  const { data: options } =
    groupIds.length > 0
      ? await supabase.from("options").select("*").in("option_group_id", groupIds).order("sort_order")
      : { data: [] };

  const optionsByGroup = new Map<string, Tables<"options">[]>();
  for (const option of options ?? []) {
    const list = optionsByGroup.get(option.option_group_id) ?? [];
    list.push(option);
    optionsByGroup.set(option.option_group_id, list);
  }

  return {
    ...product,
    groups: (groups ?? []).map((group) => ({ ...group, options: optionsByGroup.get(group.id) ?? [] })),
  };
}
