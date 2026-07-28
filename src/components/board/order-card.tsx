"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  AlertTriangle,
  Bike,
  ChevronRight,
  MapPin,
  MessageCircle,
  Phone,
  Store,
  Undo2,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";

import { ElapsedTimer } from "@/components/board/elapsed-timer";
import { formatMoney } from "@/lib/money";
import type { StaffRole } from "@/lib/orders/status";
import type { BoardOrder } from "@/lib/orders/board-queries";
import { buildConfirmationRequestUrl } from "@/lib/whatsapp";
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
  businessName,
  zoneName,
  tableLabel,
  onAdvance,
  onCancel,
  onGoBack,
  onOpenDetail,
}: {
  order: BoardOrder;
  role: StaffRole;
  currency: string;
  businessName: string;
  zoneName?: string | null;
  tableLabel?: string | null;
  onAdvance: () => void;
  onCancel: () => void;
  onGoBack: () => void;
  onOpenDetail: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: order.id,
    data: { order },
  });

  const advanceLabel = ADVANCE_LABEL[order.status];
  const canReverse = REVERSE_ROLES.includes(role);
  // A dine_in order never goes to WhatsApp (see create-order.ts), so
  // whatsapp_opened_at staying null forever is expected, not a warning sign.
  const unconfirmed = order.fulfillment_type !== "dine_in" && !order.whatsapp_opened_at;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // dnd-kit does not fire click after an actual drag, so a plain onClick
      // on the draggable root is safe — every interactive child below still
      // needs its own onPointerDown stopPropagation so a tap on THEM doesn't
      // also open the sheet underneath.
      onClick={onOpenDetail}
      role="button"
      tabIndex={0}
      className={cn(
        "shadow-ticket touch-none rounded-card border border-ink-200 bg-white p-3 text-left",
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
          ) : order.fulfillment_type === "dine_in" ? (
            <Utensils className="size-4 text-ink-500" aria-label="Mesa" />
          ) : (
            <Store className="size-4 text-ink-500" aria-label="Retiro" />
          )}
          {order.fulfillment_type === "dine_in" && tableLabel && (
            <span className="rounded-full bg-ink-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-ink-700">
              Mesa {tableLabel}
            </span>
          )}
        </div>
        <ElapsedTimer
          since={order.created_at}
          className="font-mono text-xs text-ink-500 data-[stale]:font-semibold data-[stale]:text-danger"
        />
      </div>

      {unconfirmed && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex flex-1 items-center gap-1 rounded bg-warning-soft px-1.5 py-0.5 text-xs font-medium text-warning">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
            Sin confirmar por el cliente
          </div>
          <a
            href={buildConfirmationRequestUrl(order.customer_phone ?? "", {
              businessName,
              code: order.code,
              customerName: order.customer_name,
            })}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            aria-label="Pedir confirmación por WhatsApp"
            className="flex size-touch shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white active:brightness-90"
          >
            <MessageCircle className="size-4" aria-hidden />
          </a>
        </div>
      )}

      <p className="mt-2 truncate text-sm font-medium text-ink-900">{order.customer_name}</p>

      {order.fulfillment_type === "delivery" && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 flex items-start gap-1 text-xs text-ink-700"
        >
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden />
          <span>
            {order.address}
            {order.address_reference ? ` (${order.address_reference})` : ""}
            {zoneName ? ` · ${zoneName}` : ""}
          </span>
        </div>
      )}

      {order.customer_phone && (
        <a
          href={`tel:${order.customer_phone}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 flex items-center gap-1 text-xs text-ink-500 underline-offset-2 hover:underline"
        >
          <Phone className="size-3.5 shrink-0" aria-hidden />
          {order.customer_phone}
        </a>
      )}

      {order.payment_method === "cash" && !!order.cash_change_for_cents && (
        <p className="mt-1 text-xs font-medium text-ink-700">
          Abona con {formatMoney(order.cash_change_for_cents, { currency })}
        </p>
      )}

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

