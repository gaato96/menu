"use client";

import { useDroppable } from "@dnd-kit/core";

import { OrderCard } from "@/components/board/order-card";
import type { BoardOrder } from "@/lib/orders/board-queries";
import type { BoardColumn as BoardColumnDef, StaffRole } from "@/lib/orders/status";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<BoardColumnDef["tone"], string> = {
  pending: "border-t-status-pending",
  confirmed: "border-t-status-confirmed",
  kitchen: "border-t-status-kitchen",
  transit: "border-t-status-transit",
  done: "border-t-status-done",
};

export function BoardColumn({
  column,
  orders,
  role,
  currency,
  onAdvance,
  onCancel,
  onGoBack,
}: {
  column: BoardColumnDef;
  orders: BoardOrder[];
  role: StaffRole;
  currency: string;
  onAdvance: (order: BoardOrder) => void;
  onCancel: (order: BoardOrder) => void;
  onGoBack: (order: BoardOrder) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex h-full w-72 shrink-0 flex-col">
      <div className={cn("flex items-center justify-between border-t-4 bg-white px-3 py-2", TONE_CLASSES[column.tone])}>
        <h2 className="text-sm font-semibold text-ink-900">{column.label}</h2>
        <span className="rounded-full bg-ink-100 px-2 py-0.5 font-mono text-xs text-ink-500">
          {orders.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 overflow-y-auto rounded-b-card border border-t-0 border-ink-200 bg-ink-50 p-2",
          isOver && "bg-brand-soft",
        )}
      >
        {orders.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-ink-300">Sin pedidos</p>
        )}
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            role={role}
            currency={currency}
            onAdvance={() => onAdvance(order)}
            onCancel={() => onCancel(order)}
            onGoBack={() => onGoBack(order)}
          />
        ))}
      </div>
    </div>
  );
}
