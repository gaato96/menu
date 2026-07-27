import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Service-role client. BYPASSES RLS ENTIRELY.
 *
 * Legitimate uses, and no others:
 *   1. Creating an order. Prices must be re-read from the database rather than
 *      trusted from the browser, and the diner has no session to do it with.
 *   2. Rendering the order confirmation page for an anonymous customer.
 *   3. Sending Web Push to every device of a business.
 *   4. The superadmin panel provisioning tenants.
 *
 * Anything a logged-in staff member does goes through the session client so
 * that RLS — not this file — is what keeps tenants apart.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() was called in the browser. This leaks the service role key.");
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
