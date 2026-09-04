/**
 * In-process fixed-window rate limiter.
 *
 * CLAUDE.md lists rate limiting as a non-negotiable security control, and the
 * quote form is the first anonymous write surface in the application, so it
 * ships with one rather than waiting for P10.
 *
 * SCOPE AND LIMITS — read before relying on this:
 *   - state lives in this Node process, so a multi-instance deployment limits
 *     per instance and a restart clears the counters
 *   - it is a throttle against casual abuse and accidental double submission,
 *     not a defence against a distributed flood
 *
 * P10 (`05_PROMPTS/10-SECURITY.md`) replaces the store with a shared, durable
 * one and adds limits to the remaining surfaces. The call sites do not change:
 * only `consumeRateLimit` needs a new backend.
 */

export type RateLimitPolicy = {
  /** Maximum number of allowed hits inside the window. */
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window expires. */
  retryAfterSeconds: number;
};

type Window = { count: number; expiresAt: number };

const windows = new Map<string, Window>();

/** Bounds memory if a flood produces many distinct keys. */
const MAX_TRACKED_KEYS = 10_000;

function prune(now: number) {
  for (const [key, window] of windows) {
    if (window.expiresAt <= now) windows.delete(key);
  }
}

/**
 * Records one hit against `key` and reports whether it is allowed.
 *
 * Counting happens even when the call is rejected, so a caller that keeps
 * retrying keeps extending nothing — the window still expires on schedule, but
 * the attempt is never cheaper than the first.
 */
export function consumeRateLimit(
  key: string,
  policy: RateLimitPolicy,
  now: number = Date.now(),
): RateLimitResult {
  if (windows.size > MAX_TRACKED_KEYS) prune(now);

  const existing = windows.get(key);

  if (!existing || existing.expiresAt <= now) {
    windows.set(key, { count: 1, expiresAt: now + policy.windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, policy.limit - 1),
      retryAfterSeconds: Math.ceil(policy.windowMs / 1000),
    };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));

  return {
    allowed: existing.count <= policy.limit,
    remaining: Math.max(0, policy.limit - existing.count),
    retryAfterSeconds,
  };
}

/** Reports the state of a key without recording a hit. */
export function peekRateLimit(
  key: string,
  policy: RateLimitPolicy,
  now: number = Date.now(),
): RateLimitResult {
  const existing = windows.get(key);
  if (!existing || existing.expiresAt <= now) {
    return {
      allowed: true,
      remaining: policy.limit,
      retryAfterSeconds: 0,
    };
  }
  return {
    allowed: existing.count < policy.limit,
    remaining: Math.max(0, policy.limit - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000)),
  };
}

/** Test-only helper. Never call this from application code. */
export function resetRateLimits() {
  windows.clear();
}
