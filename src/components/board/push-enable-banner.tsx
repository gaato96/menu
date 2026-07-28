"use client";

import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";

import { enablePushNotifications, pushPermissionState } from "@/lib/push/client";

/**
 * Offered only after the board has shown real value (the first order landed
 * on THIS session) — asking for notification permission before that is the
 * fastest way to collect a permanent "denied" from someone who has no
 * context yet for why a food-order app wants to notify them.
 */
export function PushEnableBanner({ show }: { show: boolean }) {
  const [state, setState] = useState<NotificationPermission | "unsupported" | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (!show) return;
    void pushPermissionState().then(setState);
  }, [show]);

  if (!show || dismissed || state !== "default") return null;

  return (
    <div className="flex items-center gap-3 rounded-card border border-ink-200 bg-white px-4 py-3 shadow-sm">
      <Bell className="size-5 shrink-0 text-brand" aria-hidden />
      <div className="flex-1">
        <p className="text-sm font-semibold text-ink-900">Activar notificaciones</p>
        <p className="text-xs text-ink-500">
          Te avisamos de un pedido nuevo aunque tengas la app cerrada o la tablet bloqueada.
        </p>
      </div>

      <button
        type="button"
        disabled={enabling}
        onClick={async () => {
          setEnabling(true);
          const result = await enablePushNotifications();
          setEnabling(false);
          setState(result.ok ? "granted" : "denied");
          if (result.ok) setDismissed(true);
        }}
        className="min-h-touch shrink-0 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-fg disabled:opacity-60"
      >
        {enabling ? "Activando…" : "Activar"}
      </button>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Descartar"
        className="shrink-0 rounded-lg p-2 text-ink-400 hover:bg-ink-100"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
