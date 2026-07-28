"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/auth/context";
import { parseMoneyToCents } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

// --- Business-wide -------------------------------------------------------

export async function toggleOpenManual(isOpen: boolean) {
  const staff = await requireStaff();
  const supabase = await createClient();
  await supabase.from("businesses").update({ is_open_manual: isOpen }).eq("id", staff.business.id);
  revalidatePath("/panel/config");
  revalidatePath("/panel");
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
