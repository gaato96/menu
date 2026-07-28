"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth/context";
import { parseMoneyToCents } from "@/lib/money";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Every mutation here runs through the session-scoped client, not admin —
 * RLS (`*_staff_write`, owner/manager only) is the real authority. The one
 * exception is the image upload, which needs the service role to reach
 * Storage; see uploadProductImage below for why that's still safe.
 */

async function swapSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "categories" | "products" | "option_groups" | "options",
  siblingFilter: Record<string, string>,
  currentId: string,
  direction: "up" | "down",
) {
  let query = supabase.from(table).select("id, sort_order").order("sort_order");
  for (const [key, value] of Object.entries(siblingFilter)) query = query.eq(key, value);
  const { data: siblings } = await query;
  if (!siblings) return;

  const index = siblings.findIndex((s) => s.id === currentId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= siblings.length) return;

  const current = siblings[index];
  const target = siblings[targetIndex];

  await Promise.all([
    supabase.from(table).update({ sort_order: target.sort_order }).eq("id", current.id),
    supabase.from(table).update({ sort_order: current.sort_order }).eq("id", target.id),
  ]);
}

// --- Categories --------------------------------------------------------

export async function createCategory(formData: FormData) {
  const staff = await requireStaff();
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("business_id", staff.business.id);

  await supabase
    .from("categories")
    .insert({ business_id: staff.business.id, name, sort_order: count ?? 0 });

  revalidatePath("/panel/menu");
}

export async function updateCategoryName(categoryId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  await supabase.from("categories").update({ name }).eq("id", categoryId);
  revalidatePath("/panel/menu");
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("categories").update({ is_active: isActive }).eq("id", categoryId);
  revalidatePath("/panel/menu");
}

export async function moveCategory(categoryId: string, direction: "up" | "down") {
  const staff = await requireStaff();
  const supabase = await createClient();
  await swapSortOrder(supabase, "categories", { business_id: staff.business.id }, categoryId, direction);
  revalidatePath("/panel/menu");
}

export async function deleteCategory(categoryId: string) {
  const staff = await requireStaff();
  const supabase = await createClient();

  // Storage objects have no FK to ride the cascade, so their product ids are
  // captured before the delete removes the row that would have told us.
  const { data: products } = await supabase.from("products").select("id").eq("category_id", categoryId);

  // FK is ON DELETE CASCADE (products -> option_groups -> options), so this
  // removes the whole subtree. The confirm() before this call is the only
  // guard — there is no undo.
  await supabase.from("categories").delete().eq("id", categoryId);

  await Promise.all((products ?? []).map((p) => removeProductImages(staff.business.id, p.id)));

  revalidatePath("/panel/menu");
}

// --- Products ------------------------------------------------------------

export async function createProduct(categoryId: string, formData: FormData) {
  const staff = await requireStaff();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const priceCents = parseMoneyToCents(String(formData.get("price") ?? ""));
  if (!name || priceCents === null) return;

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  await supabase.from("products").insert({
    business_id: staff.business.id,
    category_id: categoryId,
    name,
    base_price_cents: priceCents,
    sort_order: count ?? 0,
  });

  revalidatePath("/panel/menu");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceCents = parseMoneyToCents(String(formData.get("price") ?? ""));
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!name || priceCents === null || !categoryId) return;

  await supabase
    .from("products")
    .update({
      name,
      description: description || null,
      base_price_cents: priceCents,
      category_id: categoryId,
    })
    .eq("id", productId);

  revalidatePath("/panel/menu");
  revalidatePath(`/panel/menu/producto/${productId}`);
}

export async function toggleProductAvailable(productId: string, isAvailable: boolean) {
  const supabase = await createClient();
  await supabase.from("products").update({ is_available: isAvailable }).eq("id", productId);
  revalidatePath("/panel/menu");
  revalidatePath(`/panel/menu/producto/${productId}`);
}

export async function moveProduct(productId: string, categoryId: string, direction: "up" | "down") {
  const supabase = await createClient();
  await swapSortOrder(supabase, "products", { category_id: categoryId }, productId, direction);
  revalidatePath("/panel/menu");
}

/**
 * Storage has no FK to `products` — a table-level delete (direct or via the
 * category cascade below) never touches it on its own, so every deleted
 * product would otherwise leak its photo in the bucket forever.
 */
async function removeProductImages(businessId: string, productId: string) {
  const admin = createAdminClient();
  const folder = `${businessId}/${productId}`;
  const { data: files } = await admin.storage.from("product-images").list(folder);
  if (files && files.length > 0) {
    await admin.storage.from("product-images").remove(files.map((f) => `${folder}/${f.name}`));
  }
}

