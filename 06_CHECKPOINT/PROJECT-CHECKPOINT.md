# VRK Decor — Project Checkpoint

Version: 0.4.0
Status: P4 COMPLETE — public website pages verified
Current phase: P4 — Public Website (complete)
Completed phases: P1, P2, P3, P4
Last updated: 2026-08-31

## Verified project state

The repository contains a verified foundation (P1), the AI-derived proposed
design system and application shell (P2), the database, authentication and
storage architecture with Row Level Security (P3), and the public website pages
(P4). Portfolio browsing, the quote engine and the admin panel are not
implemented.

Every claim below was produced by running the command in this repository.

Implemented in P4:

- **Public pages**, all statically rendered: `/`, `/our-work`, `/services`,
  `/occasions`, `/packages`, `/gallery`, `/about`, `/contact`,
  `/privacy-policy`, `/terms`.
- **Home page** covering the Requirements section 7 checklist: hero with
  Explore Our Work and Get a Quote, credentials, featured occasions, featured
  designs, browse by style, services overview, Why Choose VRK Decor, How It
  Works, testimonials and the final CTA. The persistent WhatsApp action comes
  from the P2 shell.
- **Content layer** (`lib/content/`) holding only requirements-derived copy:
  positioning, credentials, coverage, journey steps, and the approved 14
  occasions, 12 services and 10 styles.
- **Database-optional reads** (`lib/db/public-content.ts`): pages prefer
  Supabase rows so admin edits win, fall back to approved content, and never
  throw. The site renders correctly with no database configured.
- **SEO foundations** (`lib/seo.ts`): unique title and description per page,
  canonical URLs and Open Graph. Sitemap, robots and structured data remain P9.
- **Page components** (`components/page/`): Hero, CtaBand, StatList, EmptyState,
  DraftNotice.

NOT implemented (correctly out of P4 scope): portfolio filters, design detail
pages, gallery lightbox and photo-level quote CTAs (P5); the quote form and
enquiry submission (P6); uploads, email and WhatsApp instrumentation (P7); admin
panel (P8); sitemap, robots, structured data and analytics (P9); rate limiting
and remaining hardening (P10).

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

Design remains the parent entity, enforced structurally in P3. `/our-work` and
`/gallery` exist as routes with metadata and a published-designs listing; the
filters, detail pages, ordered gallery, lightbox and photo-level quote CTAs are
P5 and replace the bodies of those two pages.

## Content status

Content sources and outstanding client input are documented in
`docs/CONTENT.md`. In summary, still required from VRK Decor: approved hero
photography or video, portfolio designs and photographs, testimonials, published
packages, an Instagram/social handle, before/after pairs, and legal review of
the two draft legal pages.

Sections with no approved content show an honest empty state rather than
placeholder work. The social/Instagram showcase and before/after sections from
Requirements section 7 are deliberately not built, because no account handle and
no before/after pairs have been supplied.

## Database / migration state

Unchanged from P3. Four migrations exist and are verified locally on every test
run; they have **not** been applied to any Supabase project.

| Item                           | State                                |
| ------------------------------ | ------------------------------------ |
| Migrations written             | Yes — `supabase/migrations/`         |
| Applied locally and tested     | Yes — every `npm run test:db` run    |
| Applied to Supabase staging    | **No — blocked, see manual actions** |
| Applied to Supabase production | No                                   |

## Files added or changed in P4

Added

- `app/services/page.tsx`, `app/occasions/page.tsx`, `app/packages/page.tsx`,
  `app/about/page.tsx`, `app/contact/page.tsx`, `app/our-work/page.tsx`,
  `app/gallery/page.tsx`, `app/privacy-policy/page.tsx`, `app/terms/page.tsx`
- `components/page/` — `hero.tsx`, `cta-band.tsx`, `stat-list.tsx`,
  `empty-state.tsx`, `draft-notice.tsx`, `index.ts`
- `lib/content/` — `business.ts`, `catalog.ts`, `index.ts`, `README.md`
- `lib/seo.ts`, `lib/auth/supabase-anon.ts`, `lib/db/public-content.ts`
- `tests/unit/content.test.ts`, `tests/unit/catalog-parity.test.ts`
- `tests/e2e/public-pages.spec.ts`
- `docs/CONTENT.md`

Changed

- `app/page.tsx` — the real Home page
- `tests/e2e/smoke.spec.ts` — unchanged assertions, still passing
- `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`
- `06_CHECKPOINT/PROJECT-CHECKPOINT.md`, `CHANGELOG.md`
- `09_DECISIONS/DECISIONS.md`

