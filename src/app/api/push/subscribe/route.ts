import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

/**
 * Registers this device for Web Push. Runs as the signed-in staff member
 * (session client, not admin), so RLS on profiles/business_modules etc. still
 * applies to everything else this request touches — only the actual insert
 * goes through the SECURITY DEFINER upsert_push_subscription RPC, which
 * trusts business_id/profile_id resolved HERE from the session, never from
 * the request body.
 */

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile?.business_id) {
    return NextResponse.json({ error: "Sin negocio asignado." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Suscripción inválida." }, { status: 400 });
  }

  const { error } = await supabase.rpc("upsert_push_subscription", {
    p_business_id: profile.business_id,
    p_profile_id: userData.user.id,
    p_endpoint: parsed.data.endpoint,
    p_p256dh: parsed.data.keys.p256dh,
    p_auth: parsed.data.keys.auth,
    p_user_agent: request.headers.get("user-agent"),
  });

  if (error) {
    console.error("POST /api/push/subscribe", error);
    return NextResponse.json({ error: "No pudimos guardar la suscripción." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { endpoint } = (await request.json().catch(() => ({}))) as { endpoint?: string };
  if (!endpoint) return NextResponse.json({ error: "Falta endpoint." }, { status: 400 });

  // RLS (push_subscriptions_staff_all) already scopes this to the caller's own
  // business + profile_id, so a plain delete is safe without another RPC.
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}
