/**
 * Trial follow-up for the superadmin: who to call, and why.
 *
 * Pure — rows and "today" in, verdicts out — so the admin dashboard and the
 * daily cron (/api/cron/seguimiento) agree on every rule, and the rules are
 * unit-tested without a database. Dates are business-local YYYY-MM-DD
 * strings (Argentina has no DST, see src/lib/business/date-range.ts).
 */

export const TRIAL_DAYS = 15;
/** "Ends soon" starts this many days before the last trial day. */
export const TRIAL_ENDING_WINDOW_DAYS = 2;
/** No one opened the panel for this long during the trial: call them. */
export const INACTIVE_ALERT_DAYS = 3;

export type FollowupStage = "trial" | "trial_ending" | "trial_ended" | "paying" | "past_due" | "suspended";

export interface FollowupInput {
  businessName: string;
  /** Business row created_at (ISO). */
  createdAt: string;
  /** businesses.last_activity_at (ISO) or null if nobody ever opened the panel. */
  lastActivityAt: string | null;
  /** Most recent order (ISO) in the window the caller loaded, or null. */
  lastOrderAt: string | null;
  ordersLast7Days: number;
  subscriptionStatus: "trial" | "active" | "past_due" | "suspended";
  /** subscriptions.trial_ends_at, YYYY-MM-DD. */
  trialEndsAt: string;
}

export interface FollowupVerdict {
  stage: FollowupStage;
  /** Days until the last trial day (0 = today is the last day, negative = ended). Null when not in trial. */
  trialDaysLeft: number | null;
  /** Whole days since anyone opened the panel (since creation if never). */
  inactiveDays: number;
  needsFollowup: boolean;
  /** Plain-Spanish reasons, most urgent first. */
  reasons: string[];
}

/** Days from `from` to `to`, both YYYY-MM-DD. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

/** ISO instant -> YYYY-MM-DD in Argentina (UTC-3, no DST). */
export function argentinaDate(iso: string): string {
  return new Date(Date.parse(iso) - 3 * 3_600_000).toISOString().slice(0, 10);
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function evaluateFollowup(input: FollowupInput, today: string): FollowupVerdict {
  const since = input.lastActivityAt ?? input.createdAt;
  const inactiveDays = Math.max(0, daysBetween(argentinaDate(since), today));
  const ageDays = Math.max(0, daysBetween(argentinaDate(input.createdAt), today));
  const reasons: string[] = [];

  if (input.subscriptionStatus === "suspended") {
    return { stage: "suspended", trialDaysLeft: null, inactiveDays, needsFollowup: false, reasons };
  }
  if (input.subscriptionStatus === "past_due") {
    reasons.push("Suscripción vencida: cobrar.");
    return { stage: "past_due", trialDaysLeft: null, inactiveDays, needsFollowup: true, reasons };
  }
  if (input.subscriptionStatus === "active") {
    if (inactiveDays >= 7) reasons.push(`Paga, pero hace ${plural(inactiveDays, "día", "días")} que no entran al panel.`);
    return { stage: "paying", trialDaysLeft: null, inactiveDays, needsFollowup: reasons.length > 0, reasons };
  }

  const trialDaysLeft = daysBetween(today, input.trialEndsAt);
  let stage: FollowupStage = "trial";

  if (trialDaysLeft < 0) {
    stage = "trial_ended";
    reasons.push(
      `La prueba terminó hace ${plural(-trialDaysLeft, "día", "días")}: cobrar la suscripción o dar de baja.`,
    );
  } else if (trialDaysLeft <= TRIAL_ENDING_WINDOW_DAYS) {
    stage = "trial_ending";
    reasons.push(
      trialDaysLeft === 0
        ? "Hoy es el último día de prueba."
        : `La prueba termina en ${plural(trialDaysLeft, "día", "días")}.`,
    );
  }

  if (inactiveDays >= INACTIVE_ALERT_DAYS) {
    reasons.push(
      input.lastActivityAt
        ? `Hace ${plural(inactiveDays, "día", "días")} que nadie entra al panel.`
        : `Nadie entró al panel desde el alta (${plural(inactiveDays, "día", "días")}).`,
    );
  }
  if (ageDays >= INACTIVE_ALERT_DAYS && input.ordersLast7Days === 0) {
    reasons.push("Sin pedidos en los últimos 7 días.");
  }

  return { stage, trialDaysLeft, inactiveDays, needsFollowup: reasons.length > 0, reasons };
}

export interface PushCandidate {
  businessId: string;
  businessName: string;
  subscriptionStatus: FollowupInput["subscriptionStatus"];
  trialEndsAt: string;
  trialReminderSentAt: string | null;
  trialEndedNotifiedAt: string | null;
}

export type FollowupPush = { businessId: string; kind: "reminder" | "ended"; title: string; body: string };

/**
 * What the daily cron sends. Each push goes out once per business (the
 * caller stamps the marker after sending), so running the cron twice in a day
 * — a retry, a manual call — never pages twice.
 */
export function pushesToSend(rows: PushCandidate[], today: string): FollowupPush[] {
  const pushes: FollowupPush[] = [];
  for (const row of rows) {
    if (row.subscriptionStatus !== "trial") continue;
    const left = daysBetween(today, row.trialEndsAt);

    if (left < 0 && !row.trialEndedNotifiedAt) {
      pushes.push({
        businessId: row.businessId,
        kind: "ended",
        title: `Terminó la prueba de ${row.businessName}`,
        body: "Escribile para cobrar la suscripción o ver qué le faltó.",
      });
    } else if (left >= 0 && left <= 1 && !row.trialReminderSentAt) {
      pushes.push({
        businessId: row.businessId,
        kind: "reminder",
        title: `${row.businessName}: la prueba termina ${left === 0 ? "hoy" : "mañana"}`,
        body: "Buen momento para preguntarle cómo le fue y pasarle el precio.",
      });
    }
  }
  return pushes;
}
