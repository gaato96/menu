"use client";

import type { AnchorHTMLAttributes } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Every WhatsApp CTA on the marketing site goes through this component
 * instead of a plain <a>, so the GA4 conversion event fires the same way
 * everywhere. `location` identifies which CTA was clicked (header, hero,
 * closing section) — that's what turns "clicks" into "which part of the
 * page actually convinces someone."
 */
export function WhatsAppLink({
  location,
  children,
  ...anchorProps
}: { location: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...anchorProps}
      onClick={(event) => {
        window.gtag?.("event", "whatsapp_click", { cta_location: location });
        anchorProps.onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
