import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, TableCallKind } from "@/types/database";

export interface PendingCall {
  id: string;
  tableId: string;
  tableLabel: string;
  kind: TableCallKind;
  createdAt: string;
}

export const CALL_LABELS: Record<TableCallKind, string> = {
  bill: "Pide la cuenta",
  waiter: "Llama al mozo",
};

/**
 * Open calls, oldest first — the order they should be attended in.
 *
 * The table label is joined in code rather than by an embed for the same
 * reason board-queries does it: the hand-written Database type carries no
 * Relationships metadata, so supabase-js cannot infer the shape of a nested
 * select.
 */
export async function fetchPendingCalls(
  supabase: SupabaseClient<Database>,
  businessId: string,
): Promise<PendingCall[]> {
  const { data: calls } = await supabase
    .from("table_calls")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (!calls || calls.length === 0) return [];

  const { data: tables } = await supabase
    .from("restaurant_tables")
    .select("id, label")
    .eq("business_id", businessId);

  const labels = new Map((tables ?? []).map((t) => [t.id, t.label]));

  return calls.map((call) => ({
    id: call.id,
    tableId: call.table_id,
    tableLabel: labels.get(call.table_id) ?? "?",
    kind: call.kind,
    createdAt: call.created_at,
  }));
}

/**
 * Marks a call attended. Goes straight from the browser like a board status
 * change does — RLS (table_calls_staff_update) is what authorises it, and any
 * role including a mozo may do it, since the mozo is who actually walks over.
 */
export async function resolveCall(supabase: SupabaseClient<Database>, callId: string) {
  const { data: user } = await supabase.auth.getUser();
  return supabase
    .from("table_calls")
    .update({
      status: "done",
      resolved_at: new Date().toISOString(),
      resolved_by: user.user?.id ?? null,
    })
    .eq("id", callId);
}
