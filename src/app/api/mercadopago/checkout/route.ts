import { NextResponse } from "next/server";

import { checkoutUrlForOrder } from "@/lib/payments/mercadopago";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * GET /api/mercadopago/checkout?order=<uuid>&slug=<slug>
 *
 * The "Pagar con Mercado Pago" button on the order page. Creates (or reuses)
 * the local's checkout and redirects there. A plain link rather than a fetch,
 * so it works the same from an in-app browser that blocks scripted
 * navigation. Knowing the order UUID is the same bar as viewing the order.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order") ?? "";
  const slug = url.searchParams.get("slug") ?? "";
  const back = new URL(`/m/${encodeURIComponent(slug)}/pedido/${encodeURIComponent(orderId)}`, url.origin);

  const { ok } = checkRateLimit(`mp-checkout:${clientIp(request.headers)}`, { limit: 10, windowMs: 60_000 });
  if (!ok || !/^[0-9a-f-]{36}$/i.test(orderId) || !slug) {
    back.searchParams.set("mp", "error");
    return NextResponse.redirect(back, 303);
  }

  const checkout = await checkoutUrlForOrder(orderId, slug);
  if (!checkout) {
    back.searchParams.set("mp", "error");
    return NextResponse.redirect(back, 303);
  }
  return NextResponse.redirect(checkout, 303);
}
