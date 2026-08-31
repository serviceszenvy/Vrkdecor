# VRK Decor — Changelog

## 0.3.0 — 2026-08-31 — P3 Database, Auth & Storage

### Added

- **Versioned migrations** in `supabase/migrations/`:
  - Initial schema covering all ten entities from the Technical Development
    Specification section 6, with foreign keys, unique slugs, indexes, status
    constraints, deletion behaviour and `updated_at` triggers. `styles` and the
    `design_styles` / `design_services` join tables implement the approved
    requirement to filter the portfolio by occasion, style **and** service.
  - Row Level Security on every table, the `is_active_admin()` predicate, every
    policy, and privilege revocations.
  - `portfolio` (public) and `references` (private) storage buckets and their
    policies.
  - Idempotent seed of the approved 14 occasions, 12 services and 10 styles,
    transcribed from the Requirements & SOW including the Tamil secondary terms
    and the partner-vendor markings.
- **Business rules enforced by the database**, so no application path can break
  them: at most one cover image per design, at most three reference images per
  enquiry, consent required on every enquiry, pricing-mode/price consistency,
  and refusal to delete a design that an enquiry points at.
- **Typed data access** — `lib/db/types.ts` and `lib/db/queries/public.ts`,
  including the server-side design eligibility check the quote engine needs.
- **Authentication** — `lib/auth/` with three separated Supabase clients
  (browser/anon, server/user, service role) and `middleware.ts` refreshing the
  session on `/admin` routes.
- **Authorization** — `getCurrentAdmin()`, `isAdmin()` and `requireAdmin()`,
  deciding from `auth.getUser()` rather than an unverified session.
- **Storage** — bucket configuration, server-generated unguessable object keys
  that refuse path traversal, public portfolio URLs, and five-minute signed URLs
  for private reference images.
- **`npm run verify:bundle`** — builds with sentinel values in the server-only
  environment variables and fails if any appears in a browser-downloadable
  asset.
- **58 database tests** (`npm run test:db`) run against a real PostgreSQL
  instance with the actual migrations applied, covering anonymous access,
  signed-in non-admins, disabled admins, active admins, storage privacy, schema
  constraints, seed data, and drift between the TypeScript types and the live
  schema.
- **15 new unit tests** for storage keys and limits, Supabase configuration and
  the enquiry pipeline.
- `docs/DATABASE.md`.

### Changed

- CI gained a `database` job backed by a `postgres:16` service container and a
  `secrets` job running the client-bundle scan.
- `.env.example` documents `TEST_DATABASE_URL` as test-only.
- ESLint allows console output in `scripts/`.
- Documentation updated: `docs/README.md`, `ARCHITECTURE.md`, `SECURITY.md`,
  `TESTING.md`, `ENVIRONMENT.md`, and the `lib/` module READMEs.

### Security

- Deny by default: RLS enabled on every table, `FORCE`d on `enquiries`,
  `reference_images` and `admin_users`.
- Anonymous users are refused enquiries, reference images and admin data at both
  the privilege and policy level, and cannot create objects in `public`.
- Unpublished designs and their media are invisible to anonymous and non-admin
  users even when the exact id is known.
- Authentication is separated from authorization; disabling an admin revokes
  access immediately, and no client role can grant admin rights.
- Enquiries are never written from the browser — no anonymous INSERT policy
  exists; they are created server-side after validation.
- Reference images have no public URL, unguessable server-generated keys and
  short-lived signed access.
- Buckets reject anything that is not an approved raster image — no SVG, PDF,
  archives or executables.
- Server modules import `server-only`; the bundle scanner was validated with a
  negative control that made it fail as intended.

### Verification

`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (61),
`npm run test:db` (58), `npm run test:e2e` (26), `npm run build`,
`npm run verify:bundle` and `npm audit --audit-level=high` all pass.

### Not included

No public page content, portfolio UI, quote engine, upload flow, email, admin
UI, SEO, analytics, rate limiting or deployment. The migrations have not yet
been applied to a Supabase project — see the checkpoint's manual actions.

## 0.2.0 — 2026-08-31 — P2 Design System

### Added

- **AI-derived proposed digital design system**, documented in
  `docs/DESIGN-SYSTEM.md` and rendered at the internal `/design-system` page
  (`noindex`). Explicitly labelled a proposal for client review, not an official
  VRK Decor brand guideline.
- **Logo analysis.** Pixel analysis of the supplied logo identified its two
  brand colours — lime `#8EC840` in the "VRK" wordmark and sage `#61764B` in the
  "DECOR" wordmark, leaf and ellipse. The palette is anchored to those exact
  values; the artwork itself is used unmodified.
- **Design tokens** in `lib/design-tokens.ts`, mirrored into Tailwind v4
  `@theme` variables in `app/globals.css`: `brand`, `accent` and warm `sand`
  ramps, semantic surface/ink/line/focus roles, a fluid type scale, section
  rhythm, radii and two elevation tokens.
- **Contrast contract**: thirteen text/background pairings declared in code and
  asserted against WCAG 2.1 AA by automated test, including the recorded
  constraint that the logo lime must not be used for small text on white.
- **UI primitives** (`components/ui/`): `Container`, `Section`,
  `SectionHeading`, `Button`, `ButtonLink`, `Card`/`CardBody`/`CardTitle`/
  `CardMeta`, `Badge`, `ImageFrame`, `ImageScrim`, `SkipLink`.
- **Application shell** (`components/layout/`): sticky `SiteHeader` with the
  approved primary navigation, accessible `MobileNav`, `SiteFooter`,
  `StickyMobileCta` (Call / WhatsApp / Get Quote, per Requirements & SOW
  section 4), `Logo` and inline icons.
