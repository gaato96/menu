"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * New-order sound alert, synthesized with Web Audio rather than an audio
 * file — no binary asset to ship, no license question, and the two-tone
 * chime is trivial to generate on demand.
 *
 * Browsers block audio until a real user gesture creates or resumes the
 * AudioContext. `unlock()` is that gesture handler; nothing plays before
 * it's called at least once.
 */
export function useAudioAlert() {
  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [alerting, setAlerting] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playChime = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || muted) return;

    const now = ctx.currentTime;
    const notes: [freq: number, start: number, duration: number][] = [
      [880, 0, 0.16],
      [660, 0.18, 0.22],
    ];

    for (const [freq, start, duration] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      // Quick attack, exponential decay — a bell, not a siren, but still
      // meant to cut through a busy kitchen.
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.5, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    }
  }, [muted]);

  const unlock = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    setUnlocked(ctxRef.current.state === "running");
  }, []);

  const stopAlert = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAlerting(false);
  }, []);

  const startAlert = useCallback(() => {
    if (timerRef.current) return; // already looping
    setAlerting(true);
    playChime();
    timerRef.current = setInterval(playChime, 1400);
  }, [playChime]);

  useEffect(() => stopAlert, [stopAlert]);

  return {
    unlocked,
    muted,
    alerting,
    unlock,
    toggleMuted: () => setMuted((m) => !m),
    startAlert,
    stopAlert,
  };
}
