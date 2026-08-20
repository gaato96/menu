import { NextResponse } from "next/server";

import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TableCallKind } from "@/types/database";

const KINDS = new Set<TableCallKind>(["bill", "waiter"]);

/**
 * "La cuenta, por favor" and "necesito al mozo", from the diner's own phone.
 *
 * Admin client, like order creation and for the same reason: the caller is
 * anonymous, so the server is the only place that can check that this table
 * exists, is active, belongs to this business, and that the business has the
 * tables module on. RLS cannot express "an anonymous stranger may write this
 * row but only after those four checks", so there is no anon policy at all
 * and this route is the single door.
 */
export async function POST(request: Request) {
  // Looser than orders: asking twice because nobody came is a legitimate
  // thing for a customer to do. The real duplicate guard is the partial
  // unique index, not this.
  const { ok, retryAfterMs } = checkRateLimit(`table-calls:${clientIp(request.headers)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!ok) {
    return NextResponse.json(
      { error: "Esperá un momento antes de volver a llamar." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((retryAfterMs ?? 60_000) / 1000)) } },
    );
  }

  let body: { slug?: unknown; tableId?: unknown; kind?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  const tableId = typeof body.tableId === "string" ? body.tableId : "";
  const kind = body.kind as TableCallKind;
  if (!slug || !tableId || !KINDS.has(kind)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("id, status")
    .eq("slug", slug)
    .maybeSingle();
  if (!business || business.status !== "active") {
    return NextResponse.json({ error: "No encontramos ese local." }, { status: 404 });
  }

  // The module gate is re-checked here rather than trusted from the page: the
  // browser could have been sitting on a menu opened before the owner turned
  // tables off.
  const { data: moduleRow } = await admin
    .from("business_modules")
    .select("enabled")
    .eq("business_id", business.id)
    .eq("module_key", "tables")
    .maybeSingle();
  if (!moduleRow?.enabled) {
    return NextResponse.json({ error: "Este local no tiene mesas habilitadas." }, { status: 404 });
  }

  const { data: table } = await admin
    .from("restaurant_tables")
    .select("id, is_active")
    .eq("id", tableId)
    .eq("business_id", business.id)
    .maybeSingle();
  if (!table || !table.is_active) {
    return NextResponse.json({ error: "Esa mesa ya no está disponible." }, { status: 404 });
  }

  const { error } = await admin
    .from("table_calls")
    .insert({ business_id: business.id, table_id: table.id, kind });

  if (error) {
    // 23505 = the partial unique index on (table_id, kind) where pending. The
    // customer tapped again because nobody has come yet; telling them "error"
    // would be a lie — the call IS open. Success, quietly.
    if (error.code === "23505") return NextResponse.json({ ok: true, alreadyOpen: true });
    console.error("[table-calls] insert failed", error);
    return NextResponse.json({ error: "No pudimos avisar. Probá de nuevo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
