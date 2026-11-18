import { formatMoney } from "@/lib/money";
import type { BoardOrder } from "@/lib/orders/board-queries";

/**
 * Kitchen ticket ("comanda") for a thermal printer, as a self-contained HTML
 * document. Pure: the board prints it through a hidden iframe (print.ts), so
 * there is no driver, no extra request and nothing to install. Any printer
 * the tablet or PC already prints to — USB, Bluetooth or network thermal at
 * 58 or 80 mm — works.
 *
 * Silent printing (no dialog) is a browser launch flag, not something a page
 * can grant itself: Chrome started with --kiosk-printing prints straight to
 * the default printer. Without it, the dialog shows and one tap prints.
 */

export type PaperWidth = 58 | 80;
export type PrintAuto = "off" | "on_new" | "on_kitchen";

export interface ComandaInput {
  order: BoardOrder;
  businessName: string;
  currency: string;
  paperMm: PaperWidth;
  zoneName?: string | null;
  tableLabel?: string | null;
  /** Business timezone, for the printed time. */
  timeZone?: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FULFILLMENT: Record<string, string> = {
  delivery: "DELIVERY",
  pickup: "RETIRA",
  dine_in: "MESA",
};

export function buildComandaHtml(input: ComandaInput): string {
  const { order, businessName, currency, paperMm, zoneName, tableLabel } = input;
  const time = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    timeZone: input.timeZone ?? "America/Argentina/Buenos_Aires",
  }).format(new Date(order.created_at));

  const kind = FULFILLMENT[order.fulfillment_type] ?? order.fulfillment_type.toUpperCase();
  const where =
    order.fulfillment_type === "dine_in"
      ? tableLabel
        ? `Mesa ${tableLabel}`
        : ""
      : order.fulfillment_type === "delivery"
        ? [order.address, order.address_reference ? `(${order.address_reference})` : "", zoneName ?? ""]
            .filter(Boolean)
            .join(" ")
        : "";

  const items = order.items
    .map((item) => {
      const options = item.options.map((o) => `<div class="opt">+ ${esc(o.optionName)}</div>`).join("");
      const notes = item.itemNotes ? `<div class="note">» ${esc(item.itemNotes)}</div>` : "";
      return `<div class="item"><span class="qty">${item.quantity}x</span> ${esc(item.productName)}${options}${notes}</div>`;
    })
    .join("");

  const payment =
    order.payment_method === "cash"
      ? `Efectivo${order.cash_change_for_cents ? ` · abona con ${formatMoney(order.cash_change_for_cents, { currency })}` : ""}`
      : order.payment_method === "mercadopago"
        ? `Mercado Pago${order.payment_status === "paid" ? " · PAGADO" : " · sin acreditar"}`
        : "Transferencia";

  // 58mm paper prints ~48mm wide, 80mm prints ~72mm.
  const printable = paperMm === 58 ? 48 : 72;
  const base = paperMm === 58 ? 12 : 14;

  return `<!doctype html><html><head><meta charset="utf-8"><title>Comanda ${esc(order.code)}</title><style>
@page { size: ${paperMm}mm auto; margin: 0; }
* { box-sizing: border-box; }
body { width: ${printable}mm; margin: 0 auto; padding: 3mm 0 6mm; font-family: "Courier New", monospace; font-size: ${base}px; color: #000; }
.c { text-align: center; }
.big { font-size: ${base + 10}px; font-weight: 700; }
.kind { font-size: ${base + 4}px; font-weight: 700; border: 2px solid #000; padding: 1mm 2mm; display: inline-block; margin: 1mm 0; }
hr { border: 0; border-top: 1px dashed #000; margin: 2mm 0; }
.item { font-size: ${base + 2}px; font-weight: 700; margin: 1.5mm 0; }
.qty { display: inline-block; min-width: 7mm; }
.opt { font-weight: 400; font-size: ${base}px; padding-left: 7mm; }
.note { font-weight: 700; font-size: ${base}px; padding-left: 7mm; }
.row { display: flex; justify-content: space-between; gap: 2mm; }
</style></head><body>
<div class="c">${esc(businessName)}</div>
<div class="c big">${esc(order.code)}</div>
<div class="c"><span class="kind">${esc(kind)}</span></div>
<div class="c">${esc(time)}</div>
<hr>
<div><b>${esc(order.customer_name)}</b>${order.customer_phone ? ` · ${esc(order.customer_phone)}` : ""}</div>
${where ? `<div>${esc(where)}</div>` : ""}
<hr>
${items}
${order.notes ? `<hr><div class="note">NOTA: ${esc(order.notes)}</div>` : ""}
<hr>
<div class="row"><b>TOTAL</b><b>${esc(formatMoney(order.total_cents, { currency }))}</b></div>
<div>${esc(payment)}</div>
</body></html>`;
}
