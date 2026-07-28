"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BoardColumn } from "@/components/board/board-column";
import { CancelOrderDialog } from "@/components/board/cancel-order-dialog";
import { NewOrderAlert } from "@/components/board/new-order-alert";
import { OrderDetailSheet } from "@/components/board/order-detail-sheet";
import { PushEnableBanner } from "@/components/board/push-enable-banner";
import { SoundUnlockBanner } from "@/components/board/sound-unlock-banner";
import { useAudioAlert } from "@/hooks/use-audio-alert";
import { useOrderRealtime } from "@/hooks/use-order-realtime";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { formatMoney } from "@/lib/money";
import type { BoardOrder } from "@/lib/orders/board-queries";
import {
  BOARD_COLUMNS,
  type BoardColumnId,
  columnForStatus,
  nextStatus,
  statusForColumn,
  type StaffRole,
} from "@/lib/orders/status";
import { updateOrderStatus } from "@/lib/orders/update-status";
import { createClient } from "@/lib/supabase/client";

export function Board({
  businessId,
  businessName,
  currency,
  role,
  initialOrders,
  zoneNames,
  tableNames,
}: {
  businessId: string;
  businessName: string;
  currency: string;
  role: StaffRole;
  initialOrders: BoardOrder[];
  zoneNames: Record<string, string>;
  tableNames: Record<string, string>;
}) {
  const { orders, setOrders, connected, setOnNewOrder } = useOrderRealtime(
    businessId,
    initialOrders,
  );
  const audio = useAudioAlert();
  useWakeLock();

  const [alertQueue, setAlertQueue] = useState<BoardOrder[]>([]);
  const [activeDrag, setActiveDrag] = useState<BoardOrder | null>(null);
  const [everReceivedOrder, setEverReceivedOrder] = useState(initialOrders.length > 0);
  const [cancelTarget, setCancelTarget] = useState<BoardOrder | null>(null);
  const [detailTarget, setDetailTarget] = useState<BoardOrder | null>(null);
  const [supabase] = useState(() => createClient());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  useEffect(() => {
    setOnNewOrder((order) => {
      setAlertQueue((prev) => [...prev, order]);
      setEverReceivedOrder(true);
      audio.startAlert();
    });
    // setOnNewOrder just assigns a ref inside the hook; identity is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Blinking tab title — the one signal that survives the tablet's screen
  // going to another app or a background browser tab.
  useEffect(() => {
    const originalTitle = document.title;
    if (alertQueue.length === 0) return;

    let on = false;
    const interval = setInterval(() => {
      on = !on;
      document.title = on ? `🔔 Pedido nuevo — ${alertQueue[0].code}` : originalTitle;
    }, 1000);
    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [alertQueue]);

  async function moveOrder(
    order: BoardOrder,
    status: BoardOrder["status"],
    options?: { cancelReason?: string },
  ) {
    const previous = order.status;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));

    const result = await updateOrderStatus(supabase, order.id, status, options);
    if (!result.ok) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o)));
      toast.error(result.message);
    }
  }

  function handleAdvance(order: BoardOrder) {
    const target = nextStatus(order.status, order.fulfillment_type);
    if (target) void moveOrder(order, target);
  }

  function handleCancel(order: BoardOrder) {
    setCancelTarget(order);
  }

  function confirmCancel(reason: string) {
    if (cancelTarget) void moveOrder(cancelTarget, "cancelled", { cancelReason: reason });
    setCancelTarget(null);
  }

  function handleGoBack(order: BoardOrder) {
    // Simple, safe reverse map for the quick "retroceder" action.
    const back: Partial<Record<BoardOrder["status"], BoardOrder["status"]>> = {
      confirmed: "pending_payment",
      in_kitchen: "confirmed",
      on_the_way: "in_kitchen",
      ready_for_pickup: "in_kitchen",
    };
    const target = back[order.status];
    if (target) void moveOrder(order, target);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDrag((event.active.data.current?.order as BoardOrder | undefined) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const order = event.active.data.current?.order as BoardOrder | undefined;
    const columnId = event.over?.id as BoardColumnId | undefined;
    if (!order || !columnId) return;

    const target = statusForColumn(columnId, order.fulfillment_type);
    if (target === order.status) return;
    void moveOrder(order, target);
  }

  // Keep the open detail sheet live (a status change or a realtime item
  // top-up must reflect there too, not just on the card underneath it) by
  // adjusting state during render rather than in an effect — React's
  // documented pattern for "derive state from a prop/state change" (see the
  // same idiom in product-sheet.tsx). Safe from render loops because
  // setOrders/useOrderRealtime only ever replace the ONE changed order's
  // object; every other entry keeps its previous reference, so `fresh` is
  // reference-equal to `detailTarget` on any render that doesn't concern it.
  if (detailTarget) {
    const fresh = orders.find((o) => o.id === detailTarget.id) ?? null;
    if (fresh !== detailTarget) setDetailTarget(fresh);
  }

  function dismissAlert() {
    setAlertQueue((prev) => prev.slice(1));
    if (alertQueue.length <= 1) audio.stopAlert();
  }

  const currentAlert = alertQueue[0] ?? null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 bg-white px-3 py-1.5">
        {!connected && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-warning">
            <WifiOff className="size-3.5" aria-hidden />
            Reconectando…
          </span>
        )}
        <span className="ml-auto text-xs text-ink-400">
          {orders.length} pedido{orders.length === 1 ? "" : "s"} activo
          {orders.length === 1 ? "" : "s"} · Hoy: {formatMoney(
            orders.reduce((sum, o) => sum + o.total_cents, 0),
            { currency },
          )}
        </span>
        <SoundUnlockBanner
          unlocked={audio.unlocked}
          muted={audio.muted}
          onUnlock={audio.unlock}
          onToggleMuted={audio.toggleMuted}
        />
      </div>

      <div className="px-3 pt-2">
        <PushEnableBanner show={everReceivedOrder} />
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-3 overflow-x-auto p-3">
          {BOARD_COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              role={role}
              currency={currency}
              businessName={businessName}
              zoneNames={zoneNames}
              tableNames={tableNames}
              orders={orders.filter((o) => columnForStatus(o.status) === column.id)}
              onAdvance={handleAdvance}
              onCancel={handleCancel}
              onGoBack={handleGoBack}
              onOpenDetail={setDetailTarget}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDrag && (
            <div className="shadow-ticket w-72 rounded-card border border-ink-200 bg-white p-3 opacity-95">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-semibold text-ink-900">
                  {activeDrag.code}
                </span>
                <span className="font-mono text-sm text-ink-700">
                  {formatMoney(activeDrag.total_cents, { currency })}
                </span>
              </div>
              <p className="truncate text-sm text-ink-700">{activeDrag.customer_name}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {currentAlert && (
        <NewOrderAlert
          order={currentAlert}
          currency={currency}
          queueLength={alertQueue.length}
          onAccept={dismissAlert}
        />
      )}

      <CancelOrderDialog
        order={cancelTarget}
        onConfirm={confirmCancel}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      />

      <OrderDetailSheet
        order={detailTarget}
        currency={currency}
        zoneNames={zoneNames}
        tableNames={tableNames}
        onOpenChange={(open) => {
          if (!open) setDetailTarget(null);
        }}
      />
    </div>
  );
}
