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
npm run test:e2e   # Playwright
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
