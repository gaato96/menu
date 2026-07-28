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
  /** Only meaningful when fulfillment is "dine_in". */
  tableLabel?: string | null;
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
  } else if (input.fulfillment === "dine_in") {
    lines.push("*Entrega:* En el local");
    if (input.tableLabel) lines.push(`*Mesa:* ${clean(input.tableLabel)}`);
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

/**
 * A customer typing their phone at checkout writes it every way imaginable —
 * "381 123-4567", "0381-15-123456", "+54 9 381 1234567". `buildWhatsAppUrl`
 * only strips non-digits; without this, most of those produce a `wa.me` link
 * that opens to nobody. Normalizes to the 549 + area + number shape Argentina
 * needs for WhatsApp specifically (the leading 9 marks a mobile number).
 */
export function normalizeArgentinePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  // A local dialing "0" prefix (0381-...) is never part of the real number.
  if (digits.startsWith("0")) digits = digits.slice(1);

  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54")) return `549${digits.slice(2)}`;
  // No country code at all — e.g. a 10-digit "3811234567" typed locally.
  return `549${digits}`;
}

export interface ConfirmationRequestInput {
  businessName: string;
  code: string;
  customerName: string;
}

/**
 * Business → customer direction, the opposite of buildWhatsAppMessage above.
 * Deliberately short and separate rather than reusing buildWhatsAppMessage:
 * that one needs a full PricedOrder, which the board never constructs just
 * to nudge someone to confirm.
 */
export function buildConfirmationRequest(input: ConfirmationRequestInput): string {
  const firstName = clean(input.customerName).split(" ")[0] || clean(input.customerName);
  return (
    `Hola ${firstName}, te escribimos de ${clean(input.businessName)}. ` +
    `Nos entró tu pedido ${input.code} pero todavía no está confirmado. ` +
    `¿Lo confirmamos y lo empezamos a preparar?`
  );
}

export function buildConfirmationRequestUrl(
  phone: string,
  input: ConfirmationRequestInput,
): string {
  return buildWhatsAppUrl(normalizeArgentinePhone(phone), buildConfirmationRequest(input));
}
