"use client";

import { Bike, ChevronLeft, Store, Utensils, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SoundUnlockBanner } from "@/components/board/sound-unlock-banner";
import { ElapsedTimer } from "@/components/board/elapsed-timer";
import { useAudioAlert } from "@/hooks/use-audio-alert";
import { useOrderRealtime } from "@/hooks/use-order-realtime";
import { useWakeLock } from "@/hooks/use-wake-lock";
import type { BoardOrder } from "@/lib/orders/board-queries";
import { isKitchenOrder } from "@/lib/orders/kitchen-queries";
import type { StaffRole } from "@/lib/orders/status";
import { updateOrderStatus } from "@/lib/orders/update-status";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ADVANCE_LABEL: Record<string, string> = {
  confirmed: "Empezar a cocinar",
  in_kitchen: "Listo",
};

/**
 * A tap-only queue for a screen mounted above a flat-top, read from arm's
 * length by someone with grease on their hands: no drag & drop, no hover, one
 * undo per comanda. Reuses the board's own realtime hook rather than a
 * second subscription — one WebSocket per tablet, not one per screen.
 */
export function KitchenBoard({
  businessId,
  role,
  initialOrders,
  tableNames,
}: {
  businessId: string;
  role: StaffRole;
  initialOrders: BoardOrder[];
  tableNames: Record<string, string>;
}) {
  const { orders: allOrders, connected } = useOrderRealtime(businessId, initialOrders);
  const audio = useAudioAlert();
  useWakeLock();

  const [supabase] = useState(() => createClient());
  const [busyId, setBusyId] = useState<string | null>(null);
  const knownIds = useRef(new Set(initialOrders.filter(isKitchenOrder).map((o) => o.id)));

  const orders = allOrders
    .filter(isKitchenOrder)
    .sort((a, b) => new Date(a.status_changed_at).getTime() - new Date(b.status_changed_at).getTime());

  // A new arrival is any id the kitchen hasn't seen yet — covers both a fresh
  // confirmation and an order the board reopened back into the queue.
  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o.id));
    const hasNewArrival = orders.some((o) => !knownIds.current.has(o.id));
    if (hasNewArrival && audio.unlocked) audio.startAlert();
    knownIds.current = currentIds;
    // audio identity is stable across renders (see useAudioAlert); only the
    // order list should re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  async function advance(order: BoardOrder) {
    audio.stopAlert();
    const status =
      order.status === "confirmed"
        ? "in_kitchen"
        : order.fulfillment_type === "delivery"
          ? "on_the_way"
          : "ready_for_pickup";
    setBusyId(order.id);
    const result = await updateOrderStatus(supabase, order.id, status);
    setBusyId(null);
    if (!result.ok) toast.error(result.message);
  }

  async function undo(order: BoardOrder) {
    setBusyId(order.id);
    const result = await updateOrderStatus(supabase, order.id, "confirmed");
    setBusyId(null);
    if (!result.ok) toast.error(result.message);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        {!connected && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-ember">
            <WifiOff className="size-4" aria-hidden />
            Reconectando…
          </span>
        )}
        <span className="ml-auto text-sm text-white/50">
          {orders.length} comanda{orders.length === 1 ? "" : "s"}
        </span>
      </div>

      <SoundUnlockBanner
        unlocked={audio.unlocked}
        muted={audio.muted}
        onUnlock={audio.unlock}
        onToggleMuted={audio.toggleMuted}
      />

      {orders.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-xl text-white/40">Sin comandas pendientes. Buen momento para un mate.</p>
        </div>
      ) : (
        <div className="grid flex-1 auto-rows-min grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <KitchenCard
              key={order.id}
              order={order}
              tableLabel={order.table_id ? tableNames[order.table_id] : null}
              busy={busyId === order.id}
              canUndo={order.status === "in_kitchen" && role !== "cashier"}
              onAdvance={() => void advance(order)}
              onUndo={() => void undo(order)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KitchenCard({
  order,
  tableLabel,
  busy,
  canUndo,
  onAdvance,
  onUndo,
}: {
  order: BoardOrder;
  tableLabel?: string | null;
  busy: boolean;
  canUndo: boolean;
  onAdvance: () => void;
  onUndo: () => void;
}) {
  const isCooking = order.status === "in_kitchen";

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border-2 bg-night-900 p-4",
        isCooking ? "border-ember" : "border-white/15",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-2xl font-bold">{order.code}</span>
        <ElapsedTimer
          since={order.status_changed_at}
          className="font-mono text-lg text-white/60 data-[stale]:text-danger data-[stale]:font-bold"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-white/60">
        {order.fulfillment_type === "delivery" ? (
          <Bike className="size-4" aria-hidden />
        ) : order.fulfillment_type === "dine_in" ? (
          <Utensils className="size-4" aria-hidden />
        ) : (
          <Store className="size-4" aria-hidden />
        )}
        {order.fulfillment_type === "delivery"
          ? "Delivery"
          : order.fulfillment_type === "dine_in"
            ? `Mesa ${tableLabel ?? ""}`.trim()
            : "Retiro"}{" "}
        · {order.customer_name}
      </div>

      <ul className="flex-1 space-y-1.5 text-lg leading-snug">
        {order.items.map((item) => (
          <li key={item.id}>
            <span className="font-bold">{item.quantity}×</span> {item.productName}
            {item.options.length > 0 && (
              <span className="block pl-6 text-base text-white/60">
                {item.options.map((o) => o.optionName).join(", ")}
              </span>
            )}
            {item.itemNotes && (
              <span className="block pl-6 text-base text-ember">{item.itemNotes}</span>
            )}
          </li>
        ))}
      </ul>

      {order.notes && <p className="rounded-lg bg-white/5 p-2 text-sm text-white/70">{order.notes}</p>}

      <div className="flex gap-2">
        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={busy}
            aria-label="Deshacer"
            className="flex min-h-[88px] shrink-0 items-center justify-center rounded-xl bg-white/10 px-4 text-white/70 disabled:opacity-40"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
        )}
        <button
          type="button"
          onClick={onAdvance}
          disabled={busy}
          className="min-h-[88px] flex-1 rounded-xl bg-ember text-xl font-bold text-night-950 transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {ADVANCE_LABEL[order.status]}
        </button>
      </div>
    </article>
  );
}
