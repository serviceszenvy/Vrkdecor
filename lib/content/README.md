# lib/content

Requirements-derived page content (P4).

Every value here is transcribed from `01_REQUIREMENTS` — the approved Website
Requirements & SOW — and nothing may be added, embellished or rounded without a
corresponding requirements change.

- `business.ts` — positioning, credentials (14+ years, 600+ events, 35+ team),
  coverage, how-it-works steps and the "why choose us" points. The
  how-it-works steps restate the approved customer journey; the why-choose
  points restate approved facts. No claim about quality, price, ranking or
  guarantees is made anywhere.
- `catalog.ts` — the approved occasions, services (with partner-vendor markings)
  and styles. These match the seed migration exactly; a unit test fails if they
  drift apart.

Pages prefer database rows when Supabase is configured, so VRK Decor's own
edits in the Admin Panel (P8) win. This module is the fallback that keeps the
site rendering before the database is connected.
