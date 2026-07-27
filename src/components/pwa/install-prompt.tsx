"use client";

import { Share, SquarePlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS predates the display-mode media query for installed web apps.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export interface InstallPromptProps {
  /** Shown in the banner: "Instalá el menú de Pizzería Don José". */
  label: string;
  /** Distinct key per surface so dismissing the menu banner does not hide the panel one. */
  storageKey: string;
  className?: string;
}

/**
 * Install affordance for both platforms.
 *
 * Android/Chrome fires `beforeinstallprompt`, which we capture and replay from
 * our own button. iOS fires nothing at all and offers no API: the only route is
 * Share -> Add to Home Screen, so there it shows instructions instead. That
 * asymmetry is why this component exists rather than a single button.
 */
export function InstallPrompt({ label, storageKey, className }: InstallPromptProps) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (window.localStorage.getItem(storageKey) === "dismissed") return;

    if (isIos()) {
      // iOS never fires beforeinstallprompt, so there is no event to key off
      // of — this IS the whole decision. A lazy useState initializer would
      // read the same navigator/localStorage checks without the extra
      // render, but it would also run during SSR, where neither exists, and
      // crash the render. The effect exists specifically to defer this to
      // the client.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [storageKey]);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(storageKey, "dismissed");
    setVisible(false);
    setShowIosHelp(false);
  }, [storageKey]);

  const install = useCallback(async () => {
    if (!deferred) {
      setShowIosHelp(true);
      return;
    }

    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "accepted") setVisible(false);
  }, [deferred]);

  if (!visible) return null;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 rounded-card border border-ink-200 bg-white px-4 py-3 shadow-sm",
          className,
        )}
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-900">{label}</p>
          <p className="text-xs text-ink-500">Se instala como app, sin pasar por la tienda.</p>
        </div>

        <button
          type="button"
          onClick={install}
          className="min-h-touch shrink-0 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-fg"
        >
          Instalar
        </button>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Descartar"
          className="min-h-touch shrink-0 rounded-lg px-2 text-ink-500 hover:bg-ink-100"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {showIosHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-4 sm:items-center"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-card bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="ios-install-title" className="text-base font-semibold text-ink-900">
              Instalar en iPhone o iPad
            </h2>
            <ol className="mt-4 space-y-3 text-sm text-ink-700">
              <li className="flex items-center gap-3">
                <Share className="size-5 shrink-0 text-brand" aria-hidden />
                <span>
                  Tocá <strong>Compartir</strong> en la barra de Safari.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <SquarePlus className="size-5 shrink-0 text-brand" aria-hidden />
                <span>
                  Elegí <strong>Agregar a inicio</strong>.
                </span>
              </li>
            </ol>
            <p className="mt-4 text-xs text-ink-500">
              En iPhone las notificaciones solo llegan si la app está agregada a inicio.
            </p>
            <button
              type="button"
              onClick={() => setShowIosHelp(false)}
              className="mt-5 min-h-touch w-full rounded-lg bg-ink-900 font-semibold text-ink-50"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
