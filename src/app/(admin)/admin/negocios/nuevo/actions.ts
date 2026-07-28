"use server";

import { randomBytes } from "node:crypto";

import { requireSuperadmin } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

function generatePassword() {
  return randomBytes(6).toString("base64url");
}

export interface CreateBusinessResult {
  ok?: true;
  slug?: string;
  password?: string;
  error?: string;
}

/**
 * Same two-client shape as inviteStaff: the auth user needs the service role
 * no matter what, everything else goes through the superadmin's own session
 * so RLS (businesses_superadmin_insert, profiles_owner_manage) is what
 * actually authorizes each write, not this function's judgment.
 */
export async function createBusiness(formData: FormData): Promise<CreateBusinessResult> {
  await requireSuperadmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const whatsappPhone = String(formData.get("whatsappPhone") ?? "").replace(/\D/g, "");
  const address = String(formData.get("address") ?? "").trim();
  const brandColor = String(formData.get("brandColor") ?? "#D1420A").trim();
  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
  const ownerName = String(formData.get("ownerName") ?? "").trim();

  if (!name) return { error: "Falta el nombre del negocio." };
  if (!/^[0-9]{10,15}$/.test(whatsappPhone)) {
    return { error: "WhatsApp inválido — solo números, con código de país (ej: 5493811234567)." };
  }
  if (!ownerEmail || !ownerName) return { error: "Faltan los datos del dueño." };

  const baseSlug = slugify(name);
  if (!baseSlug) return { error: "El nombre no genera una URL válida." };

  let slug = baseSlug;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { count } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);
    if (!count) break;
    slug = `${baseSlug}-${attempt + 2}`;
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      name,
      slug,
      whatsapp_phone: whatsappPhone,
      address: address || null,
      brand_color: /^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : "#D1420A",
    })
    .select("id")
    .single();

  if (businessError || !business) {
    return { error: "No pudimos crear el negocio: " + (businessError?.message ?? "") };
  }

  const [settingsResult, subscriptionResult] = await Promise.all([
    supabase.from("business_settings").insert({ business_id: business.id }),
    supabase.from("subscriptions").insert({ business_id: business.id, status: "trial" }),
  ]);

  const admin = createAdminClient();
  const password = generatePassword();

  const { data: created, error: createUserError } = await admin.auth.admin.createUser({
    email: ownerEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: ownerName },
  });

  if (settingsResult.error || subscriptionResult.error || createUserError || !created?.user) {
    // Half-created tenant is worse than none — cascade delete cleans up
    // settings/subscription rows, and the orphaned auth user (if it made it
    // that far) gets rolled back too.
    await supabase.from("businesses").delete().eq("id", business.id);
    if (created?.user) await admin.auth.admin.deleteUser(created.user.id);
    const message = createUserError?.message ?? "";
    if (/already|registered|exists/i.test(message)) {
      return { error: "Ya existe una cuenta con ese email de dueño." };
    }
    return { error: "No pudimos terminar de crear el negocio." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: created.user.id, business_id: business.id, role: "owner", full_name: ownerName });

  if (profileError) {
    await supabase.from("businesses").delete().eq("id", business.id);
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "No pudimos asignar el dueño: " + profileError.message.replace(/^.*?:\s*/, "") };
  }

  return { ok: true, slug, password };
}
