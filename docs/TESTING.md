# Testing

## Layers

| Layer                                | Tool                | Location        | Status                                  |
| ------------------------------------ | ------------------- | --------------- | --------------------------------------- |
| Unit and integration                 | Vitest              | `tests/unit/`   | Active from P1                          |
| End-to-end                           | Playwright          | `tests/e2e/`    | Smoke tests from P1; expanded per phase |
| Authorization / RLS / storage policy | Vitest + Playwright | added in P3, P8 | Pending                                 |
| Upload security                      | Playwright          | added in P7     | Pending                                 |
| XSS / CSRF / rate limiting           | Playwright          | added in P10    | Pending                                 |
| SEO and analytics                    | Playwright          | added in P9     | Pending                                 |
| Accessibility and performance        | Playwright          | added in P11    | Pending                                 |

## Commands

```bash
npm test           # Vitest, single run
npm run test:watch # Vitest, watch mode
npm run test:db    # RLS, storage policies and schema (needs TEST_DATABASE_URL)
npm run test:e2e   # Playwright
npm run verify:bundle # server-only secrets absent from the client bundle
npm run verify     # format check + lint + typecheck + unit tests + build
```

## Rules

- Never run tests against production customer data
  (Technical Development Specification section 4).
- Every phase adds tests for the behaviour it introduces; a phase is not
  complete while its own tests fail.
- Security behaviour is tested explicitly and negatively: anonymous and
  unauthorised access must be proven to fail, not merely assumed to.
- Vitest only collects `tests/unit/**`; Playwright specs are excluded so the two
  runners never collide.

## Current coverage

### P4 — public website

- Approved figures (14+, 600+, 35+) and the positioning statement are asserted
  verbatim, so a copy edit cannot inflate a claim.
- The content module and the seed migration are compared, so the catalogue is
  identical whether or not the database is reachable.
- Page copy is scanned for superlatives and guarantees, in unit tests and again
  in the rendered pages.
- Every approved route returns 200 with exactly one `h1`.
- Titles and descriptions are unique per page; canonical URL and Open Graph tags
  are present; public pages are indexable and `/design-system` is not.
- Every primary-navigation and footer link resolves (except `/quote`, owned by
  P6).
- No page scrolls horizontally at 390px, and the sticky action bar is present on
  every public page.
- Partner-vendor services are shown as such; contact details match the approved
  business profile; legal pages carry a visible draft notice.

### P3 — database, auth and storage

Run against a real PostgreSQL instance with the actual migrations applied; see
[DATABASE.md](./DATABASE.md).

- Anonymous visitors: can read published designs, cannot see drafts or their
  media even by exact id, are refused enquiries, reference images and admin
  data, cannot create an enquiry or mutate content, cannot create objects in
  the `public` schema.
- Signed-in non-admins: see exactly what anonymous visitors see, and cannot
  escalate by inserting themselves into `admin_users`.
- Disabled admins: lose access immediately.
- Active admins: can read drafts, enquiries and private reference images,
  publish designs, manage media and move the enquiry pipeline — but still
  cannot grant admin rights from a client connection.
- Storage: portfolio objects public, reference objects unreadable by anonymous
  and non-admin users even with the exact key, no client role can write to the
  private bucket, buckets reject non-image types.
- Schema contract: cover uniqueness, the three-reference-image limit, required
  consent, pricing-mode consistency, slug and storage-key uniqueness, cascade
  and restrict deletion behaviour, approved seed data.
- Drift guards: `lib/db/types.ts` is compared against the live schema, and
  `lib/storage` limits against the migrated buckets.
- Every table in `public` is asserted to have RLS enabled.

### P2 — design system and shell

- Palette anchors match the colours measured in the supplied logo.
- Every palette step and semantic role in `lib/design-tokens.ts` is mirrored in
  `app/globals.css`; drift fails the suite.
- All thirteen documented text/background pairings meet WCAG 2.1 AA.
- Button variants stay at or above the 44px minimum touch target.
- Navigation matches the approved site structure; `tel:`, WhatsApp and `mailto:`
  hrefs are built from the approved business details.
- End-to-end: header and footer contents, skip-link focus behaviour, visible
  focus indicators, mobile sticky action bar, mobile menu open/Escape/focus
  return, content not obscured by the action bar, and the `noindex`
  design-system reference page.

### P1 — foundation

- Environment contract parsing, defaults, rejection of malformed values and
  non-disclosure of secret values in error output.
- `.env.example` completeness and the guarantee that it holds names only.
- Approved business facts in `lib/site-config.ts`.
- End-to-end smoke: home page renders, unknown routes return HTTP 404, the
  health endpoint responds, and baseline security headers are present with
  `X-Powered-By` removed.
