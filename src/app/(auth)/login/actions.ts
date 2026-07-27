"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Completá tu email y tu contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Never distinguish "no existe ese usuario" from "contraseña incorrecta":
    // that difference tells an attacker which emails are real accounts.
    return { error: "Email o contraseña incorrectos." };
  }

  const role = (data.session?.user.app_metadata?.user_role ??
    decodeRole(data.session?.access_token)) as string | null;

  if (role === "superadmin") redirect("/admin");
  redirect(next && next.startsWith("/") ? next : "/panel");
}

/** The staff role travels as a custom JWT claim, not in user metadata. */
function decodeRole(accessToken?: string): string | null {
  if (!accessToken) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64").toString(),
    ) as { user_role?: string };
    return payload.user_role ?? null;
  } catch {
    return null;
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
