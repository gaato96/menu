"use client";

import { BellRing, Check, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ElapsedTimer } from "@/components/board/elapsed-timer";
import { CALL_LABELS, fetchPendingCalls, type PendingCall, resolveCall } from "@/lib/tables/calls";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * A strip under the panel header listing the tables waiting on somebody.
 *
 * It lives in the layout, not on one screen, because a customer asking for
 * the bill is an interrupt: whoever is looking at the panel should see it
 * whether they happen to be on the board, the drawer or the floor plan.
 *
 * Redundant on purpose, same reasoning as use-order-realtime: Realtime plus a
 * refetch when the tab regains focus. A socket that died silently must not
 * turn into a table sitting there with their hand up.
 */
export function TableCallsAlert({
  businessId,
  initialCalls,
}: {
  businessId: string;
  initialCalls: PendingCall[];
}) {
  const [calls, setCalls] = useState(initialCalls);
  const [supabase] = useState(() => createClient());
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refetch() {
      // Re-read in full rather than patched from the event payload: that
      // payload carries table_id but not the table's label, and a strip that
      // says "Mesa ?" is worse than one that arrives a beat later. The same
      // RLS-scoped query the server used, run from the browser.
      const fresh = await fetchPendingCalls(supabase, businessId);
      if (!cancelled) setCalls(fresh);
    }

    const channel = supabase
      .channel(`table-calls:${businessId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "table_calls", filter: `business_id=eq.${businessId}` },
        () => void refetch(),
      )
      .subscribe();

    function onFocus() {
      if (document.visibilityState === "visible") void refetch();
    }
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [supabase, businessId]);

  async function attend(call: PendingCall) {
    setBusyId(call.id);
    // Optimistic: the strip has to empty the instant the mozo taps it, or two
    // of them walk to the same table.
    setCalls((current) => current.filter((c) => c.id !== call.id));
    const { error } = await resolveCall(supabase, call.id);
    setBusyId(null);
    if (error) {
      setCalls((current) => [...current, call].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      toast.error("No pudimos marcarlo como atendido.");
    }
  }

  if (calls.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-warning bg-warning-soft px-3 py-2">
      {calls.map((call) => (
        <button
          key={call.id}
          type="button"
          disabled={busyId === call.id}
          onClick={() => void attend(call)}
          className={cn(
            "flex min-h-touch shrink-0 items-center gap-2 rounded-lg border border-warning bg-white px-3 text-left",
            busyId === call.id && "opacity-50",
          )}
        >
          {call.kind === "bill" ? (
            <Receipt className="size-4 shrink-0 text-warning" aria-hidden />
          ) : (
            <BellRing className="size-4 shrink-0 text-warning" aria-hidden />
          )}
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink-900">Mesa {call.tableLabel}</span>
            <span className="block text-xs text-ink-500">{CALL_LABELS[call.kind]}</span>
          </span>
          <ElapsedTimer since={call.createdAt} className="font-mono text-xs text-ink-500" />
          <Check className="size-4 shrink-0 text-success" aria-hidden />
        </button>
      ))}
    </div>
  );
}
