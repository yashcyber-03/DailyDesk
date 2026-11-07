export interface WindowRule {
  windowMs: number;
  max: number;
}

export interface RateLimiter {
  /** Records the request when allowed. Nothing is recorded when denied. */
  check(key: string, now?: number): { allowed: true } | { allowed: false; retryAfterSec: number };
}

/**
 * In-memory sliding-window limiter with several windows (for example per minute and per day).
 * On serverless hosting each instance keeps its own counters, so this is a best-effort guard,
 * not a global quota.
 */
export function createRateLimiter(rules: WindowRule[]): RateLimiter {
  const hits = new Map<string, number[]>();
  const longest = Math.max(...rules.map((r) => r.windowMs));
  let lastSweep = 0;

  return {
    check(key, now = Date.now()) {
      if (hits.size > 5000 && now - lastSweep > 60_000) {
        lastSweep = now;
        for (const [k, list] of hits) {
          if (list.length === 0 || list[list.length - 1] < now - longest) hits.delete(k);
        }
      }
      const list = (hits.get(key) ?? []).filter((t) => t > now - longest);
      let retryAfterMs = 0;
      for (const rule of rules) {
        const inWindow = list.filter((t) => t > now - rule.windowMs);
        if (inWindow.length >= rule.max) {
          const oldest = inWindow[inWindow.length - rule.max];
          retryAfterMs = Math.max(retryAfterMs, oldest + rule.windowMs - now);
        }
      }
      if (retryAfterMs > 0) {
        hits.set(key, list);
        return { allowed: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
      }
      list.push(now);
      hits.set(key, list);
      return { allowed: true };
    },
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
