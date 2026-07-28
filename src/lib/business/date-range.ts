/**
 * Converts a business-local calendar date into a UTC instant range for
 * querying `created_at`.
 *
 * Assumes a fixed UTC offset for the timezone (no DST) — true for every
 * Argentine timezone this product targets (Argentina dropped DST in 2009).
 * If a future business needs a DST-observing zone, this needs the full
 * Intl-based offset lookup per-date rather than a single reference sample.
 */
function offsetHours(timeZone: string, referenceDateIso: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date(referenceDateIso));

  const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const match = /GMT([+-]\d+)/.exec(raw);
  return match ? Number(match[1]) : 0;
}

/** Midnight of `dateStr` (YYYY-MM-DD) in `timeZone`, as a UTC ISO instant. */
export function businessMidnightUtcIso(dateStr: string, timeZone: string): string {
  // Noon reference avoids landing on the wrong side of a date boundary while
  // reading the offset.
  const offset = offsetHours(timeZone, `${dateStr}T12:00:00Z`);
  const utcMs = Date.parse(`${dateStr}T00:00:00Z`) - offset * 3_600_000;
  return new Date(utcMs).toISOString();
}

/** [start, end) UTC bounds covering every `created_at` on business-local `dateStr`. */
export function businessDayRangeUtc(dateStr: string, timeZone: string) {
  const startIso = businessMidnightUtcIso(dateStr, timeZone);
  const endIsoExclusive = new Date(Date.parse(startIso) + 24 * 3_600_000).toISOString();
  return { startIso, endIsoExclusive };
}

/** [start of `from`, end of `to`) — inclusive on both calendar days. */
export function businessRangeUtc(from: string, to: string, timeZone: string) {
  return {
    startIso: businessDayRangeUtc(from, timeZone).startIso,
    endIsoExclusive: businessDayRangeUtc(to, timeZone).endIsoExclusive,
  };
}

/** Today's date (YYYY-MM-DD) as seen in `timeZone`, right now. */
export function businessTodayDateStr(timeZone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
