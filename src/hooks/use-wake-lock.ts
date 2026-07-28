"use client";

import { useEffect } from "react";

/**
 * Keeps the counter tablet's screen awake while the board is open.
 * Re-requested on every visibility change: the OS releases the lock whenever
 * the tab goes to background, and the browser does not re-grant it
 * automatically when the tab comes back.
 */
export function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        // Battery saver, no display, or the tab isn't focused yet — normal,
        // not worth surfacing to the cashier.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !cancelled) void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release();
    };
  }, []);
}
