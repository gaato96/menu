"use server";

import { revalidatePath } from "next/cache";

import { requireModule, requireStaff } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

/**
 * `stock_quantity: null` means "not tracked" — the same state a product is
 * born in. Emptying the field in the UI goes back to that state rather than
 * to zero, which would read as "sin stock" instead of "no llevamos la cuenta".
 */
export async function updateProductStock(productId: string, formData: FormData) {
  const staff = await requireStaff();
  requireModule(staff, "inventory");
  const supabase = await createClient();

  const rawQuantity = String(formData.get("stockQuantity") ?? "").trim();
  const rawThreshold = String(formData.get("lowStockThreshold") ?? "").trim();

  const stockQuantity = rawQuantity === "" ? null : Math.max(0, Math.trunc(Number(rawQuantity)));
  if (rawQuantity !== "" && !Number.isFinite(stockQuantity)) return;

  const lowStockThreshold = Math.max(0, Math.trunc(Number(rawThreshold) || 0));

  await supabase
    .from("products")
    .update({ stock_quantity: stockQuantity, low_stock_threshold: lowStockThreshold })
    .eq("id", productId);

  revalidatePath("/panel/stock");
  revalidatePath(`/panel/menu/producto/${productId}`);
}

/** Quick +1/-1 from the stock list, without opening the product detail. */
export async function adjustProductStock(productId: string, delta: number) {
  const staff = await requireStaff();
  requireModule(staff, "inventory");
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("stock_quantity")
    .eq("id", productId)
    .single();

  if (!product || product.stock_quantity === null) return;

  const next = Math.max(0, product.stock_quantity + delta);
  await supabase.from("products").update({ stock_quantity: next }).eq("id", productId);
  revalidatePath("/panel/stock");
}
