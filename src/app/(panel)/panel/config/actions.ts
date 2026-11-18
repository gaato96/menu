"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/auth/context";
import { canConfigure } from "@/lib/auth/roles";
import { verifyAccessToken } from "@/lib/payments/mercadopago";
import { parseMoneyToCents } from "@/lib/money";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// --- Business-wide -------------------------------------------------------

export async function toggleOpenManual(isOpen: boolean) {
  const staff = await requireStaff();
  const supabase = await createClient();
  await supabase.from("businesses").update({ is_open_manual: isOpen }).eq("id", staff.business.id);
  revalidatePath("/panel/config");
  revalidatePath("/panel");
}

export async function toggleCatalogView(enabled: boolean) {
  const staff = await requireStaff();
  const supabase = await createClient();
  await supabase
    .from("business_settings")
    .update({ catalog_view_enabled: enabled })
    .eq("business_id", staff.business.id);
  revalidatePath("/panel/config");
  revalidatePath(`/m/${staff.business.slug}`);
  revalidatePath(`/m/${staff.business.slug}/catalogo`);
}

/**
 * Whether the QR opens straight into the vertical view.
 *
 * Turning it on also turns catalog_view_enabled on: "be the front door" makes
 * no sense for a view that is switched off, and letting the two disagree
 * would give an owner a toggle that appears to do nothing.
 */
export async function toggleCatalogDefault(enabled: boolean) {
  const staff = await requireStaff();
  const supabase = await createClient();
  await supabase
    .from("business_settings")
    .update(
      enabled
        ? { catalog_is_default: true, catalog_view_enabled: true }
        : { catalog_is_default: false },
    )
    .eq("business_id", staff.business.id);
  revalidatePath("/panel/config");
  revalidatePath(`/m/${staff.business.slug}`);
  revalidatePath(`/m/${staff.business.slug}/catalogo`);
}

// --- Branding images -------------------------------------------------------

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Uploads through the ADMIN client, same trust boundary as
 * uploadProductImage in panel/menu/actions.ts: requireStaff() here is the
 * only authorization check, storage.objects carries no RLS of its own.
 */
