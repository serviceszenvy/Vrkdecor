# VRK Decor — Project Checkpoint

Version: 0.2.0
Status: P2 COMPLETE — design system and application shell verified
Current phase: P2 — Design System (complete)
Completed phases: P1, P2
Last updated: 2026-08-31

## Verified project state

The repository contains a verified Next.js + TypeScript + Tailwind foundation
(P1) and, on top of it, an AI-derived proposed design system and a working
responsive application shell (P2). No business features are implemented.
Every claim below was produced by running the command in this repository.

Implemented in P2:

- **Logo analysis.** Pixel analysis of `07_BRAND_ASSETS/vrk-decor-logo.jpg`
  identified exactly two brand colours: lime `#8EC840` ("VRK" wordmark) and sage
  `#61764B` ("DECOR" wordmark, leaf, ellipse).
- **Proposed design system**, clearly labelled AI-derived and not an official
  brand guideline, documented in `docs/DESIGN-SYSTEM.md` and rendered at the
  internal `/design-system` page (`noindex`).
- **Tokens.** Three palettes (`brand`, `accent`, `sand`) anchored to the measured
  logo colours, semantic colour roles, fluid type scale, section rhythm, radii
  and elevation. `lib/design-tokens.ts` is the source of truth; `app/globals.css`
  mirrors it via Tailwind v4 `@theme`.
- **Contrast contract.** Thirteen text/background pairings declared and asserted
  against WCAG 2.1 AA by automated test.
- **UI primitives** in `components/ui/`: Container, Section, SectionHeading,
  Button, ButtonLink, Card family, Badge, ImageFrame, ImageScrim, SkipLink.
- **Application shell** in `components/layout/`: SiteHeader with primary
  navigation, accessible MobileNav, SiteFooter, StickyMobileCta (Call /
  WhatsApp / Get Quote per Requirements & SOW section 4), Logo, inline icons.
- **Navigation model** in `lib/navigation.ts` covering the approved site
  structure plus `tel:`, WhatsApp click-to-chat and `mailto:` hrefs derived from
  the approved business details.
- **Brand assets** prepared in `public/brand/`: a background-keyed transparent
  PNG and a light-background JPEG, both trimmed to the artwork bounds. The logo
  artwork itself is unmodified.
- Root layout wired with skip link, header, `#main` landmark, footer and mobile
  action bar; home and 404 pages restyled on the system.

NOT implemented (correctly out of P2 scope): database, auth, storage, public
page content, portfolio, quote engine, uploads, email, WhatsApp instrumentation,
admin panel, SEO, analytics, security hardening, deployment.

## Approved stack

Next.js + TypeScript + Node.js + Tailwind CSS + Supabase PostgreSQL/Auth/Storage

- Playwright + transactional email provider.

## Hosting

Hostinger managed Node.js/Web App Hosting. Domain: vrkdecor.com.
Build `npm run build`; start `npm start`. Node.js >= 20.9 (`.nvmrc` pins 22).
No Vercel-only capabilities. No third-party font or asset requests.

## Communication

- VRK Decor internal email notification: NO
- Admin Panel: YES
- Customer confirmation email: YES when email is provided
- Customer follow-up: Phone/WhatsApp

## Portfolio

Design is the parent entity. Multiple related images belong to one Design and
inherit its metadata. Each photo can initiate a quote for its parent Design.
Not yet implemented — P3 (schema) and P5 (UI). The `ImageFrame`, `Card` and
`Badge` primitives that the portfolio will use are in place.

## Files added or changed in P2

Added

- `lib/design-tokens.ts`, `lib/contrast.ts`, `lib/cn.ts`, `lib/navigation.ts`
- `components/ui/`: `button.tsx`, `badge.tsx`, `card.tsx`, `container.tsx`,
  `image-frame.tsx`, `section.tsx`, `skip-link.tsx`, `index.ts`
- `components/layout/`: `site-header.tsx`, `mobile-nav.tsx`, `site-footer.tsx`,
  `sticky-mobile-cta.tsx`, `logo.tsx`, `icons.tsx`, `index.ts`, `README.md`
- `app/design-system/page.tsx`
- `public/brand/vrk-decor-logo.png`, `public/brand/vrk-decor-logo-light.jpg`
- `docs/DESIGN-SYSTEM.md`
- `tests/unit/design-tokens.test.ts`, `tests/unit/contrast.test.ts`,
  `tests/unit/navigation.test.ts`, `tests/unit/ui-primitives.test.ts`
- `tests/e2e/shell.spec.ts`

Changed

- `app/globals.css` — full token set and base layer
- `app/layout.tsx` — shell wiring, theme colour
- `app/page.tsx`, `app/not-found.tsx` — restyled on the design system
- `components/ui/README.md`
- `tests/e2e/smoke.spec.ts` — home assertion updated for the new shell
- `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`
- `06_CHECKPOINT/PROJECT-CHECKPOINT.md`, `06_CHECKPOINT/CHANGELOG.md`
- `09_DECISIONS/DECISIONS.md`

