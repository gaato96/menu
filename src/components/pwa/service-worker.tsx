"use client";

import { useEffect, useState } from "react";

const IDLE_RELOAD_MS = 60 * 60 * 1000;

/**
 * Registers the service worker and handles updates.
 *
 * The reason this is more than three lines: a counter tablet can stay on the
 * same tab for weeks. Without an explicit update path you end up debugging bugs
 * that were fixed a month ago but never reached the device.
 */
export function ServiceWorkerRegistrar() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;
    let hiddenSince: number | null = null;

    const onUpdateFound = () => {
      const installing = registration?.installing;
      if (!installing) return;

      installing.addEventListener("statechange", () => {
        // A worker that reaches "installed" while another one controls the page
        // is a genuinely new build, not the first install.
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          setUpdateReady(true);
        }
      });
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        registration = reg;
        reg.addEventListener("updatefound", onUpdateFound);
      })
      .catch(() => {
        // Offline on first load, or an unsupported browser. The app still works.
      });

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenSince = Date.now();
        return;
      }

      // Coming back after a long idle: pull a fresh worker, and if the app has
      // been asleep for over an hour reload outright rather than trusting a
      // screen nobody has looked at since yesterday's shift.
      void registration?.update();

      if (hiddenSince && Date.now() - hiddenSince > IDLE_RELOAD_MS) {
        window.location.reload();
      }
      hiddenSince = null;
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      registration?.removeEventListener("updatefound", onUpdateFound);
    };
  }, []);

  if (!updateReady) return null;

  return (
    <div className="shadow-ticket fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 bg-ink-900 px-4 py-3 text-ink-50">
      <p className="text-sm">Hay una versión nueva de la app.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="min-h-touch rounded-lg bg-brand px-4 font-semibold text-brand-fg"
      >
        Actualizar
      </button>
    </div>
  );
}