export async function deleteProduct(productId: string) {
  const staff = await requireStaff();
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", productId);
  await removeProductImages(staff.business.id, productId);
  revalidatePath("/panel/menu");
  redirect("/panel/menu");
}

// --- Product image ---------------------------------------------------------

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Uploads through the ADMIN client rather than the session one. Storage RLS
 * on `storage.objects` is a second policy system on top of the table RLS
 * already covering `products`, and half-configuring it under time pressure
 * is worse than not having it. Safety instead comes from checking the
 * session's own staff/business membership HERE, before ever touching Storage
 * — the same shape of trust boundary as the order endpoint (see
 * src/lib/supabase/admin.ts) and the push subscribe route.
 */
export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<{ ok?: true; error?: string }> {
  const staff = await requireStaff();
  const session = await createClient();

  // Confirms the product actually belongs to the caller's business —
  // RLS on `products` already guarantees this select returns nothing
  // otherwise, so this doubles as the authorization check.
  const { data: product } = await session
    .from("products")
    .select("id, image_url")
    .eq("id", productId)
    .maybeSingle();
  if (!product) return { error: "Producto no encontrado." };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Elegí una imagen." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "La imagen pesa más de 5MB." };
  if (!ALLOWED_TYPES.has(file.type)) return { error: "Formato no soportado. Usá JPG, PNG o WebP." };

  const admin = createAdminClient();
  const extension = file.type.split("/")[1];
  const path = `${staff.business.id}/${productId}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: "No pudimos subir la imagen." };

  const { data: publicUrl } = admin.storage.from("product-images").getPublicUrl(path);

  await session.from("products").update({ image_url: publicUrl.publicUrl }).eq("id", productId);

  // Best-effort cleanup of the previous file — a failure here just leaves an
  // orphaned object in the bucket, never a broken product.
  if (product.image_url?.includes("/product-images/")) {
    const oldPath = product.image_url.split("/product-images/")[1];
    if (oldPath) await admin.storage.from("product-images").remove([oldPath]);
  }

  revalidatePath(`/panel/menu/producto/${productId}`);
  revalidatePath("/panel/menu");
  return { ok: true };
}

// --- Option groups ---------------------------------------------------------

export async function createOptionGroup(productId: string, formData: FormData) {
  const staff = await requireStaff();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const selectionType = formData.get("selectionType") === "multiple" ? "multiple" : "single";
  const isRequired = formData.get("isRequired") === "on";
  const minSelect = isRequired ? Math.max(1, Number(formData.get("minSelect") ?? 1)) : 0;
  const maxSelectRaw = String(formData.get("maxSelect") ?? "").trim();
  const maxSelect = selectionType === "single" ? 1 : maxSelectRaw ? Number(maxSelectRaw) : null;
  if (!name) return;

  const { count } = await supabase
    .from("option_groups")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  await supabase.from("option_groups").insert({
    business_id: staff.business.id,
    product_id: productId,
    name,
    selection_type: selectionType,
    is_required: isRequired,
    min_select: minSelect,
    max_select: maxSelect,
    sort_order: count ?? 0,
  });

  revalidatePath(`/panel/menu/producto/${productId}`);
}

export async function deleteOptionGroup(groupId: string, productId: string) {
  const supabase = await createClient();
  await supabase.from("option_groups").delete().eq("id", groupId);
  revalidatePath(`/panel/menu/producto/${productId}`);
}

// --- Options -----------------------------------------------------------

export async function createOption(groupId: string, productId: string, formData: FormData) {
  const staff = await requireStaff();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const deltaInput = String(formData.get("priceDelta") ?? "0").trim();
  const priceDeltaCents = deltaInput ? (parseMoneyToCents(deltaInput.replace("-", "")) ?? 0) : 0;
  const isNegative = deltaInput.trim().startsWith("-");
  if (!name) return;

  const { count } = await supabase
    .from("options")
    .select("id", { count: "exact", head: true })
    .eq("option_group_id", groupId);

  await supabase.from("options").insert({
    business_id: staff.business.id,
    option_group_id: groupId,
    name,
    price_delta_cents: isNegative ? -priceDeltaCents : priceDeltaCents,
    sort_order: count ?? 0,
  });

  revalidatePath(`/panel/menu/producto/${productId}`);
}

export async function toggleOptionAvailable(optionId: string, productId: string, isAvailable: boolean) {
  const supabase = await createClient();
  await supabase.from("options").update({ is_available: isAvailable }).eq("id", optionId);
  revalidatePath(`/panel/menu/producto/${productId}`);
}

export async function deleteOption(optionId: string, productId: string) {
  const supabase = await createClient();
  await supabase.from("options").delete().eq("id", optionId);
  revalidatePath(`/panel/menu/producto/${productId}`);
}