## Database / migration state

No database. No schema. No migrations. Supabase is not yet connected.
All Supabase environment variables are declared and documented but optional.
Owned by P3.

## Tests and results (run 2026-08-31 in this repository)

| Command                        | Result                                            |
| ------------------------------ | ------------------------------------------------- |
| `npm run format:check`         | PASS                                              |
| `npm run lint`                 | PASS — 0 errors, 0 warnings                       |
| `npm run typecheck`            | PASS — 0 errors                                   |
| `npm test`                     | PASS — 7 files, 46 tests (was 3 files, 10 tests)  |
| `npm run test:e2e`             | PASS — 26 tests (was 8), chromium + mobile-chrome |
| `npm run build`                | PASS — 4 routes                                   |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities                          |

Visual verification was also performed: desktop and mobile screenshots of the
home page, the mobile menu and the full `/design-system` page were rendered and
inspected.

## Build status

Production build succeeds. Routes: `/` (static), `/_not-found` (static),
`/design-system` (static, `noindex`), `/api/health` (dynamic).

## Security status

Unchanged from P1 and not weakened: secret isolation, `.env` git-ignored,
`.env.example` names-only enforced by test, server-only vs `NEXT_PUBLIC_`
separation, redacted environment errors, baseline security headers verified by
E2E test, `X-Powered-By` removed, strict TypeScript, dependency audit in CI,
zero known vulnerabilities.

P2 added no new dependencies, no client-side storage, no network calls and no
third-party font or asset requests. External links open with
`rel="noopener noreferrer"`.

Deferred by design: RLS, storage policies, authentication, authorization/IDOR,
upload hardening, rate limiting, CSP/HSTS, CSRF, logging controls, retention and
backups. Ownership is recorded in `docs/SECURITY.md`.

## Known issues

- **Navigation links resolve to 404 until P4/P5/P6.** The shell links to the
  approved site structure (`/our-work`, `/services`, `/occasions`, `/packages`,
  `/gallery`, `/about`, `/contact`, `/quote`, `/privacy-policy`, `/terms`).
  Those routes are created by the phases that own them. The 404 page is styled.
- **No webfont is loaded.** Typeface selection and licensing is an open client
  decision; `--font-display` and `--font-sans` are the documented swap point and
  currently resolve to system stacks. Google Fonts is also unreachable from the
  current build environment, so an unverifiable font dependency was not added.
- **No reversed logo variant exists.** The supplied artwork is drawn for light
  backgrounds and its sage wordmark is weak on the dark footer, so the footer
  presents the logo on a white plate. A reversed asset from the client would
  remove the plate.
- `@playwright/test` remains pinned to 1.56.0 (see the P1 entry in
  `09_DECISIONS/DECISIONS.md`).
- The `cn` helper does not resolve conflicting Tailwind utilities. Responsive
  visibility must be applied to a wrapper, not passed through `className`. This
  is documented in `lib/cn.ts` and `docs/DESIGN-SYSTEM.md`.

## Unresolved decisions

Carried forward from the Master Implementation Specification section 17, plus
one added by P2.

| Decision                                                                              | Needed by |
| ------------------------------------------------------------------------------------- | --------- |
| **Approval of the proposed design system** (or supply of an official brand guideline) | P4        |
| **Final typeface selection and licence**                                              | P4        |
| **Reversed/light logo variant for dark surfaces**                                     | P4        |
| Exact Hostinger plan and Node.js version offered                                      | P12       |
| Image upload size/dimension limits                                                    | P7        |
| Reference-image upload size limit (max 3 files is fixed)                              | P7        |
| Practical maximum related images per Design                                           | P5/P8     |
| Transactional email provider                                                          | P7        |
| Admin user count and roles (default: one admin)                                       | P3/P8     |
| Enquiry and reference-image retention period                                          | P10       |
| Video URL-only vs upload (recommendation: URL-only)                                   | P5        |
| Final page content and approved photography                                           | P4        |
| Google Analytics / Search Console owning account                                      | P9        |
| Browser support floor                                                                 | P11       |

## Manual actions required before later phases

1. Review and approve (or amend) the proposed design system in
   `docs/DESIGN-SYSTEM.md` and at `/design-system`.
2. Confirm the typeface choice and supply a reversed logo variant.
3. Create the GitHub repository and push; enable the CI workflow.
4. Create Supabase projects for staging and production (required by P3).
5. Confirm the Hostinger plan and supported Node.js version (required by P12).
6. Choose the transactional email provider (required by P7).
7. Supply final page content and approved photography (required by P4).

## Next action

Execute `05_PROMPTS/03-DATABASE-AUTH-STORAGE.md` (P3 — Data/Auth/Storage):
Supabase schema and versioned migrations for the entities in the Technical
Development Specification section 6, Supabase Auth for the admin, Supabase
Storage buckets (public portfolio, private reference), RLS policies and storage
policies, with security and migration tests. P3 requires Supabase projects to
exist; if they do not, stop and resolve that dependency rather than working
around it.
