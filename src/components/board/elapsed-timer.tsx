"use client";

import { useEffect, useState } from "react";

function formatElapsed(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}min`;
}

/**
 * Self-updating "time in this status" clock. Every card mounts one of these;
 * a 15s tick is coarse enough that a board full of comandas doesn't burn
 * cycles for a number nobody reads to the second.
 */
export function ElapsedTimer({ since, className }: { since: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(interval);
  }, []);

  const elapsedMs = Math.max(0, now - new Date(since).getTime());
  const isStale = elapsedMs > 20 * 60_000; // 20 min unattended — flag it red

  return (
    <span className={className} data-stale={isStale || undefined}>
      {formatElapsed(elapsedMs)}
    </span>
  );
}
