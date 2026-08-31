# VRK Decor — Project Checkpoint

Version: 0.3.0
Status: P3 COMPLETE — database, auth, storage and RLS verified
Current phase: P3 — Data/Auth/Storage (complete)
Completed phases: P1, P2, P3
Last updated: 2026-08-31

## Verified project state

The repository contains a verified foundation (P1), an AI-derived proposed
design system and application shell (P2), and a complete database, authentication
and storage architecture with Row Level Security (P3). Public pages, portfolio,
quote engine and admin panel are not implemented.

Every claim below was produced by running the command in this repository.

Implemented in P3:

- **Versioned migrations** in `supabase/migrations/`, applied in order:
  - `20260831120000_initial_schema.sql` — all ten entities from Technical
    Development Specification section 6, plus `styles` and the two join tables
    the approved "filter by occasion, style and service" requirement needs.
    Foreign keys, unique slugs, indexes, status constraints, deletion behaviour,
    `updated_at` triggers.
  - `20260831120100_row_level_security.sql` — RLS on every table, the
    `is_active_admin()` predicate, every policy, and privilege revocations.
  - `20260831120200_storage.sql` — `portfolio` (public) and `references`
    (private) buckets and their policies.
  - `20260831120300_seed_reference_data.sql` — the approved 14 occasions,
    12 services and 10 styles, idempotent.
- **Typed data access** — `lib/db/types.ts` (the `Database` type) and
  `lib/db/queries/public.ts` read helpers, including the
  `isDesignQuotable()` server-side eligibility check P6 will use.
- **Authentication** — `lib/auth/` with three clearly separated clients:
  browser (`anon`), server (acts as the signed-in user, subject to RLS) and
  service role (bypasses RLS, `server-only`). `middleware.ts` refreshes the
  session on `/admin` routes.
- **Authorization** — `getCurrentAdmin()`, `isAdmin()`, `requireAdmin()`.
  Decisions use `auth.getUser()`, which revalidates with Supabase Auth;
  `getSession()` is never trusted.
- **Storage** — bucket configuration, server-generated unguessable object keys
  with path-traversal refusal, public portfolio URLs and five-minute signed URLs
  for private reference images.
- **Secret-leak detector** — `npm run verify:bundle` builds with sentinel values
  in the server-only variables and scans every browser-downloadable asset.
- **CI** extended with a `postgres:16` service job running the database suite,
  and a job running the bundle secret scan.

NOT implemented (correctly out of P3 scope): public page content, portfolio UI,
quote engine, upload flow, email, admin panel UI, SEO, analytics, rate limiting,
security hardening, deployment.

## Approved stack

Next.js + TypeScript + Node.js + Tailwind CSS + Supabase PostgreSQL/Auth/Storage

- Playwright + transactional email provider.

## Hosting

Hostinger managed Node.js/Web App Hosting. Domain: vrkdecor.com.
Build `npm run build`; start `npm start`. Node.js >= 20.9 (`.nvmrc` pins 22).
No Vercel-only capabilities.

## Communication

- VRK Decor internal email notification: NO
- Admin Panel: YES
- Customer confirmation email: YES when email is provided
- Customer follow-up: Phone/WhatsApp

## Portfolio

Design is the parent entity, now enforced structurally: `design_images` and
`design_videos` cascade from `designs` and are readable publicly only through a
published parent. At most one cover image per design (partial unique index).
Portfolio UI is P5.

## Database / migration state

Four migrations, not yet applied to any Supabase project.

| Item                                     | State                                |
| ---------------------------------------- | ------------------------------------ |
| Migrations written                       | Yes — `supabase/migrations/`         |
| Migrations applied locally and tested    | Yes — every run of `npm run test:db` |
| Applied to a Supabase staging project    | **No — blocked, see manual actions** |
| Applied to a Supabase production project | No                                   |
| Untracked dashboard edits                | None; forbidden by process           |

Tables: `admin_users`, `occasions`, `services`, `styles`, `designs`,
`design_styles`, `design_services`, `design_images`, `design_videos`,
`packages`, `testimonials`, `enquiries`, `reference_images`.
Buckets: `portfolio` (public, 10 MB), `references` (private, 5 MB).

## Files added or changed in P3

Added

- `supabase/migrations/` — four migration files
- `lib/db/types.ts`, `lib/db/queries/public.ts`
- `lib/auth/config.ts`, `supabase-browser.ts`, `supabase-server.ts`,
  `supabase-service.ts`, `admin.ts`, `index.ts`
- `lib/storage/buckets.ts`, `keys.ts`, `urls.ts`, `index.ts`
- `middleware.ts`
- `scripts/check-client-bundle.mjs`
- `tests/db/` — `global-setup.ts`, `helpers.ts`, `supabase-shim.sql`,
  `rls.test.ts`, `storage-privacy.test.ts`, `schema-constraints.test.ts`,
  `schema-types.test.ts`
- `tests/unit/storage.test.ts`, `supabase-config.test.ts`,
  `enquiry-pipeline.test.ts`
- `vitest.db.config.mts`
- `docs/DATABASE.md`

Changed

- `package.json` — `@supabase/supabase-js`, `@supabase/ssr`, `server-only`;
  dev `pg`, `@types/pg`; scripts `test:db`, `verify:bundle`
