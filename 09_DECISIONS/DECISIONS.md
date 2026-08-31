# VRK Decor — Decision Log

## Locked

- Production domain: vrkdecor.com
- Hosting: Hostinger managed Node.js/Web App Hosting
- Framework: Next.js
- Language: TypeScript
- Runtime: Node.js
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- Storage: Supabase Storage
- Internal enquiry notification: Admin Panel, not email
- Customer confirmation: Email when supplied
- Customer follow-up: Phone/WhatsApp
- Google Drive: Not used
- Customer accounts: Phase 2
- Online booking/payment: Phase 2/out of scope
- Automated quote/PDF: Phase 2/out of scope
- English-first Phase 1
- Staging before production

## P1 — Foundation implementation decisions (2026-08-31)

These are engineering decisions taken inside the approved architecture. None of
them changes an approved business requirement.

- **Next.js App Router** (not the Pages Router). Required for the metadata,
  route-handler and streaming patterns P4/P6/P9 depend on.
- **Application lives at the repository root** alongside the numbered
  specification folders, matching the repository contract in the Technical
  Development Specification §5 and Master Implementation Specification §6.
  No `src/` directory.
- **Tailwind CSS v4 with CSS-first configuration.** Design tokens will be
  declared in `app/globals.css` via `@theme` during P2; there is no
  `tailwind.config.js`.
- **Vitest** for unit and integration tests; **Playwright** for end-to-end and
  browser behaviour. Both were named or implied by the specifications; Vitest
  was selected for native ESM/TypeScript support.
- **Zod** for validation, starting with the environment contract, because
  server-side validation is a non-negotiable security requirement and the same
  schema library will validate requests in P6–P8.
- **Environment variables owned by later phases are optional** in the schema so
  the foundation builds without credentials. Each phase must assert the
  variables it consumes at its own boundary.
- **Path alias `@/*`** resolves from the repository root in TypeScript, Next.js
  and Vitest.
- **Node.js major version 22** pinned in `.nvmrc` (Next.js 16 requires
  > = 20.9). To be reconciled with the Hostinger plan in P12.
- **Baseline security headers in P1**, with full hardening (CSP, HSTS,
  permissions policy, CSRF, rate limiting) deferred to P10.
- **`GET /api/health`** added as a deployment smoke-test probe that exposes no
  environment detail.
- **ESLint pinned to the 9.x maintenance line (9.39.5).** ESLint 10 is not yet
  compatible with the `eslint-plugin-react` build bundled by
  `eslint-config-next@16`. Revisit when Next ships a compatible config.
- **`@playwright/test` pinned to 1.56.0**, the version whose browser build could
  be provisioned and verified in the current build environment. Bump together
  with `npx playwright install` when a newer browser build is available.

## Pending

- Exact Hostinger plan
- Upload limits
- Email provider
- Retention period
- Final brand assets/content
