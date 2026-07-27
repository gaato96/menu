/**
 * Money is always integer cents. Never floats.
 *
 * A pizzeria in Tucumán charging $15.400 is 1_540_000 cents. Postgres `integer`
 * tops out at $21.474.836, which no single order will reach; aggregates for
 * reporting use `bigint` on the database side.
 */

export const CENTS = 100;

export function formatMoney(
  cents: number,
  { currency = "ARS", locale = "es-AR" }: { currency?: string; locale?: string } = {},
) {
  const amount = cents / CENTS;

  // Argentine menus are priced in whole pesos. Showing "$15.400,00" on every
  // card is noise, so decimals only appear when they carry information.
  const hasFraction = cents % CENTS !== 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(amount);
}

/** Parses what an owner types into a price field: "15.400", "15400,50", "$ 15400". */
export function parseMoneyToCents(input: string): number | null {
  const cleaned = input
    .replace(/[^\d.,-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "") // thousands separator
    .replace(",", ".");

  if (cleaned === "" || cleaned === "-") return null;

  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;

  return Math.round(value * CENTS);
}

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
