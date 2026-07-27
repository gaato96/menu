import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Marks that the customer actually reached WhatsApp with the order message.
 *
 * The order already exists on the board regardless — this only clears the
 * "sin confirmar por el cliente" badge (Fase 2). No auth: the confirmation
 * page that calls this is itself only reachable by knowing the order's UUID.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from("orders")
    .update({ whatsapp_opened_at: new Date().toISOString() })
    .eq("id", id)
    .is("whatsapp_opened_at", null);

  if (error) {
    return NextResponse.json({ error: "No pudimos actualizar el pedido." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
