"use client";

import { Bike, Store } from "lucide-react";

import { Sheet } from "@/components/ui/sheet";
import { formatMoney } from "@/lib/money";
import type { BoardOrder } from "@/lib/orders/board-queries";

/**
 * The full ticket, reachable by tapping any card — the encargado needs this
 * to actually dispatch a pedido, not just glance at the truncated card.
 * Content mirrors the customer-facing confirmation ticket
 * (app/(public)/m/[slug]/pedido/[id]/page.tsx) since it's the same data,
 * just read by staff instead of the diner.
 */
export function OrderDetailSheet({
  order,
  currency,
  zoneNames,
  onOpenChange,
}: {
  order: BoardOrder | null;
  currency: string;
  zoneNames: Record<string, string>;
  onOpenChange: (open: boolean) => void;
}) {
  const zoneName = order?.delivery_zone_id ? zoneNames[order.delivery_zone_id] : null;

  return (
    <Sheet
      open={order !== null}
      onOpenChange={onOpenChange}
      title={order ? `Pedido ${order.code}` : ""}
    >
      {order && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-sm text-ink-700">
            {order.fulfillment_type === "delivery" ? (
              <Bike className="size-4 text-ink-500" aria-hidden />
            ) : (
              <Store className="size-4 text-ink-500" aria-hidden />
            )}
            {order.fulfillment_type === "delivery" ? "Delivery" : "Retiro en el local"}
          </div>

          <div className="rounded-lg bg-ink-50 p-3 text-sm">
            <p className="font-medium text-ink-900">{order.customer_name}</p>
            <a href={`tel:${order.customer_phone}`} className="text-ink-500 underline-offset-2 hover:underline">
              {order.customer_phone}
            </a>
            {order.fulfillment_type === "delivery" && (
              <div className="mt-1.5 border-t border-ink-200 pt-1.5 text-ink-700">
                <p>{order.address}</p>
                {order.address_reference && (
                  <p className="text-ink-500">{order.address_reference}</p>
                )}
                {zoneName && <p className="text-ink-500">Zona: {zoneName}</p>}
              </div>
            )}
          </div>

          <ul className="divide-y divide-ink-100">
            {order.items.map((item) => (
              <li key={item.id} className="py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-ink-900">
                    <span className="font-mono">{item.quantity}×</span> {item.productName}
                  </span>
                  <span className="shrink-0 font-mono text-sm text-ink-900">
                    {formatMoney(item.lineTotalCents, { currency })}
                  </span>
                </div>
                {item.options.length > 0 && (
                  <p className="mt-0.5 text-xs text-ink-500">
                    {item.options.map((o) => o.optionName).join(" · ")}
                  </p>
                )}
                {item.itemNotes && (
                  <p className="mt-0.5 text-xs italic text-ink-500">“{item.itemNotes}”</p>
                )}
              </li>
            ))}
          </ul>

          <div className="space-y-1 border-t border-ink-100 pt-3 text-sm">
            <div className="flex justify-between text-ink-500">
              <span>Subtotal</span>
              <span className="font-mono">{formatMoney(order.subtotal_cents, { currency })}</span>
            </div>
            {order.delivery_fee_cents > 0 && (
              <div className="flex justify-between text-ink-500">
                <span>Envío</span>
                <span className="font-mono">
                  {formatMoney(order.delivery_fee_cents, { currency })}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-semibold text-ink-900">
              <span>Total</span>
              <span className="font-mono">{formatMoney(order.total_cents, { currency })}</span>
            </div>
          </div>

          <div className="border-t border-ink-100 pt-3 text-sm text-ink-700">
            <p>
              Pago: {order.payment_method === "cash" ? "Efectivo" : "Transferencia"}
              {order.payment_method === "cash" && !!order.cash_change_for_cents
                ? ` · abona con ${formatMoney(order.cash_change_for_cents, { currency })}`
                : ""}
            </p>
            {order.notes && <p className="mt-1 italic text-ink-500">“{order.notes}”</p>}
          </div>

          {order.cancel_reason && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              Cancelado: {order.cancel_reason}
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
}
