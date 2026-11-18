import { NextResponse } from "next/server";

import { syncPayment } from "@/lib/payments/mercadopago";

/**
 * Mercado Pago notifications, one URL per local (?b=<business uuid>, set as
 * notification_url on each preference).
 *
 * Not signature-checked, on purpose: the body is never believed. It only says
 * "go look at payment N"; syncPayment then fetches N from Mercado Pago with
 * THIS local's token and checks it points at one of this local's orders. A
 * forged call can at most make us re-read a real payment.
 *
 * Always answers 200 quickly — Mercado Pago retries on anything else, and a
 * notification about something we do not track is not an error.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("b") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(businessId)) return NextResponse.json({ ok: true });

  const body = (await request.json().catch(() => null)) as
    | { type?: string; topic?: string; data?: { id?: string | number } }
    | null;

  const kind = body?.type ?? body?.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const paymentId = String(body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");

  if (kind === "payment" && paymentId) {
    try {
      await syncPayment(businessId, paymentId);
    } catch (error) {
      console.error("[mercadopago webhook]", error);
    }
  }
  return NextResponse.json({ ok: true });
}
