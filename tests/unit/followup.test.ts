import { describe, expect, it } from "vitest";

import { argentinaDate, daysBetween, evaluateFollowup, pushesToSend, type FollowupInput } from "@/lib/admin/followup";

const base: FollowupInput = {
  businessName: "Burger X",
  createdAt: "2026-11-10T15:00:00.000Z",
  lastActivityAt: "2026-11-17T22:00:00.000Z",
  lastOrderAt: "2026-11-17T23:00:00.000Z",
  ordersLast7Days: 12,
  subscriptionStatus: "trial",
  trialEndsAt: "2026-11-25",
};

describe("date helpers", () => {
  it("counts whole days and converts to Argentina time", () => {
    expect(daysBetween("2026-11-18", "2026-11-25")).toBe(7);
    expect(daysBetween("2026-11-25", "2026-11-18")).toBe(-7);
    // 01:30 UTC on the 19th is still the 18th in Argentina.
    expect(argentinaDate("2026-11-19T01:30:00.000Z")).toBe("2026-11-18");
  });
});

describe("evaluateFollowup", () => {
  it("a healthy trial needs nothing", () => {
    const v = evaluateFollowup(base, "2026-11-18");
    expect(v.stage).toBe("trial");
    expect(v.trialDaysLeft).toBe(7);
    expect(v.needsFollowup).toBe(false);
  });

  it("flags the last days of the trial", () => {
    const v = evaluateFollowup(base, "2026-11-24");
    expect(v.stage).toBe("trial_ending");
    expect(v.reasons[0]).toBe("La prueba termina en 1 día.");
    expect(evaluateFollowup(base, "2026-11-25").reasons[0]).toBe("Hoy es el último día de prueba.");
  });

  it("flags an ended trial that is still marked as trial", () => {
    const v = evaluateFollowup(base, "2026-11-28");
    expect(v.stage).toBe("trial_ended");
    expect(v.trialDaysLeft).toBe(-3);
    expect(v.reasons[0]).toContain("terminó hace 3 días");
  });

  it("flags nobody using the panel and no orders", () => {
    const v = evaluateFollowup({ ...base, lastActivityAt: null, ordersLast7Days: 0 }, "2026-11-18");
    expect(v.needsFollowup).toBe(true);
    expect(v.reasons).toContain("Nadie entró al panel desde el alta (8 días).");
    expect(v.reasons).toContain("Sin pedidos en los últimos 7 días.");
  });

  it("does not flag missing orders on a brand-new business", () => {
    const v = evaluateFollowup(
      { ...base, createdAt: "2026-11-17T15:00:00.000Z", lastActivityAt: "2026-11-17T16:00:00.000Z", ordersLast7Days: 0 },
      "2026-11-18",
    );
    expect(v.needsFollowup).toBe(false);
  });

  it("paying and suspended businesses", () => {
    expect(
      evaluateFollowup({ ...base, subscriptionStatus: "active", lastActivityAt: "2026-12-19T12:00:00.000Z" }, "2026-12-20")
        .needsFollowup,
    ).toBe(false);
    expect(
      evaluateFollowup({ ...base, subscriptionStatus: "active", lastActivityAt: "2026-12-01T12:00:00.000Z" }, "2026-12-20")
        .needsFollowup,
    ).toBe(true);
    expect(evaluateFollowup({ ...base, subscriptionStatus: "past_due" }, "2026-12-20").reasons[0]).toContain("cobrar");
    expect(evaluateFollowup({ ...base, subscriptionStatus: "suspended" }, "2026-12-20").needsFollowup).toBe(false);
  });
});

describe("pushesToSend", () => {
  const row = {
    businessId: "b1",
    businessName: "Burger X",
    subscriptionStatus: "trial" as const,
    trialEndsAt: "2026-11-25",
    trialReminderSentAt: null,
    trialEndedNotifiedAt: null,
  };

  it("sends the reminder the day before and the ended push after", () => {
    expect(pushesToSend([row], "2026-11-20")).toEqual([]);
    expect(pushesToSend([row], "2026-11-24")[0].kind).toBe("reminder");
    expect(pushesToSend([row], "2026-11-24")[0].title).toContain("mañana");
    expect(pushesToSend([row], "2026-11-26")[0].kind).toBe("ended");
  });

  it("never sends the same push twice, and skips non-trial", () => {
    expect(pushesToSend([{ ...row, trialReminderSentAt: "x" }], "2026-11-24")).toEqual([]);
    expect(pushesToSend([{ ...row, trialEndedNotifiedAt: "x" }], "2026-11-26")).toEqual([]);
    expect(pushesToSend([{ ...row, subscriptionStatus: "active" }], "2026-11-26")).toEqual([]);
  });
});
