"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export function CatalogShare({ businessName }: { businessName: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: businessName, url });
        return;
      } catch {
        // User cancelled the native sheet — nothing to do.
        return;
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Compartir"
      className="flex size-touch items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
    >
      {copied ? <span className="text-xs font-medium">Copiado</span> : <Share2 className="size-5" aria-hidden />}
    </button>
  );
}
