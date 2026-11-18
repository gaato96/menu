/**
 * The owner's weekly summary: last 7 business days against the 7 before.
 *
 * Pure — rows in, numbers out — so it is tested without a database. The page
 * (/panel/resumen) does the two reads and renders this.
 *
 * "Ventas" counts every order that was not cancelled, including the ones
 * still in progress: on a Friday night the owner wants to see tonight in the
 * number, not tomorrow.
 */

export interface SummaryOrderRow {
  id: string;
  status: string;
  fulfillment_type: string;
  total_cents: number;
  created_at: string;
  customer_phone: string | null;
  whatsapp_opened_at: string | null;
}

export interface SummaryItemRow {
  order_id: string;
  product_name: string;
  quantity: number;
  line_total_cents: number;
}

export interface PeriodTotals {
  orders: number;
  revenueCents: number;
  avgTicketCents: number;
  cancelled: number;
}

export interface WeeklySummary {
  current: PeriodTotals;
  previous: PeriodTotals;
  /** Percent change, null when the previous week had nothing to compare to. */
  revenueChangePct: number | null;
  ordersChangePct: number | null;
  byFulfillment: { delivery: number; pickup: number; dine_in: number };
  topProducts: { name: string; quantity: number; revenueCents: number }[];
  /** Orders per local hour, 0-23. */
  byHour: number[];
  peakHour: number | null;
  /** Orders per weekday, 0 = domingo. */
  byWeekday: number[];
  bestWeekday: number | null;
  repeatCustomers: number;
  newCustomers: number;
  /** Delivery/pickup orders whose WhatsApp message was never opened. */
  unconfirmed: number;
}

function totals(rows: SummaryOrderRow[]): PeriodTotals {
  const valid = rows.filter((r) => r.status !== "cancelled");
  const revenueCents = valid.reduce((sum, r) => sum + r.total_cents, 0);
  return {
    orders: valid.length,
    revenueCents,
    avgTicketCents: valid.length ? Math.round(revenueCents / valid.length) : 0,
    cancelled: rows.length - valid.length,
  };
}

function pct(now: number, before: number): number | null {
  if (before === 0) return null;
  return Math.round(((now - before) / before) * 100);
}

function localParts(iso: string, timeZone: string): { hour: number; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(new Date(iso));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  return { hour, weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd) };
}

function argmax(values: number[]): number | null {
  let best = -1;
  let bestValue = 0;
  values.forEach((v, i) => {
    if (v > bestValue) {
      best = i;
      bestValue = v;
    }
  });
  return best >= 0 ? best : null;
}

export function summarizeWeek(input: {
  current: SummaryOrderRow[];
  previous: SummaryOrderRow[];
  currentItems: SummaryItemRow[];
  /** Phones seen in orders BEFORE the current week, to tell new from repeat. */
  knownPhones: Set<string>;
  timeZone: string;
}): WeeklySummary {
  const current = totals(input.current);
  const previous = totals(input.previous);
  const valid = input.current.filter((r) => r.status !== "cancelled");
  const validIds = new Set(valid.map((r) => r.id));

  const byFulfillment = { delivery: 0, pickup: 0, dine_in: 0 };
  const byHour = Array.from({ length: 24 }, () => 0);
  const byWeekday = Array.from({ length: 7 }, () => 0);
  const phonesThisWeek = new Set<string>();
  let unconfirmed = 0;

  for (const order of valid) {
    if (order.fulfillment_type in byFulfillment) {
      byFulfillment[order.fulfillment_type as keyof typeof byFulfillment] += 1;
    }
    const { hour, weekday } = localParts(order.created_at, input.timeZone);
    byHour[hour] += 1;
    if (weekday >= 0) byWeekday[weekday] += 1;
    if (order.customer_phone) phonesThisWeek.add(order.customer_phone.replace(/\D/g, ""));
    if (order.fulfillment_type !== "dine_in" && !order.whatsapp_opened_at) unconfirmed += 1;
  }

  const products = new Map<string, { quantity: number; revenueCents: number }>();
  for (const item of input.currentItems) {
    if (!validIds.has(item.order_id)) continue;
    const entry = products.get(item.product_name) ?? { quantity: 0, revenueCents: 0 };
    entry.quantity += item.quantity;
    entry.revenueCents += item.line_total_cents;
    products.set(item.product_name, entry);
  }
  const topProducts = [...products.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.quantity - a.quantity || b.revenueCents - a.revenueCents)
    .slice(0, 5);

  let repeatCustomers = 0;
  for (const phone of phonesThisWeek) if (input.knownPhones.has(phone)) repeatCustomers += 1;

  return {
    current,
    previous,
    revenueChangePct: pct(current.revenueCents, previous.revenueCents),
    ordersChangePct: pct(current.orders, previous.orders),
    byFulfillment,
    topProducts,
    byHour,
    peakHour: argmax(byHour),
    byWeekday,
    bestWeekday: argmax(byWeekday),
    repeatCustomers,
    newCustomers: phonesThisWeek.size - repeatCustomers,
    unconfirmed,
  };
}

export const WEEKDAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** Three plain sentences for the top of the page. Never more than what the numbers say. */
export function summaryHeadlines(summary: WeeklySummary, formatMoney: (cents: number) => string): string[] {
  const lines: string[] = [];
  const { current, revenueChangePct } = summary;

  if (current.orders === 0) {
    return ["Esta semana no entraron pedidos por VivoMenu."];
  }

  if (revenueChangePct === null) {
    lines.push(`Vendiste ${formatMoney(current.revenueCents)} en ${current.orders} pedidos.`);
  } else if (revenueChangePct >= 0) {
    lines.push(
      `Vendiste ${formatMoney(current.revenueCents)}, un ${revenueChangePct}% más que la semana anterior.`,
    );
  } else {
    lines.push(
      `Vendiste ${formatMoney(current.revenueCents)}, un ${Math.abs(revenueChangePct)}% menos que la semana anterior.`,
    );
  }

  if (summary.bestWeekday !== null && summary.peakHour !== null) {
    lines.push(
      `El día más fuerte fue el ${WEEKDAY_NAMES[summary.bestWeekday]} y la hora pico, de ${summary.peakHour} a ${(summary.peakHour + 1) % 24} h.`,
    );
  }

  const top = summary.topProducts[0];
  if (top) lines.push(`Lo más pedido: ${top.name} (${top.quantity}).`);

  return lines;
}
