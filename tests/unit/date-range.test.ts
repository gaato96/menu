import { describe, expect, it } from "vitest";

import {
  businessDayRangeUtc,
  businessMidnightUtcIso,
  businessRangeUtc,
  businessTodayDateStr,
} from "@/lib/business/date-range";

const TZ = "America/Argentina/Tucuman"; // fixed UTC-3, no DST

describe("businessMidnightUtcIso", () => {
  it("converts local midnight to the correct UTC instant (UTC-3)", () => {
    expect(businessMidnightUtcIso("2026-07-27", TZ)).toBe("2026-07-27T03:00:00.000Z");
  });
});

describe("businessDayRangeUtc", () => {
  it("covers exactly 24 hours, local midnight to local midnight", () => {
    const { startIso, endIsoExclusive } = businessDayRangeUtc("2026-07-27", TZ);
    expect(startIso).toBe("2026-07-27T03:00:00.000Z");
    expect(endIsoExclusive).toBe("2026-07-28T03:00:00.000Z");
  });

  it("places 23:59 local time on the correct side of the boundary", () => {
    const { startIso, endIsoExclusive } = businessDayRangeUtc("2026-07-27", TZ);
    // 2026-07-27 23:59 Tucumán = 2026-07-28 02:59 UTC — inside the range.
    const lateNight = Date.parse("2026-07-28T02:59:00Z");
    expect(lateNight).toBeGreaterThanOrEqual(Date.parse(startIso));
    expect(lateNight).toBeLessThan(Date.parse(endIsoExclusive));

    // 2026-07-28 00:01 Tucumán = 2026-07-28 03:01 UTC — the NEXT business day.
    const nextDay = Date.parse("2026-07-28T03:01:00Z");
    expect(nextDay).toBeGreaterThanOrEqual(Date.parse(endIsoExclusive));
  });
});

describe("businessRangeUtc", () => {
  it("spans from the start of the first day to the end of the last", () => {
    const { startIso, endIsoExclusive } = businessRangeUtc("2026-07-25", "2026-07-27", TZ);
    expect(startIso).toBe("2026-07-25T03:00:00.000Z");
    expect(endIsoExclusive).toBe("2026-07-28T03:00:00.000Z");
  });

  it("degenerates to a single day when from === to", () => {
    const single = businessRangeUtc("2026-07-27", "2026-07-27", TZ);
    const day = businessDayRangeUtc("2026-07-27", TZ);
    expect(single).toEqual(day);
  });
});

describe("businessTodayDateStr", () => {
  it("reads the date in the business timezone, not the server's", () => {
    // 2026-07-28 02:00 UTC is still 2026-07-27 23:00 in Tucumán (UTC-3).
    const stillYesterdayLocally = new Date("2026-07-28T02:00:00Z");
    expect(businessTodayDateStr(TZ, stillYesterdayLocally)).toBe("2026-07-27");

    const nowNextDay = new Date("2026-07-28T04:00:00Z");
    expect(businessTodayDateStr(TZ, nowNextDay)).toBe("2026-07-28");
  });
});
