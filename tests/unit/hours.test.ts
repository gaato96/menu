import { describe, expect, it } from "vitest";

import { type BusinessHourRow, computeIsOpen, isBusinessOpenNow } from "@/lib/business/hours";

// Thu-Sun, 20:00 to 01:00 — the seed's actual schedule.
const WEEKEND_DINNER: BusinessHourRow[] = [4, 5, 6, 0].map((day_of_week) => ({
  day_of_week,
  opens_at: "20:00:00",
  closes_at: "01:00:00",
}));

describe("computeIsOpen", () => {
  it("is open mid-shift", () => {
    expect(computeIsOpen(5, 21 * 60, WEEKEND_DINNER)).toBe(true); // Friday 21:00
  });

  it("is closed before the shift starts", () => {
    expect(computeIsOpen(5, 19 * 60, WEEKEND_DINNER)).toBe(false); // Friday 19:00
  });

  it("stays open past midnight, into the next calendar day", () => {
    // Saturday 00:30 belongs to Friday's shift that wraps past midnight.
    expect(computeIsOpen(6, 30, WEEKEND_DINNER)).toBe(true);
  });

  it("closes right at the wrap boundary", () => {
    expect(computeIsOpen(6, 60, WEEKEND_DINNER)).toBe(false); // Saturday 01:00
  });

  it("is closed on a day with no shift at all", () => {
    expect(computeIsOpen(2, 21 * 60, WEEKEND_DINNER)).toBe(false); // Tuesday
  });

  it("handles a same-day range that does not cross midnight", () => {
    const lunch: BusinessHourRow[] = [{ day_of_week: 1, opens_at: "12:00:00", closes_at: "15:00:00" }];
    expect(computeIsOpen(1, 13 * 60, lunch)).toBe(true);
    expect(computeIsOpen(1, 16 * 60, lunch)).toBe(false);
    expect(computeIsOpen(1, 12 * 60, lunch)).toBe(true);
    expect(computeIsOpen(1, 15 * 60, lunch)).toBe(false);
  });

  it("does not leak a wrapped shift into the wrong following day", () => {
    // Only Friday has a shift. Sunday 00:30 must not read as open.
    const fridayOnly: BusinessHourRow[] = [{ day_of_week: 5, opens_at: "20:00:00", closes_at: "01:00:00" }];
    expect(computeIsOpen(0, 30, fridayOnly)).toBe(false); // Sunday 00:30
  });
});

describe("isBusinessOpenNow", () => {
  it("is always closed when the manual switch is off, regardless of schedule", () => {
    expect(
      isBusinessOpenNow("America/Argentina/Tucuman", WEEKEND_DINNER, false, new Date()),
    ).toBe(false);
  });

  it("treats a business with no configured hours as always open", () => {
    expect(isBusinessOpenNow("America/Argentina/Tucuman", [], true, new Date())).toBe(true);
  });

  it("reads the schedule in the business's own timezone, not the server's", () => {
    // 23:30 UTC on a Friday is 20:30 in Tucumán (UTC-3) — inside the shift —
    // but would be a Saturday in UTC+X timezones. The business's own zone
    // must be what decides this, not wherever the server happens to run.
    const fridayLateUtc = new Date("2026-07-31T23:30:00Z");
    expect(isBusinessOpenNow("America/Argentina/Tucuman", WEEKEND_DINNER, true, fridayLateUtc)).toBe(
      true,
    );
  });
});