async function uploadBusinessImage(
  formData: FormData,
  field: "logo_url" | "cover_image_url",
): Promise<{ ok?: true; error?: string }> {
  const staff = await requireStaff();
  const session = await createClient();

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Elegí una imagen." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "La imagen pesa más de 5MB." };
  if (!ALLOWED_TYPES.has(file.type)) return { error: "Formato no soportado. Usá JPG, PNG o WebP." };

  const admin = createAdminClient();
  const extension = file.type.split("/")[1];
  const path = `${staff.business.id}/${field}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from("business-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: "No pudimos subir la imagen." };

  const { data: publicUrl } = admin.storage.from("business-images").getPublicUrl(path);

  const previousUrl = staff.business[field];
  await session
    .from("businesses")
    .update(field === "logo_url" ? { logo_url: publicUrl.publicUrl } : { cover_image_url: publicUrl.publicUrl })
    .eq("id", staff.business.id);

  if (previousUrl?.includes("/business-images/")) {
    const oldPath = previousUrl.split("/business-images/")[1];
    if (oldPath) await admin.storage.from("business-images").remove([oldPath]);
  }

  revalidatePath("/panel/config");
  revalidatePath(`/m/${staff.business.slug}`);
  return { ok: true };
}

export async function uploadLogo(formData: FormData) {
  return uploadBusinessImage(formData, "logo_url");
}

export async function uploadCoverImage(formData: FormData) {
  return uploadBusinessImage(formData, "cover_image_url");
}

export async function updateSettings(
  formData: FormData,
): Promise<{ ok?: true; error?: string }> {
  const staff = await requireStaff();
  const supabase = await createClient();

  const deliveryEnabled = formData.get("deliveryEnabled") === "on";
  const pickupEnabled = formData.get("pickupEnabled") === "on";
  const cashEnabled = formData.get("cashEnabled") === "on";
  const transferEnabled = formData.get("transferEnabled") === "on";

  // The schema requires at least one fulfillment and one payment method —
  // let the DB CHECK reject silently unmet combos rather than duplicate the
  // rule here; this just stops the obviously-empty case early.
  if (!deliveryEnabled && !pickupEnabled) return { error: "Activá delivery o retiro." };
  if (!cashEnabled && !transferEnabled) return { error: "Activá efectivo o transferencia." };

  const minOrderCents = parseMoneyToCents(String(formData.get("minOrder") ?? "0")) ?? 0;
  const prepTime = Math.max(0, Math.min(240, Number(formData.get("prepTime") ?? 30)));

  const { error } = await supabase
    .from("business_settings")
    .update({
      delivery_enabled: deliveryEnabled,
      pickup_enabled: pickupEnabled,
      min_order_cents: minOrderCents,
      cash_enabled: cashEnabled,
      transfer_enabled: transferEnabled,
      transfer_alias: String(formData.get("transferAlias") ?? "").trim() || null,
      transfer_cbu: String(formData.get("transferCbu") ?? "").trim() || null,
      transfer_holder: String(formData.get("transferHolder") ?? "").trim() || null,
      prep_time_minutes: prepTime,
    })
    .eq("business_id", staff.business.id);

  if (error) return { error: "No pudimos guardar: " + error.message.replace(/^.*?:\s*/, "") };

  revalidatePath("/panel/config");
  return { ok: true };
}

// --- Delivery zones ------------------------------------------------------

export async function createDeliveryZone(formData: FormData) {
  const staff = await requireStaff();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const feeCents = parseMoneyToCents(String(formData.get("fee") ?? "0")) ?? 0;
  if (!name) return;

  const { count } = await supabase
    .from("delivery_zones")
    .select("id", { count: "exact", head: true })
    .eq("business_id", staff.business.id);

  await supabase
    .from("delivery_zones")
    .insert({ business_id: staff.business.id, name, fee_cents: feeCents, sort_order: count ?? 0 });

  revalidatePath("/panel/config");
}

export async function toggleZoneActive(zoneId: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("delivery_zones").update({ is_active: isActive }).eq("id", zoneId);
  revalidatePath("/panel/config");
}

export async function deleteZone(zoneId: string) {
  const supabase = await createClient();
  // A zone referenced by past orders can't be hard-deleted (orders.delivery_zone_id
  // FK has no cascade here on purpose — history must keep pointing at something
  // real). Deactivating is the correct action for "stop using this zone"; this
  // delete only succeeds for a zone nobody has ordered into yet.
  await supabase.from("delivery_zones").delete().eq("id", zoneId);
  revalidatePath("/panel/config");
}

// --- Hours -----------------------------------------------------------------

export async function createHours(formData: FormData) {
  const staff = await requireStaff();
  const supabase = await createClient();

  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const opensAt = String(formData.get("opensAt") ?? "");
  const closesAt = String(formData.get("closesAt") ?? "");
  if (Number.isNaN(dayOfWeek) || !opensAt || !closesAt || opensAt === closesAt) return;

  await supabase.from("business_hours").insert({
    business_id: staff.business.id,
    day_of_week: dayOfWeek,
    opens_at: opensAt,
    closes_at: closesAt,
  });

  revalidatePath("/panel/config");
}

export async function deleteHours(hoursId: string) {
  const supabase = await createClient();
  await supabase.from("business_hours").delete().eq("id", hoursId);
  revalidatePath("/panel/config");
}

// --- Kitchen printing ------------------------------------------------------

export async function updatePrinting(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const staff = await requireStaff();
  if (!canConfigure(staff.role)) return { error: "Solo el dueño o el encargado." };
  const paper = Number(formData.get("paper")) === 58 ? 58 : 80;
  const autoRaw = String(formData.get("auto") ?? "off");
  const auto = autoRaw === "on_new" || autoRaw === "on_kitchen" ? autoRaw : "off";

  const supabase = await createClient();
  const { error } = await supabase
    .from("business_settings")
    .update({ print_paper_mm: paper, print_auto: auto })
    .eq("business_id", staff.business.id);
  if (error) return { error: "No pudimos guardar la impresión." };

  revalidatePath("/panel/config");
  revalidatePath("/panel");
  return { ok: true };
}

// --- Mercado Pago ----------------------------------------------------------

/**
 * Owner only: this decides whose account the money lands in. The token goes
 * straight to business_mp_credentials through the admin client (that table
 * has no policies at all) after Mercado Pago itself confirmed it is valid.
 */
export async function connectMercadoPago(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const staff = await requireStaff();
  if (staff.role !== "owner") return { error: "Solo el dueño puede conectar la cuenta de cobro." };
  if (!staff.modules.has("mercadopago")) return { error: "Tu plan no incluye Mercado Pago." };

  const token = String(formData.get("accessToken") ?? "").trim();
  if (!/^(APP_USR|TEST)-[\w-]{20,}$/.test(token)) {
    return { error: "Eso no parece un Access Token. Empieza con APP_USR-." };
  }

  const verified = await verifyAccessToken(token);
  if (!verified.ok) return { error: verified.error };

  const admin = createAdminClient();
  const { error } = await admin.from("business_mp_credentials").upsert({
    business_id: staff.business.id,
    access_token: token,
    mp_user_id: verified.userId,
    mp_nickname: verified.nickname,
    connected_at: new Date().toISOString(),
  });
  if (error) return { error: "No pudimos guardar la conexión." };

  revalidatePath("/panel/config");
  return { ok: true };
}

export async function disconnectMercadoPago() {
  const staff = await requireStaff();
  if (staff.role !== "owner") return;
  const supabase = await createClient();
  await supabase
    .from("business_settings")
    .update({ mercadopago_enabled: false })
    .eq("business_id", staff.business.id);
  await createAdminClient().from("business_mp_credentials").delete().eq("business_id", staff.business.id);
  revalidatePath("/panel/config");
}

export async function toggleMercadoPago(enabled: boolean) {
  const staff = await requireStaff();
  if (!canConfigure(staff.role) || !staff.modules.has("mercadopago")) return;
  if (enabled) {
    const { data } = await createAdminClient()
      .from("business_mp_credentials")
      .select("business_id")
      .eq("business_id", staff.business.id)
      .maybeSingle();
    if (!data) return;
  }
  const supabase = await createClient();
  await supabase
    .from("business_settings")
    .update({ mercadopago_enabled: enabled })
    .eq("business_id", staff.business.id);
  revalidatePath("/panel/config");
}
