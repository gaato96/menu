import { NextResponse } from "next/server";

import { pushesToSend, type PushCandidate } from "@/lib/admin/followup";
import { businessTodayDateStr } from "@/lib/business/date-range";
import { sendAdminPush } from "@/lib/push/send";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Daily trial check (vercel.json cron, 09:00 Argentina). Pushes Gastón's
 * devices when a trial ends tomorrow and when it has ended.
 *
 * Auth: when CRON_SECRET is set in Vercel, Vercel sends it as a Bearer token
 * and anything else is rejected. Without it the route still only ever sends
 * each push once per business (the markers below), so a stray call cannot
 * spam — but set CRON_SECRET.
 *
 * A marker is stamped only when the push reached at least one device: if no
 * device is registered yet, the push waits for the next day instead of being
 * silently "spent".
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("subscriptions")
    .select("business_id, status, trial_ends_at, trial_reminder_sent_at, trial_ended_notified_at")
    .eq("status", "trial");
  if (error) return NextResponse.json({ error: "No pudimos leer las suscripciones." }, { status: 500 });

  const ids = (data ?? []).map((s) => s.business_id);
  const { data: businesses } = ids.length
    ? await admin.from("businesses").select("id, name").in("id", ids)
    : { data: [] as { id: string; name: string }[] };
  const names = new Map((businesses ?? []).map((b) => [b.id, b.name]));

  const candidates: PushCandidate[] = (data ?? []).map((s) => ({
    businessId: s.business_id,
    businessName: names.get(s.business_id) ?? "Un local",
    subscriptionStatus: s.status,
    trialEndsAt: s.trial_ends_at,
    trialReminderSentAt: s.trial_reminder_sent_at,
    trialEndedNotifiedAt: s.trial_ended_notified_at,
  }));

  const pushes = pushesToSend(candidates, businessTodayDateStr("America/Argentina/Buenos_Aires"));
  let sent = 0;

  for (const push of pushes) {
    const delivered = await sendAdminPush({
      title: push.title,
      body: push.body,
      url: `/admin/negocios/${push.businessId}`,
      tag: `trial-${push.kind}-${push.businessId}`,
    });
    if (delivered === 0) continue;
    sent += 1;
    await admin
      .from("subscriptions")
      .update(push.kind === "ended" ? { trial_ended_notified_at: new Date().toISOString() } : { trial_reminder_sent_at: new Date().toISOString() })
      .eq("business_id", push.businessId);
  }

  return NextResponse.json({ ok: true, due: pushes.length, sent });
}
