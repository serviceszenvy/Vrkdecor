# VRK Decor — Changelog

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
