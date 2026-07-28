import "server-only";

import webpush from "web-push";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Web Push send path. Fired on order creation, fire-and-forget from the
 * caller — a slow or failed push must never delay or fail the order itself.
 *
 * This is the redundant channel: it reaches a device even if the tablet's
 * browser tab is closed or the screen is locked, which the in-app Realtime
 * alert (Fase 2, board.tsx) cannot do.
 */

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error("Faltan las variables VAPID en el entorno.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface NewOrderPushPayload {
  title: string;
  body: string;
  orderId: string;
  code: string;
}

/**
 * Sends to every device registered for the business. Endpoints the push
 * service reports as gone (410) or not found (404) — an uninstalled PWA, a
 * cleared browser — are deleted so the subscription list doesn't grow stale.
 */
export async function sendNewOrderPush(businessId: string, payload: NewOrderPushPayload) {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    // Web Push is optional infrastructure — a business can run the board with
    // sound + Realtime alone. Missing keys should not break checkout.
    return;
  }

  try {
    ensureConfigured();
  } catch (error) {
    console.error("sendNewOrderPush: VAPID no configurado", error);
    return;
  }

  const admin = createAdminClient();
  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("business_id", businessId);

  if (!subscriptions || subscriptions.length === 0) return;

  const body = JSON.stringify(payload);
  const deadIds: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          deadIds.push(sub.id);
        } else {
          console.error("sendNewOrderPush: fallo de envío", statusCode, error);
        }
      }
    }),
  );

  if (deadIds.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", deadIds);
  }
}
