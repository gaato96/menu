/**
 * Whether a business is open right now, given its weekly schedule.
 *
 * Split into a pure function (testable with fixed inputs) and a thin
 * real-clock adapter, because kitchens close after midnight: a Friday
 * 20:00-01:00 shift is normal, and "today's" row has to stay open into what
 * the calendar calls Saturday.
 */

export interface BusinessHourRow {
  day_of_week: number; // 0 = Sunday, per the businesses table
  opens_at: string; // "HH:MM:SS" as returned by Postgres `time`
  closes_at: string;
}

function toMinutes(hhmmss: string): number {
  const [h, m] = hhmmss.split(":").map(Number);
  return h * 60 + m;
}

/**
 * @param dayOfWeek 0-6, Sunday first, in the business's own timezone.
 * @param minutesSinceMidnight local time, in the business's own timezone.
 */
export function computeIsOpen(
  dayOfWeek: number,
  minutesSinceMidnight: number,
  hours: BusinessHourRow[],
): boolean {
  const yesterday = (dayOfWeek + 6) % 7;

  for (const row of hours) {
    const opens = toMinutes(row.opens_at);
    const closes = toMinutes(row.closes_at);
    const wraps = closes <= opens;

    if (row.day_of_week === dayOfWeek) {
      if (wraps) {
        // Today's shift started today and spills into tomorrow.
        if (minutesSinceMidnight >= opens) return true;
      } else if (minutesSinceMidnight >= opens && minutesSinceMidnight < closes) {
        return true;
      }
    }

    // A shift that started yesterday and wraps past midnight is still open
    // during the early hours of today.
    if (row.day_of_week === yesterday && wraps && minutesSinceMidnight < closes) {
      return true;
    }
  }

  return false;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const weekday = parts.find((p) => p.type === "weekday")!.value;
  const hour = Number(parts.find((p) => p.type === "hour")!.value);
  const minute = Number(parts.find((p) => p.type === "minute")!.value);

  return {
    dayOfWeek: WEEKDAY_INDEX[weekday],
    // Some runtimes render midnight as "24" under hour12:false.
    minutesSinceMidnight: (hour % 24) * 60 + minute,
  };
}

export function isBusinessOpenNow(
  timezone: string,
  hours: BusinessHourRow[],
  manualOverride: boolean,
  now: Date = new Date(),
): boolean {
  // The "we're slammed, stop taking orders" switch always wins.
  if (!manualOverride) return false;
  if (hours.length === 0) return true;

  const { dayOfWeek, minutesSinceMidnight } = zonedParts(now, timezone);
  return computeIsOpen(dayOfWeek, minutesSinceMidnight, hours);
}