## Tests and results (run 2026-08-31 in this repository)

| Command                        | Result                                        |
| ------------------------------ | --------------------------------------------- |
| `npm run format:check`         | PASS                                          |
| `npm run lint`                 | PASS — 0 errors, 0 warnings                   |
| `npm run typecheck`            | PASS — 0 errors                               |
| `npm test`                     | PASS — 12 files, 74 tests (was 61)            |
| `npm run test:db`              | PASS — 4 files, 58 tests                      |
| `npm run test:e2e`             | PASS — 72 tests (was 26)                      |
| `npm run build`                | PASS — 12 routes + middleware                 |
| `npm run verify:bundle`        | PASS — no server-only secret in client assets |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities                      |

Desktop and mobile renderings of the Home, Services, Occasions, Packages and
Contact pages were captured and inspected.

## Build status

Production build succeeds. All ten public pages plus `/design-system` are
statically prerendered; `/api/health` is dynamic; middleware runs on
`/admin/:path*`. The site builds and renders correctly with no Supabase
credentials configured.

## Security status

Unchanged from P3 and not weakened. P4 added no new dependency, no client-side
storage, no form submission and no network call beyond anonymous Supabase reads,
which remain governed by Row Level Security. External links keep
`rel="noopener noreferrer"`. Public content readers log a message only, never an
error object, so connection details cannot leak into logs.

## Known issues

- **`/quote` still returns 404.** Every "Get a Quote" call to action points at
  it; the route is implemented by P6. This is the only intentionally broken
  internal link, and the E2E link check excludes it explicitly.
- **The legal pages are drafts.** Both carry a visible notice and a
  `data-draft-notice` attribute. They must be reviewed and approved, and the
  notices removed, before production sign-off.
- **The hero has no photograph.** A deliberate brand panel stands in and is
  hidden below the `lg` breakpoint, where it would only push content down. It
  should be replaced with the approved hero image or video.
- Migrations are still not applied to any Supabase project (P3 carry-over).
- No webfont is loaded and no reversed logo variant exists (P2 carry-over).
- `@playwright/test` remains pinned to 1.56.0 (P1 carry-over).

## Unresolved decisions

| Decision                                                      | Needed by                  |
| ------------------------------------------------------------- | -------------------------- |
| **Supabase staging and production projects must be created**  | P5 onwards                 |
| **Approved hero photography or video**                        | P4 sign-off                |
| **Portfolio designs, photographs, testimonials and packages** | P5, sign-off               |
| **Instagram / social account handle**                         | Home social showcase       |
| **Legal review of the Privacy Policy and Terms**              | Production                 |
| Approval of the proposed design system                        | Sign-off                   |
| Final typeface selection and licence                          | Sign-off                   |
| Reversed/light logo variant for dark surfaces                 | Sign-off                   |
| Exact Hostinger plan and Node.js version offered              | P12                        |
| Image upload dimension limits                                 | P7                         |
| Practical maximum related images per Design                   | P5/P8                      |
| Transactional email provider                                  | P7                         |
| Enquiry and reference-image retention period                  | P10 and the Privacy Policy |
| Google Analytics / Search Console owning account              | P9                         |
| Browser support floor                                         | P11                        |

## Manual actions required before later phases

1. **Create Supabase projects for staging and production** and apply the
   migrations (`supabase link`, `supabase db push`).
2. **Create the first admin**: a Supabase Auth user plus a matching
   `admin_users` row inserted with the service role.
3. **Supply approved hero photography or video** and the portfolio content.
4. **Review the two draft legal pages** and confirm the retention period.
5. Confirm the Instagram/social handle, or confirm the section is dropped.
6. Review and approve the proposed design system; confirm the typeface and
   supply a reversed logo variant.
7. Create the GitHub repository and push; enable the CI workflow.
8. Confirm the Hostinger plan and the transactional email provider.

## Next action

Execute `05_PROMPTS/05-PORTFOLIO.md` (P5 — Portfolio): the design listing with
occasion, style and service filters, design detail pages, the ordered gallery
with lightbox and mobile swipe, video support, the featured flag, and the
photo-level "Get Quote for This Design" call to action carrying the parent
Design.

P5 replaces the bodies of `/our-work` and `/gallery`. It needs a Supabase
project with the migrations applied and at least one published Design in order
to be verified against real data.