- **Navigation model** (`lib/navigation.ts`): route map for the approved site
  structure, plus `tel:`, WhatsApp click-to-chat and `mailto:` hrefs built from
  the approved business contact details.
- **Brand assets** in `public/brand/`: a background-keyed transparent PNG and a
  light-background JPEG, trimmed to the artwork bounds.
- `lib/contrast.ts` (WCAG contrast maths) and `lib/cn.ts` (class-name join).
- Tests: `design-tokens`, `contrast`, `navigation` and `ui-primitives` unit
  suites, and a `shell` end-to-end suite covering header and footer contents,
  skip-link focus, focus visibility, the mobile action bar, mobile menu
  keyboard behaviour, and the design-system page.

### Changed

- `app/layout.tsx` now composes the shell: skip link, header, `#main` landmark,
  footer and mobile action bar.
- `app/page.tsx` and `app/not-found.tsx` restyled on the design system. They
  remain placeholders; real page content is P4.
- `app/globals.css` rewritten around the token set, with base typography,
  focus-visible styling and a `prefers-reduced-motion` block.
- `tests/e2e/smoke.spec.ts` home-page assertion updated for the new shell.
- Documentation updated: `docs/README.md`, `docs/ARCHITECTURE.md`,
  `docs/TESTING.md`, `components/ui/README.md`.

### Fixed

During visual verification of the shell:

- The mobile menu overlay dimmed only the header. The header uses
  `backdrop-filter`, which makes it the containing block and stacking context
  for `fixed` descendants; the overlay and panel are now rendered through a
  portal.
- Header actions marked `hidden` were visible at mobile widths, because the
  button base sets `inline-flex` and class order in an attribute does not
  resolve CSS conflicts. Responsive visibility now lives on a wrapper, and the
  constraint is documented in `lib/cn.ts`.
- The footer logo was stretched by the column flex container and its sage
  wordmark was hard to read on the dark surface. It is now `self-start` and
  presented on a white plate pending a reversed brand asset.

### Verification

`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`
(46 tests), `npm run test:e2e` (26 tests), `npm run build` and
`npm audit --audit-level=high` all pass. Desktop and mobile renderings of the
home page, mobile menu and design-system page were captured and inspected.

### Not included

No business functionality. Database, auth, storage, public page content,
portfolio, quote engine, uploads, email, admin panel, SEO, analytics, security
hardening and deployment remain owned by P3–P12.

## 0.1.0 — 2026-08-31 — P1 Foundation

### Added

- Next.js 16 (App Router) + React 19 + TypeScript 5.9 application in strict mode.
- Tailwind CSS v4 with CSS-first configuration via `@tailwindcss/postcss`.
- Repository structure contracted by the Technical Development Specification §5
  and Master Implementation Specification §6: `app/`, `components/`,
  `features/{portfolio,enquiries,admin}/`, `lib/{db,auth,storage,validation,analytics}/`,
  `tests/`, `docs/`. Each directory owned by a later phase carries a README
  recording that phase and the rules it must honour.
- Tooling: ESLint (flat config) with `eslint-config-next` and
  `eslint-config-prettier`, Prettier with `prettier-plugin-tailwindcss`,
  Vitest for unit/integration tests, Playwright for end-to-end tests.
- npm scripts: `dev`, `build`, `start`, `lint`, `lint:fix`, `typecheck`,
  `format`, `format:check`, `test`, `test:watch`, `test:e2e`, `verify`.
- Environment contract in `lib/validation/env.ts` (Zod) covering every variable
  in Technical Development Specification §14, with server-only variables kept
  separate from `NEXT_PUBLIC_` variables.
- `.env.example` documenting variable names only, with a unit test that fails if
  a contract variable is missing or if a value is ever committed.
- `lib/site-config.ts` holding approved business facts sourced from the
  Requirements & SOW (brand, domain, contact, coverage).
- Baseline security headers (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `X-DNS-Prefetch-Control`) and removal of `X-Powered-By`,
  asserted by an end-to-end test.
- `GET /api/health` probe for staging and production smoke tests.
- Foundation placeholder home page, 404 page and root layout with brand
  metadata.
- Unit tests for the environment contract, `.env.example` integrity and the
  approved business facts; Playwright smoke tests for the home page, 404
  handling, health endpoint and security headers.
- GitHub Actions CI running format check, lint, typecheck, unit tests,
  production build and `npm audit --audit-level=high`, plus a dependent
  Playwright end-to-end job.
- Git hygiene: `.gitignore` (all `.env*` except `.env.example`),
  `.gitattributes`, `.editorconfig`, `.nvmrc`.
- Engineering documentation: `docs/ARCHITECTURE.md`, `docs/LOCAL-DEVELOPMENT.md`,
  `docs/ENVIRONMENT.md`, `docs/TESTING.md`, `docs/SECURITY.md`.
- VRK Decor logo added to `07_BRAND_ASSETS/` for analysis in P2.

### Changed

- `06_CHECKPOINT/PROJECT-CHECKPOINT.md` updated to the verified P1-complete state.
- `09_DECISIONS/DECISIONS.md` extended with the P1 implementation decisions.
- `08_DEPLOYMENT/LOCAL-DEVELOPMENT.md` now points at `docs/LOCAL-DEVELOPMENT.md`.

### Verification

`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (10
tests), `npm run test:e2e` (8 tests), `npm run build` and
`npm audit --audit-level=high` all pass.

### Not included

No business functionality. Design system, database, auth, storage, public pages,
portfolio, quote engine, uploads, email, WhatsApp, admin panel, SEO, analytics,
security hardening and deployment remain owned by P2–P12.

## 0.0.0 — Pre-development

- Created portable Claude Code input package.
- Established permanent lead-engineer role.
- Established repository/checkpoint continuity rules.
