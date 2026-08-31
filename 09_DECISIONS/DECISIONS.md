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

## P2 — Design system decisions (2026-08-31)

The design system is **AI-derived and proposed**, not an official VRK Decor
brand guideline. It requires client review and approval, and is superseded if an
official brand guideline is supplied.

- **Palette anchored to measured logo colours.** Pixel analysis of the supplied
  artwork found lime `#8EC840` and sage `#61764B`. `accent-500` and `brand-700`
  are those exact values; the surrounding steps are a lightness ramp on the same
  hues. No unrelated brand identity was invented.
- **Sage is the primary brand colour, lime is a highlight.** The lime measures
  2.00:1 on white and fails WCAG AA for text; the sage measures 5.00:1 and
  passes. This is enforced by an automated test rather than left to convention.
- **A warm neutral (`sand`) rather than a cool grey**, so the neutral surfaces
  sit under warm event photography without a cold cast.
- **`lib/design-tokens.ts` is the single source of truth** for the palette, and
  a unit test fails if `app/globals.css` drifts from it.
- **Contrast is a tested contract, not documentation.** Thirteen pairings are
  declared in code and asserted against WCAG 2.1 AA.
- **44px minimum touch target**, exceeding the WCAG 2.1 AA minimum, for
  one-handed mobile use on a photography-led site.
- **No webfont is loaded yet.** Typeface selection and licensing is an open
  client decision; `--font-display` and `--font-sans` are the documented swap
  point. Self-hosting with `next/font/local` is recommended over a font CDN for
  performance, privacy and Hostinger independence. Google Fonts is additionally
  unreachable from the current build environment, so an unverifiable dependency
  was not introduced.
- **The logo artwork is used unmodified.** A transparent PNG was produced by
  keying out the flat white background only. Because no reversed variant exists,
  the dark footer presents the logo on a white plate; a reversed asset from the
  client would remove it.
- **The shell links to routes that later phases create.** Navigation targets the
  approved site structure now and resolves to the styled 404 page until P4, P5
  and P6 add those routes. This was preferred over disabling navigation, which
  would have to be unpicked later.
- **The mobile navigation is portalled.** The header uses `backdrop-filter`,
  which makes it the containing block and stacking context for `fixed`
  descendants.
- **No class-merging dependency.** `cn` is a plain join; the rule is that
  responsive visibility and layout are applied to a wrapper, never passed
  through a component's `className`.
- **An internal `/design-system` page ships with the application**, marked
  `noindex`, so the client and future engineers can review the system in a
  browser rather than only on paper.

## Pending

- Exact Hostinger plan
- Upload limits
- Email provider
- Retention period
- Approval of the proposed design system (or supply of an official brand guideline)
- Final typeface selection and licence
- Reversed/light logo variant for dark surfaces
- Final page content and approved photography
