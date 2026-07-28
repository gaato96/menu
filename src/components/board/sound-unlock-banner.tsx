"use client";

import { Volume2, VolumeX } from "lucide-react";

/**
 * Persistent until the operator taps it — browsers block audio playback
 * without a real user gesture, so a silent tablet needs an obvious, blocking
 * reason why, not a toast that scrolls away.
 */
export function SoundUnlockBanner({
  unlocked,
  muted,
  onUnlock,
  onToggleMuted,
}: {
  unlocked: boolean;
  muted: boolean;
  onUnlock: () => void;
  onToggleMuted: () => void;
}) {
  if (!unlocked) {
    return (
      <button
        type="button"
        onClick={onUnlock}
        className="flex min-h-touch w-full items-center justify-center gap-2 bg-danger px-4 text-sm font-semibold text-white"
      >
        <VolumeX className="size-4" aria-hidden />
        El sonido está desactivado — tocá acá para activarlo
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggleMuted}
      className="flex min-h-9 items-center gap-1.5 self-end rounded-lg px-2 text-xs text-ink-500 hover:bg-ink-100"
    >
      {muted ? (
        <>
          <VolumeX className="size-4" aria-hidden /> Silenciado
        </>
      ) : (
        <>
          <Volume2 className="size-4" aria-hidden /> Sonido activo
        </>
      )}
    </button>
  );
}
