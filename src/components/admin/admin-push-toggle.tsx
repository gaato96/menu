"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { enablePushNotifications, pushPermissionState } from "@/lib/push/client";

/**
 * "Avisame en este dispositivo": registers the superadmin's phone or laptop
 * for the daily trial follow-up pushes. One tap per device; the browser
 * remembers the permission.
 */
export function AdminPushToggle({ registeredDevices }: { registeredDevices: number }) {
  const [state, setState] = useState<NotificationPermission | "unsupported" | "loading">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void pushPermissionState().then(setState);
  }, []);

  if (state === "loading") return null;
  if (state === "unsupported") {
    return <p className="text-xs text-ink-500">Este navegador no recibe avisos. Probá desde Chrome o instalando la app.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant={state === "granted" ? "outline" : "primary"}
        disabled={pending || state === "denied"}
        onClick={() =>
          startTransition(async () => {
            const result = await enablePushNotifications("/api/push/admin-subscribe");
            if (result.ok) {
              setState("granted");
              setMessage("Listo: este dispositivo recibe los avisos de seguimiento.");
            } else {
              setMessage(
                result.reason === "denied"
                  ? "El navegador bloqueó los avisos. Habilitalos en la configuración del sitio."
                  : "No pudimos registrar este dispositivo. Probá de nuevo.",
              );
              if (result.reason === "denied") setState("denied");
            }
          })
        }
      >
        {state === "denied" ? (
          <BellOff className="size-4" aria-hidden />
        ) : state === "granted" ? (
          <BellRing className="size-4" aria-hidden />
        ) : (
          <Bell className="size-4" aria-hidden />
        )}
        {state === "granted" ? "Volver a registrar este dispositivo" : "Avisame en este dispositivo"}
      </Button>
      <span className="text-xs text-ink-500">
        {registeredDevices === 0
          ? "Ningún dispositivo recibe avisos todavía."
          : `${registeredDevices} dispositivo${registeredDevices === 1 ? "" : "s"} con avisos.`}
      </span>
      {message && <p className="w-full text-xs text-ink-700">{message}</p>}
    </div>
  );
}
