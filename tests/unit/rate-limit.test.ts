import { beforeEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit, clientIp } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, { limit: 5, windowMs: 1000 }).ok).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key, { limit: 3, windowMs: 1000 });
    const result = checkRateLimit(key, { limit: 3, windowMs: 1000 });
    expect(result.ok).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("does not let one key's requests count against another", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    checkRateLimit(keyA, { limit: 1, windowMs: 1000 });
    expect(checkRateLimit(keyB, { limit: 1, windowMs: 1000 }).ok).toBe(true);
  });

  it("frees up once the window passes", async () => {
    const key = `window-${Math.random()}`;
    checkRateLimit(key, { limit: 1, windowMs: 50 });
    expect(checkRateLimit(key, { limit: 1, windowMs: 50 }).ok).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(checkRateLimit(key, { limit: 1, windowMs: 50 }).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("reads the first hop from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.4, 10.0.0.1" });
    expect(clientIp(headers)).toBe("203.0.113.4");
  });

  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
