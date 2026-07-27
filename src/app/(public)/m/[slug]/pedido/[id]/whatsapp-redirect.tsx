"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

/**
 * Sends the customer to WhatsApp — automatically, with a manual fallback
 * button, because mobile browsers don't reliably allow a programmatic
 * cross-app navigation that isn't tied to a fresh tap. The order already
 * exists on the board either way; this is only about getting the message
 * into the shop's hands.
 */
export function WhatsAppRedirect({ orderId, waUrl }: { orderId: string; waUrl: string }) {
  const markedOpened = useRef(false);

  function markOpened() {
    if (markedOpened.current) return;
    markedOpened.current = true;
    fetch(`/api/orders/${orderId}/opened`, { method: "POST" }).catch(() => {
      // Best-effort: this only clears a "sin confirmar" badge on the board.
    });
  }

  useEffect(() => {
    // A short delay so the ticket actually renders before the tab redirects —
    // an instant jump reads as a broken page, not a confirmed order.
    const timer = window.setTimeout(() => {
      markOpened();
      window.location.assign(waUrl);
    }, 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires once per mount
  }, [waUrl]);

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        block
        onClick={() => {
          markOpened();
          window.location.assign(waUrl);
        }}
        className="bg-[#25D366] text-white hover:brightness-95 active:brightness-90"
      >
        <MessageCircle className="size-5" aria-hidden />
        Enviar por WhatsApp
      </Button>
      <p className="text-center text-xs text-ink-500">
        Te vamos a redirigir automáticamente. Si no pasa nada, tocá el botón.
      </p>
    </div>
  );
}
