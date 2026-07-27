import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TicketEdge } from "@/components/ui/ticket-edge";
import { formatMoney } from "@/lib/money";
import { loadOrderConfirmation } from "@/lib/orders/confirmation";

import { WhatsAppRedirect } from "./whatsapp-redirect";

export const metadata = { title: "Tu pedido" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const confirmation = await loadOrderConfirmation(id, slug);
  if (!confirmation) notFound();

  const { order, currency } = confirmation;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink-50 px-4 py-8">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-5 flex flex-col items-center text-center">
          <CheckCircle2 className="mb-2 size-9 text-success" aria-hidden />
          <p className="text-sm text-ink-500">{confirmation.businessName}</p>
          <p className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
            Pedido guardado
          </p>
        </div>

        {/* The one place the torn-edge ticket motif appears: this IS a receipt. */}
        <div className="rounded-t-card bg-white px-5 pt-5 shadow-ticket">
          <div className="flex items-baseline justify-between border-b border-dashed border-ink-200 pb-4">
            <span className="text-xs uppercase tracking-wide text-ink-500">Pedido nº</span>
            <span className="font-mono text-xl font-semibold tracking-wide text-ink-900">
              {confirmation.code}
            </span>
          </div>

          <ul className="divide-y divide-ink-100">
            {order.lines.map((line) => (
              <li key={line.lineId} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-ink-900">
                    <span className="font-mono">{line.quantity}×</span> {line.productName}
                  </span>
                  <span className="shrink-0 font-mono text-sm text-ink-900">
                    {formatMoney(line.lineTotalCents, { currency })}
                  </span>
                </div>
                {line.options.length > 0 && (
                  <p className="mt-0.5 text-xs text-ink-500">
                    {line.options.map((o) => o.optionName).join(" · ")}
                  </p>
                )}
                {line.notes && (
                  <p className="mt-0.5 text-xs italic text-ink-500">“{line.notes}”</p>
                )}
              </li>
            ))}
          </ul>

          <div className="space-y-1 border-t border-dashed border-ink-200 py-4 text-sm">
            <div className="flex justify-between text-ink-500">
              <span>Subtotal</span>
              <span className="font-mono">{formatMoney(order.subtotalCents, { currency })}</span>
            </div>
            {order.deliveryFeeCents > 0 && (
              <div className="flex justify-between text-ink-500">
                <span>Envío</span>
                <span className="font-mono">{formatMoney(order.deliveryFeeCents, { currency })}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-semibold text-ink-900">
              <span>Total</span>
              <span className="font-mono">{formatMoney(order.totalCents, { currency })}</span>
            </div>
          </div>

          <div className="space-y-0.5 border-t border-dashed border-ink-200 py-4 text-xs text-ink-500">
            <p>
              {confirmation.fulfillment === "delivery"
                ? `Delivery${confirmation.deliveryZoneName ? ` · ${confirmation.deliveryZoneName}` : ""}`
                : "Retiro en el local"}
            </p>
            {confirmation.address && <p>{confirmation.address}</p>}
            <p>
              Pago: {confirmation.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
              {confirmation.cashChangeForCents
                ? ` · abona con ${formatMoney(confirmation.cashChangeForCents, { currency })}`
                : ""}
            </p>
          </div>
        </div>
        <TicketEdge fill="var(--color-ink-50)" />

        <div className="mt-6">
          <WhatsAppRedirect orderId={id} waUrl={confirmation.waUrl} />
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Guardá esta página o el mensaje de WhatsApp — con el número de pedido alcanza para
          consultar en el local.
        </p>

        <Link
          href={`/m/${slug}`}
          className="mt-4 block text-center text-sm font-medium text-brand underline underline-offset-2"
        >
          Volver al menú
        </Link>
      </div>
    </div>
  );
}
