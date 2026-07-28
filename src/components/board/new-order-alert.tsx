"use client";

import { Bike, Store } from "lucide-react";

import { formatMoney } from "@/lib/money";
import type { BoardOrder } from "@/lib/orders/board-queries";

/**
 * Full-screen, high-contrast, impossible-to-miss. This — not the board
 * itself — is the actual product: the whole point is that a cashier mid-rush
 * cannot fail to notice a new order landed.
 */
export function NewOrderAlert({
  order,
  currency,
  queueLength,
  onAccept,
}: {
  order: BoardOrder;
  currency: string;
  queueLength: number;
  onAccept: () => void;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={`Pedido nuevo ${order.code}`}
      className="animate-alert-pulse fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-brand p-6 text-center text-brand-fg"
    >
      {queueLength > 1 && (
        <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold">
          +{queueLength - 1} pedido{queueLength - 1 === 1 ? "" : "s"} más esperando
        </span>
      )}

      <div>
        <p className="font-display text-lg font-bold tracking-wide uppercase opacity-90">
          Pedido nuevo
        </p>
        <p className="font-mono text-6xl font-extrabold">{order.code}</p>
      </div>

      <div className="flex items-center gap-2 text-lg">
        {order.fulfillment_type === "delivery" ? (
          <Bike className="size-6" aria-hidden />
        ) : (
          <Store className="size-6" aria-hidden />
        )}
        {order.customer_name}
      </div>

      <p className="font-mono text-2xl font-semibold">{formatMoney(order.total_cents, { currency })}</p>

      <button
        type="button"
        onClick={onAccept}
        className="min-h-touch-lg rounded-lg bg-white px-10 text-lg font-bold text-brand active:scale-95"
      >
        Ver pedido
      </button>
    </div>
  );
}
