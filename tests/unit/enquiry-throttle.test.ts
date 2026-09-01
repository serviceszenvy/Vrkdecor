import { beforeEach, describe, expect, it } from 'vitest';
import { resetRateLimits } from '@/lib/rate-limit';
import {
  CLIENT_POLICY,
  PHONE_POLICY,
  checkQuoteThrottle,
  clientKeyFromHeaders,
  requestFingerprint,
} from '@/features/enquiries/throttle';

/**
 * Rate limiting and duplicate submission.
 *
 * CLAUDE.md lists rate limiting as non-negotiable, and the Technical
 * Development Specification section 23 lists "duplicate quote submission" as an
 * edge case that must be handled rather than allowed to create two leads.
 */

const BASE = Date.UTC(2026, 8, 1, 10, 0, 0);

function keys(overrides: Partial<Parameters<typeof checkQuoteThrottle>[0]> = {}) {
  return {
    clientKey: 'client-a',
    phone: '+919994072435',
    fingerprint: requestFingerprint({
      phone: '+919994072435',
      designId: 'design-1',
      eventDate: '2026-12-14',
      eventType: 'wedding',
    }),
    ...overrides,
  };
}

beforeEach(resetRateLimits);

describe('an ordinary enquiry', () => {
  it('is allowed', () => {
    expect(checkQuoteThrottle(keys(), BASE)).toEqual({ outcome: 'allow' });
  });
});

describe('duplicate submission', () => {
  it('recognises the identical request sent twice', () => {
    expect(checkQuoteThrottle(keys(), BASE).outcome).toBe('allow');
    expect(checkQuoteThrottle(keys(), BASE + 1_000).outcome).toBe('duplicate');
  });

  it('lets the same customer send a genuinely different request', () => {
    expect(checkQuoteThrottle(keys(), BASE).outcome).toBe('allow');

    const otherDate = keys({
      fingerprint: requestFingerprint({
        phone: '+919994072435',
        designId: 'design-1',
        eventDate: '2027-01-20',
        eventType: 'wedding',
      }),
    });

    expect(checkQuoteThrottle(otherDate, BASE + 1_000).outcome).toBe('allow');
  });

  it('distinguishes the same details asked about a different design', () => {
    const first = requestFingerprint({
      phone: '+919994072435',
      designId: 'design-1',
      eventDate: '2026-12-14',
      eventType: 'wedding',
    });
    const second = requestFingerprint({
      phone: '+919994072435',
      designId: 'design-2',
      eventDate: '2026-12-14',
      eventType: 'wedding',
    });

    expect(first).not.toBe(second);
  });

  it('stops treating a request as duplicate once the window passes', () => {
    expect(checkQuoteThrottle(keys(), BASE).outcome).toBe('allow');
    expect(checkQuoteThrottle(keys(), BASE + 11 * 60 * 1000).outcome).toBe('allow');
  });
});

describe('per-client limit', () => {
  it('throttles a client that submits too many different requests', () => {
    for (let index = 0; index < CLIENT_POLICY.limit; index += 1) {
      const decision = checkQuoteThrottle(
        keys({ fingerprint: `fingerprint-${index}`, phone: `+9199900000${index}0` }),
        BASE,
      );
      expect(decision.outcome, `submission ${index}`).toBe('allow');
    }

    const blocked = checkQuoteThrottle(
      keys({ fingerprint: 'fingerprint-last', phone: '+919990000099' }),
      BASE,
    );

    expect(blocked.outcome).toBe('rate_limited');
    if (blocked.outcome !== 'rate_limited') return;
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('does not penalise a different client', () => {
    for (let index = 0; index <= CLIENT_POLICY.limit; index += 1) {
      checkQuoteThrottle(
        keys({ fingerprint: `f-${index}`, phone: `+9199911111${index}0` }),
        BASE,
      );
    }

    const other = checkQuoteThrottle(
      keys({ clientKey: 'client-b', fingerprint: 'f-other', phone: '+919992222220' }),
      BASE,
    );

    expect(other.outcome).toBe('allow');
  });
});

describe('per-phone limit', () => {
  it('throttles one number used from several clients', () => {
    for (let index = 0; index < PHONE_POLICY.limit; index += 1) {
      const decision = checkQuoteThrottle(
        keys({ clientKey: `client-${index}`, fingerprint: `fingerprint-${index}` }),
        BASE,
      );
      expect(decision.outcome, `submission ${index}`).toBe('allow');
    }

    const blocked = checkQuoteThrottle(
      keys({ clientKey: 'client-last', fingerprint: 'fingerprint-last' }),
      BASE,
    );

    expect(blocked.outcome).toBe('rate_limited');
  });
});

describe('interaction between the limits', () => {
  it('does not burn the duplicate window on a request it rejected for rate limiting', () => {
    // Exhaust the phone limit with other requests.
    for (let index = 0; index < PHONE_POLICY.limit; index += 1) {
      checkQuoteThrottle(
        keys({ clientKey: `client-${index}`, fingerprint: `fingerprint-${index}` }),
        BASE,
      );
    }

    const rejected = checkQuoteThrottle(keys(), BASE);
    expect(rejected.outcome).toBe('rate_limited');

    // The customer waits and tries the same request again. It must be treated
    // as a first attempt, not as a duplicate of the one that never went through.
    const retry = checkQuoteThrottle(keys(), BASE + 11 * 60 * 1000);
    expect(retry.outcome).toBe('allow');
  });
});

describe('client identification', () => {
  it('derives a stable key from the forwarded address', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' });
    expect(clientKeyFromHeaders(headers)).toBe(
      clientKeyFromHeaders(new Headers({ 'x-forwarded-for': '203.0.113.9' })),
    );
  });

  it('never stores the address itself', () => {
    const key = clientKeyFromHeaders(new Headers({ 'x-forwarded-for': '203.0.113.9' }));
    expect(key).not.toContain('203.0.113.9');
    expect(key).toMatch(/^[0-9a-f]{32}$/);
  });

  it('falls back to a shared key when no address header is present', () => {
    expect(clientKeyFromHeaders(new Headers())).toBe(
      clientKeyFromHeaders(new Headers()),
    );
  });
});
