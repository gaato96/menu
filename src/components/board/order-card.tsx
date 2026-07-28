"use client";

import { useDraggable } from "@dnd-kit/core";
import { AlertTriangle, Bike, ChevronRight, Store, Undo2, X } from "lucide-react";
import { useState } from "react";

import { ElapsedTimer } from "@/components/board/elapsed-timer";
import { formatMoney } from "@/lib/money";
import type { StaffRole } from "@/lib/orders/status";
import type { BoardOrder } from "@/lib/orders/board-queries";
import { cn } from "@/lib/utils";

const REVERSE_ROLES: StaffRole[] = ["superadmin", "owner", "manager"];

const ADVANCE_LABEL: Record<string, string> = {
  pending_payment: "Confirmar",
  confirmed: "A cocina",
  in_kitchen: "Despachar",
  on_the_way: "Completar",
  ready_for_pickup: "Completar",
};

export function OrderCard({
  order,
  role,
  currency,
  onAdvance,
  onCancel,
  onGoBack,
}: {
  order: BoardOrder;
  role: StaffRole;
  currency: string;
  onAdvance: () => void;
  onCancel: () => void;
  onGoBack: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: order.id,
    data: { order },
  });

  const advanceLabel = ADVANCE_LABEL[order.status];
  const canReverse = REVERSE_ROLES.includes(role);
  const unconfirmed = !order.whatsapp_opened_at;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "shadow-ticket touch-none rounded-card border border-ink-200 bg-white p-3",
        // The moving visual is DragOverlay's job (board.tsx) — columns scroll
        // independently, so a translated original would clip at their edges.
        isDragging && "opacity-30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-base font-semibold text-ink-900">{order.code}</span>
          {order.fulfillment_type === "delivery" ? (
            <Bike className="size-4 text-ink-500" aria-label="Delivery" />
          ) : (
            <Store className="size-4 text-ink-500" aria-label="Retiro" />
          )}
        </div>
        <ElapsedTimer
          since={order.created_at}
          className="font-mono text-xs text-ink-500 data-[stale]:font-semibold data-[stale]:text-danger"
        />
      </div>

      {unconfirmed && (
        <div className="mt-1.5 flex items-center gap-1 rounded bg-warning-soft px-1.5 py-0.5 text-xs font-medium text-warning">
          <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
          Sin confirmar por el cliente
        </div>
      )}

      <p className="mt-2 truncate text-sm font-medium text-ink-900">{order.customer_name}</p>

      <ul className="mt-1.5 space-y-1 text-sm text-ink-700">
        {order.items.map((item) => (
          <li key={item.id}>
            <span className="font-medium">{item.quantity}×</span> {item.productName}
            {item.options.length > 0 && (
              <span className="block pl-4 text-xs text-ink-500">
                {item.options.map((o) => o.optionName).join(" · ")}
              </span>
            )}
            {item.itemNotes && (
              <span className="block pl-4 text-xs italic text-ink-500">{item.itemNotes}</span>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-1.5 rounded bg-ink-100 px-2 py-1 text-xs text-ink-700">{order.notes}</p>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-2">
        <span className="font-mono text-sm font-semibold text-ink-900">
          {formatMoney(order.total_cents, { currency })}
        </span>
        <span className="text-xs text-ink-500">
          {order.payment_method === "cash" ? "Efectivo" : "Transferencia"}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        {advanceLabel && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onAdvance}
            className="flex min-h-touch flex-1 items-center justify-center gap-1 rounded-lg bg-brand text-sm font-semibold text-brand-fg active:brightness-90"
          >
            {advanceLabel}
            <ChevronRight className="size-4" aria-hidden />
          </button>
        )}

        {canReverse && (
          <div className="relative shrink-0">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Más opciones"
              aria-expanded={menuOpen}
              className="flex size-touch items-center justify-center rounded-lg border border-ink-200 text-ink-500 active:bg-ink-100"
            >
              <span className="text-lg leading-none">···</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-full z-10 mb-1 w-40 overflow-hidden rounded-lg border border-ink-200 bg-white shadow-lg">
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setMenuOpen(false);
                    onGoBack();
                  }}
                  className="flex min-h-touch w-full items-center gap-2 px-3 text-sm text-ink-700 hover:bg-ink-50"
                >
                  <Undo2 className="size-4" aria-hidden />
                  Retroceder
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setMenuOpen(false);
                    onCancel();
                  }}
                  className="flex min-h-touch w-full items-center gap-2 px-3 text-sm text-danger hover:bg-danger-soft"
                >
                  <X className="size-4" aria-hidden />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

