import { NextResponse } from "next/server";
import { z } from "zod";

import { createOrder } from "@/lib/orders/create-order";
import { orderRequestSchema } from "@/lib/orders/schema";

const REASON_MESSAGES: Record<string, string> = {
  not_found: "No encontramos ese local.",
  suspended: "Este local no está recibiendo pedidos en este momento.",
  closed: "El local está cerrado ahora mismo.",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const result = await createOrder(parsed.data.businessSlug, parsed.data);

    if (!result.ok) {
      if (result.reason === "pricing") {
        return NextResponse.json(
          { error: "El carrito cambió.", errors: result.errors },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: REASON_MESSAGES[result.reason] ?? "No pudimos crear el pedido." },
        { status: result.reason === "not_found" ? 404 : 422 },
      );
    }

    return NextResponse.json({ orderId: result.orderId, code: result.code, waUrl: result.waUrl });
  } catch (error) {
    console.error("POST /api/orders", error);
    return NextResponse.json({ error: "No pudimos crear el pedido. Probá de nuevo." }, { status: 500 });
  }
}