- `eslint.config.mjs` — allow console output in `scripts/`
- `.github/workflows/ci.yml` — `database` and `secrets` jobs
- `.env.example` — documented `TEST_DATABASE_URL`
- `lib/auth/README.md`, `lib/db/README.md`, `lib/storage/README.md`
- `docs/README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `TESTING.md`,
  `ENVIRONMENT.md`
- `06_CHECKPOINT/PROJECT-CHECKPOINT.md`, `CHANGELOG.md`
- `09_DECISIONS/DECISIONS.md`

## Tests and results (run 2026-08-31 in this repository)

| Command                        | Result                                         |
| ------------------------------ | ---------------------------------------------- |
| `npm run format:check`         | PASS                                           |
| `npm run lint`                 | PASS — 0 errors, 0 warnings                    |
| `npm run typecheck`            | PASS — 0 errors                                |
| `npm test`                     | PASS — 10 files, 61 tests (was 46)             |
| `npm run test:db`              | PASS — 4 files, 58 tests (new)                 |
| `npm run test:e2e`             | PASS — 26 tests                                |
| `npm run build`                | PASS — 4 routes + middleware                   |
| `npm run verify:bundle`        | PASS — 13 client assets, no server-only secret |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities                       |

The database suite runs against a real PostgreSQL 16 instance with the actual
migrations applied, acting as `anon`, `authenticated` and `service_role` with
the same request claims Supabase derives from a JWT.

The bundle secret scanner was validated with a negative control: a deliberate
client-side reference to a secret was introduced, the scanner failed the build
as intended, and the probe was reverted.

## Build status

Production build succeeds. Routes: `/` (static), `/_not-found` (static),
`/design-system` (static, `noindex`), `/api/health` (dynamic), plus middleware
on `/admin/:path*`. The application builds and runs with no Supabase
credentials configured.

## Security status

Added in P3: RLS on every table (deny by default), IDOR protection on draft
content, separation of authentication from authorization, immediate revocation
for disabled admins, no client path to grant admin rights, private reference
bucket with unguessable server-generated keys and short-lived signed URLs,
storage-level upload type and size limits, parameterized access only,
`SECURITY DEFINER` with pinned `search_path`, secure session cookies, least
privilege on the `public` schema, and an automated client-bundle secret scan.

Nothing from P1 or P2 was weakened. No secret is committed; `.env*` remains
git-ignored except `.env.example`.

Deferred by design: server-side payload validation on enquiry submission (P6),
upload content/dimension validation (P7), rate limiting, CSP/HSTS, CSRF,
logging controls, retention and backups (P10, P12).

## Known issues

- **Migrations have not been applied to any Supabase project.** They are
  verified locally but no staging or production database exists yet. This is the
  blocking manual action below.
- The local test harness (`tests/db/supabase-shim.sql`) reproduces the Supabase
  `auth` and `storage` surface that the policies depend on. It is close enough
  to test policy logic faithfully, but it is not Supabase itself — the
  migrations must still be applied to a real staging project and the security
  checklist re-run there during P11/P12.
- `lib/db/types.ts` is hand-maintained because `supabase gen types` needs a
  linked project. A schema-introspection test fails on drift; regenerate from
  the CLI once a project exists if preferred.
- Navigation links still resolve to 404 until P4/P5/P6 create those routes.
- No webfont is loaded and no reversed logo variant exists (see P2 entry).
- `@playwright/test` remains pinned to 1.56.0 (see P1 entry).

## Unresolved decisions

| Decision                                                         | Needed by     |
| ---------------------------------------------------------------- | ------------- |
| **Supabase staging and production projects must be created**     | P3 apply / P4 |
| Approval of the proposed design system                           | P4            |
| Final typeface selection and licence                             | P4            |
| Reversed/light logo variant for dark surfaces                    | P4            |
| Exact Hostinger plan and Node.js version offered                 | P12           |
| Image upload dimension limits (size limits chosen: 10 MB / 5 MB) | P7            |
| Practical maximum related images per Design                      | P5/P8         |
| Transactional email provider                                     | P7            |
| Confirmation that one admin is sufficient                        | P8            |
| Enquiry and reference-image retention period                     | P10           |
| Final page content and approved photography                      | P4            |
| Google Analytics / Search Console owning account                 | P9            |
| Browser support floor                                            | P11           |

Closed in P3: video URL-only vs upload — implemented as external URLs only,
per the Master Implementation Specification's recommended default.

## Manual actions required before later phases

1. **Create Supabase projects for staging and production**, then apply the
   migrations: `supabase link --project-ref <ref>` and `supabase db push`.
   Record the project URLs and keys in each environment's secret manager, never
   in the repository.
2. **Create the first admin**: create the user in Supabase Auth, then insert the
   matching `admin_users` row with the service role. No client path can do this
   by design.
3. Review and approve the proposed design system (P2 deliverable).
4. Confirm the typeface choice and supply a reversed logo variant.
5. Create the GitHub repository and push; enable the CI workflow.
6. Confirm the Hostinger plan and supported Node.js version.
7. Choose the transactional email provider.
8. Supply final page content and approved photography.

## Next action

Execute `05_PROMPTS/04-PUBLIC-WEBSITE.md` (P4 — Public Website): Home, Services,
Occasions, Packages, About and Contact pages built on the P2 design system and
the P3 read helpers, with routing, metadata and responsive behaviour.

P4 needs approved page content and photography to be more than placeholder
structure, and it reads from the database, so applying the migrations to a
staging Supabase project should be done first. Confirm before proceeding.
