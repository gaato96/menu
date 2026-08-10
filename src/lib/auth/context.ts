import { cache } from "react";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { ModuleKey, StaffRole, Tables } from "@/types/database";

export interface StaffContext {
  userId: string;
  role: StaffRole;
  fullName: string | null;
  business: Tables<"businesses">;
  settings: Tables<"business_settings">;
  subscription: Tables<"subscriptions">;
  /** Premium modules turned on for this business. */
  modules: Set<ModuleKey>;
}

/**
 * Resolves who is asking and which business they belong to.
 *
 * The queries below do not filter by business_id — RLS does it. If the policies
 * are right this returns exactly one business; if they are wrong, the RLS suite
 * fails long before a customer notices.
 *
 * Wrapped in React `cache()` so the panel layout and the page inside it share
 * one result instead of each paying an auth round trip, a profile lookup and
 * four table reads against São Paulo.
 *
 * Worth recording what this does NOT fix, because it is tempting to reach for
 * it again: on a client-side navigation between sibling pages the layout is
 * not re-rendered at all, so requireStaff had already been running just once.
 * Measured before and after, tab-to-tab latency did not move. The win is the
 * first load and any hard refresh, where layout and page do render together.
 *
 * `cache()` scopes the memo to one render pass, so a role or module change
 * still takes effect on the next click — deduplication, not caching across
 * requests.
 */
export const requireStaff = cache(async function requireStaff(): Promise<StaffContext> {
  const supabase = await createClient();

  // getClaims(), not getUser(). The project signs tokens with ES256, so this
  // verifies the JWT locally against the cached JWKS instead of asking the
  // auth server — one network round trip removed from every panel render.
  //
  // What it buys is not just its own latency: business_id already lives in the
  // token (custom_access_token_hook), so the five reads below can all fire at
  // once. The old shape was getUser -> profiles -> the rest, three sequential
  // hops to São Paulo before anything could render.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) redirect("/login");

  const userId = claims.sub;
  const claimRole = typeof claims.user_role === "string" ? claims.user_role : "";
  const claimBusinessId = typeof claims.business_id === "string" ? claims.business_id : null;

  if (claimRole === "superadmin") redirect("/admin");
  // The hook blanks both claims for a deactivated employee, so this catches
  // them on the next token refresh. The authoritative check is still the
  // is_active read below, which is live.
  if (!claimRole || !claimBusinessId) redirect("/sin-acceso");

  const [profile, business, settings, subscription, modules] = await Promise.all([
    supabase
      .from("profiles")
      .select("business_id, role, full_name, is_active")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("businesses").select("*").eq("id", claimBusinessId).single(),
    supabase.from("business_settings").select("*").eq("business_id", claimBusinessId).single(),
    supabase.from("subscriptions").select("*").eq("business_id", claimBusinessId).single(),
    supabase
      .from("business_modules")
      .select("module_key, enabled")
      .eq("business_id", claimBusinessId),
  ]);

  // Read live rather than trusted from the token: deactivating an employee has
  // to lock them out now, not whenever their access token happens to refresh.
  // The claim only decided which business to prefetch — RLS, keyed on that same
  // claim, is what actually stops a cross-tenant read.
  if (!profile.data || !profile.data.is_active) redirect("/sin-acceso");
  if (profile.data.role === "superadmin") redirect("/admin");
  if (!profile.data.business_id) redirect("/sin-acceso");

  // A missing business row means the JWT claim points at something deleted, or
  // the hook is off and RLS is denying everything. Either way, not a panel.
  if (business.error || settings.error || subscription.error) redirect("/sin-acceso");

  return {
    userId,
    role: profile.data.role,
    fullName: profile.data.full_name,
    business: business.data,
    settings: settings.data,
    subscription: subscription.data,
    modules: new Set((modules.data ?? []).filter((m) => m.enabled).map((m) => m.module_key)),
  };
});

/**
 * Gates a page behind a premium module. Redirects rather than 404s — an owner
 * who lands here without the module is a sales opportunity, not a dead end.
 */
export function requireModule(staff: StaffContext, key: ModuleKey) {
  if (!staff.modules.has(key)) redirect(`/panel/no-disponible?m=${key}`);
}

/**
 * A `Set` does not survive serialization across the server/client boundary
 * (it turns into `{}` on the wire), so anything passed down to a client
 * component needs the plain array instead.
 */
export function moduleList(staff: Pick<StaffContext, "modules">): ModuleKey[] {
  return Array.from(staff.modules);
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
