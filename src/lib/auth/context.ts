import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { StaffRole, Tables } from "@/types/database";

export interface StaffContext {
  userId: string;
  role: StaffRole;
  fullName: string | null;
  business: Tables<"businesses">;
  settings: Tables<"business_settings">;
  subscription: Tables<"subscriptions">;
  /** Premium modules turned on for this business. */
  modules: Set<string>;
}

/**
 * Resolves who is asking and which business they belong to.
 *
 * The queries below do not filter by business_id — RLS does it. If the policies
 * are right this returns exactly one business; if they are wrong, the RLS suite
 * fails long before a customer notices.
 */
export async function requireStaff(): Promise<StaffContext> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, role, full_name, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) redirect("/sin-acceso");
  if (profile.role === "superadmin") redirect("/admin");
  if (!profile.business_id) redirect("/sin-acceso");

  const [business, settings, subscription, modules] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", profile.business_id).single(),
    supabase
      .from("business_settings")
      .select("*")
      .eq("business_id", profile.business_id)
      .single(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("business_id", profile.business_id)
      .single(),
    supabase
      .from("business_modules")
      .select("module_key, enabled")
      .eq("business_id", profile.business_id),
  ]);

  // A missing business row means the JWT claim points at something deleted, or
  // the hook is off and RLS is denying everything. Either way, not a panel.
  if (business.error || settings.error || subscription.error) redirect("/sin-acceso");

  return {
    userId: user.id,
    role: profile.role,
    fullName: profile.full_name,
    business: business.data,
    settings: settings.data,
    subscription: subscription.data,
    modules: new Set((modules.data ?? []).filter((m) => m.enabled).map((m) => m.module_key)),
  };
}

export async function requireSuperadmin() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "superadmin") redirect("/panel");

  return { userId: userData.user.id, fullName: profile.full_name };
}
