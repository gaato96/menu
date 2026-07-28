"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function generatePassword() {
  // Readable-enough temp password the owner reads aloud once to a new hire —
  // not meant to be memorized, just typed in on first login before they set
  // their own.
  return randomBytes(6).toString("base64url");
}

export interface InviteResult {
  ok?: true;
  password?: string;
  error?: string;
}

/**
 * Two-step, two-client on purpose: creating the auth user requires the
 * service role no matter what (there is no RLS-scoped way to do it). Writing
 * the profile row goes through the OWNER's own session client instead, so
 * RLS (`profiles_owner_manage`) — not this function — is what actually
 * enforces that only an owner can grant a role, and that it can't be
 * 'superadmin'.
 */
export async function inviteStaff(formData: FormData): Promise<InviteResult> {
  const staff = await requireStaff();
  if (staff.role !== "owner") return { error: "Solo el dueño puede invitar empleados." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const role = formData.get("role") === "manager" ? "manager" : "cashier";
  if (!email || !fullName) return { error: "Completá nombre y email." };

  const admin = createAdminClient();
  const password = generatePassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    const message = createError?.message ?? "";
    if (/already|registered|exists/i.test(message)) {
      return { error: "Ya existe una cuenta con ese email." };
    }
    return { error: "No pudimos crear el usuario." };
  }

  const session = await createClient();
  const { error: profileError } = await session
    .from("profiles")
    .insert({ id: created.user.id, business_id: staff.business.id, role, full_name: fullName });

  if (profileError) {
    // Roll back the orphaned auth user rather than leave a login with no
    // business — a half-created employee is worse than none.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "No pudimos asignarlo al negocio: " + profileError.message.replace(/^.*?:\s*/, "") };
  }

  revalidatePath("/panel/usuarios");
  return { ok: true, password };
}

export async function updateStaffRole(profileId: string, role: "owner" | "manager" | "cashier") {
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", profileId);
  revalidatePath("/panel/usuarios");
}

export async function toggleStaffActive(profileId: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: isActive }).eq("id", profileId);
  revalidatePath("/panel/usuarios");
}
