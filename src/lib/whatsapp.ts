import { formatMoney } from "@/lib/money";
import type { FulfillmentType } from "@/lib/orders/status";
import type { PricedOrder } from "@/lib/pricing";

/**
 * Builds the message the diner sends to the business.
 *
 * Two constraints shape the format:
 *
 *  1. The order code goes FIRST. `wa.me` links carry the whole message in the
 *     URL, and a very large order can push the URL past what some Android
 *     WhatsApp builds accept. If anything gets cut, the shop must still be able
 *     to find the order on the board.
 *  2. It is read on a phone, in a hurry, by someone with flour on their hands.
 *     Wide spacing, one idea per line, no dense paragraphs.
 */

const MAX_MESSAGE_LENGTH = 1400;
const MAX_NOTE_LENGTH = 160;

export interface WhatsAppMessageInput {
  code: string;
  businessName: string;
  order: PricedOrder;
  fulfillment: FulfillmentType;
  customerName: string;
  address?: string | null;
  addressReference?: string | null;
  deliveryZoneName?: string | null;
  paymentMethod: "cash" | "transfer";
  cashChangeForCents?: number | null;
  notes?: string | null;
  currency?: string;
}

/** WhatsApp reads *, _ and ~ as formatting. Strip them out of user data. */
function clean(value: string) {
  return value.replace(/[*_~`]/g, "").trim();
}

function truncate(value: string, max: number) {
  const trimmed = clean(value);
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

export function buildWhatsAppMessage(input: WhatsAppMessageInput): string {
  const money = (cents: number) => formatMoney(cents, { currency: input.currency ?? "ARS" });
  const lines: string[] = [];

  lines.push(`*PEDIDO ${input.code}*`);
  lines.push(clean(input.businessName));
  lines.push("");

  lines.push(`*Cliente:* ${clean(input.customerName)}`);

  if (input.fulfillment === "delivery") {
    lines.push("*Entrega:* Delivery");
    if (input.address) lines.push(`*Dirección:* ${clean(input.address)}`);
    if (input.addressReference) {
      lines.push(`*Referencia:* ${truncate(input.addressReference, 80)}`);
    }
    if (input.deliveryZoneName) lines.push(`*Zona:* ${clean(input.deliveryZoneName)}`);
  } else {
    lines.push("*Entrega:* Retiro en el local");
  }

  lines.push("");
  lines.push("*DETALLE*");

  for (const line of input.order.lines) {
    lines.push(`${line.quantity}x ${clean(line.productName)} — ${money(line.lineTotalCents)}`);

    for (const option of line.options) {
      const delta =
        option.priceDeltaCents !== 0 ? ` (${money(option.priceDeltaCents)})` : "";
      lines.push(`   • ${clean(option.optionName)}${delta}`);
    }

    if (line.notes) lines.push(`   _${truncate(line.notes, MAX_NOTE_LENGTH)}_`);
  }

  lines.push("");
  lines.push(`Subtotal: ${money(input.order.subtotalCents)}`);
  if (input.order.deliveryFeeCents > 0) {
    lines.push(`Envío: ${money(input.order.deliveryFeeCents)}`);
  }
  lines.push(`*TOTAL: ${money(input.order.totalCents)}*`);

  lines.push("");
  if (input.paymentMethod === "cash") {
    const change =
      input.cashChangeForCents && input.cashChangeForCents > 0
        ? ` (abona con ${money(input.cashChangeForCents)})`
        : "";
    lines.push(`*Pago:* Efectivo${change}`);
  } else {
    lines.push("*Pago:* Transferencia");
  }

  if (input.notes) {
    lines.push("");
    lines.push(`*Aclaraciones:* ${truncate(input.notes, MAX_NOTE_LENGTH)}`);
  }

  const message = lines.join("\n");

  // Last-resort guard. The code and customer are in the first lines, so a
  // truncated message is still actionable.
  return message.length <= MAX_MESSAGE_LENGTH
    ? message
    : `${message.slice(0, MAX_MESSAGE_LENGTH - 40)}\n\n… ver detalle completo en el sistema.`;
}

/**
 * `wa.me` wants digits only — no '+', no spaces, no dashes. An Argentine
 * mobile is 549 + area code + number, e.g. 5493811234567.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
