/**
 * In-memory sliding-window limiter. Deliberately not distributed: Vercel
 * functions don't share memory across instances, so this only throttles
 * bursts hitting the *same* warm instance — not a real defense against a
 * distributed attacker. It exists to catch the actual failure mode this
 * product sees (a customer double-tapping "Confirmar pedido", a client bug
 * retrying in a loop), which idempotencyKey already dedupes anyway — this is
 * the layer in front of that. A real multi-instance limit needs Upstash
 * Redis or similar; not worth the external dependency at this scale yet.
 */

const buckets = new Map<string, number[]>();

// Unbounded growth guard: an attacker cycling fake IPs would otherwise grow
// this map forever until the instance recycles.
const MAX_TRACKED_KEYS = 5000;

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let hits = buckets.get(key);
  if (hits) {
    hits = hits.filter((ts) => ts > windowStart);
  }

  if (hits && hits.length >= limit) {
    return { ok: false, retryAfterMs: hits[0] + windowMs - now };
  }

  if (!hits) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    hits = [];
  }
  hits.push(now);
  buckets.set(key, hits);

  return { ok: true };
}

/** Vercel/most proxies set this; falls back to a shared bucket if absent (local dev). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
