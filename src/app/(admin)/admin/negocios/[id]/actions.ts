"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSuperadmin } from "@/lib/auth/context";
import { parseMoneyToCents } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import type { ModuleKey } from "@/types/database";

export async function updateBusiness(
  businessId: string,
  formData: FormData,
): Promise<{ ok?: true; error?: string }> {
  await requireSuperadmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const whatsappPhone = String(formData.get("whatsappPhone") ?? "").replace(/\D/g, "");
  const address = String(formData.get("address") ?? "").trim();
  const brandColor = String(formData.get("brandColor") ?? "").trim();

  if (!name) return { error: "Falta el nombre." };
  if (!/^[0-9]{10,15}$/.test(whatsappPhone)) return { error: "WhatsApp inválido." };
  if (!/^#[0-9a-fA-F]{6}$/.test(brandColor)) return { error: "Color inválido — usá formato #RRGGBB." };

  const { error } = await supabase
    .from("businesses")
    .update({ name, whatsapp_phone: whatsappPhone, address: address || null, brand_color: brandColor })
    .eq("id", businessId);

  if (error) return { error: "No pudimos guardar." };
  revalidatePath(`/admin/negocios/${businessId}`);
  return { ok: true };
}

export async function toggleBusinessStatus(businessId: string, isActive: boolean) {
  await requireSuperadmin();
  const supabase = await createClient();
  await supabase
    .from("businesses")
    .update({ status: isActive ? "active" : "suspended" })
    .eq("id", businessId);
  revalidatePath(`/admin/negocios/${businessId}`);
  revalidatePath("/admin");
}

export async function updateSubscription(
  businessId: string,
  formData: FormData,
): Promise<{ ok?: true; error?: string }> {
  await requireSuperadmin();
  const supabase = await createClient();

  const plan = String(formData.get("plan") ?? "base").trim() || "base";
  const status = String(formData.get("status") ?? "trial");
  const currentPeriodEnd = String(formData.get("currentPeriodEnd") ?? "").trim();
  const monthlyAmountRaw = String(formData.get("monthlyAmount") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!["trial", "active", "past_due", "suspended"].includes(status)) {
    return { error: "Estado inválido." };
  }
  const monthlyAmountCents = monthlyAmountRaw ? parseMoneyToCents(monthlyAmountRaw) : null;
  if (monthlyAmountRaw && monthlyAmountCents === null) return { error: "Monto inválido." };

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan,
      status: status as "trial" | "active" | "past_due" | "suspended",
      current_period_end: currentPeriodEnd || null,
      monthly_amount_cents: monthlyAmountCents,
      notes: notes || null,
    })
    .eq("business_id", businessId);

  if (error) return { error: "No pudimos guardar la suscripción." };
  revalidatePath(`/admin/negocios/${businessId}`);
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Rows in business_modules exist only for enabled modules (see schema
 * comment) — enabling upserts, disabling deletes rather than flipping a flag.
 */
export async function toggleModule(businessId: string, moduleKey: ModuleKey, enabled: boolean) {
  await requireSuperadmin();
  const supabase = await createClient();

  if (enabled) {
    await supabase
      .from("business_modules")
      .upsert({ business_id: businessId, module_key: moduleKey, enabled: true });
  } else {
    await supabase
      .from("business_modules")
      .delete()
      .eq("business_id", businessId)
      .eq("module_key", moduleKey);
  }
  revalidatePath(`/admin/negocios/${businessId}`);
}

export async function deleteBusiness(businessId: string) {
  await requireSuperadmin();
  const supabase = await createClient();
  await supabase.from("businesses").delete().eq("id", businessId);
  revalidatePath("/admin");
  redirect("/admin");
}
