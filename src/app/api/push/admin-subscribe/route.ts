import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

/**
 * Registers a superadmin device for follow-up pushes (trial ending/ended).
 * Session client: the admin_push_subscriptions policy only lets a superadmin
 * write their own row, so RLS is the check, same as the staff route.
 */
const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Suscripción inválida." }, { status: 400 });

  const { error } = await supabase.from("admin_push_subscriptions").upsert(
    {
      profile_id: userData.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      user_agent: request.headers.get("user-agent"),
    },
    { onConflict: "endpoint" },
  );
  if (error) {
    // RLS rejection (not a superadmin) lands here too.
    return NextResponse.json({ error: "No pudimos guardar este dispositivo." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
