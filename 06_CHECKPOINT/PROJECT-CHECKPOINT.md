# VRK Decor — Project Checkpoint

Version: 0.5.0
Status: P5 COMPLETE — portfolio architecture and UI verified
Current phase: P5 — Portfolio (complete)
Completed phases: P1, P2, P3, P4, P5
Last updated: 2026-08-31

## Verified project state

Foundation (P1), design system and shell (P2), database/auth/storage with RLS
(P3), public website pages (P4) and the complete portfolio (P5). The quote
engine, uploads/email, admin panel, SEO/analytics and hardening are not
implemented.

Every claim below was produced by running the command in this repository.

Implemented in P5:

- **Portfolio data layer** (`features/portfolio/`): published-only reads, the
  design tree (occasion, styles, services, images, videos), filter options
  derived from designs that actually exist, and a bounded read timeout.
- **Design listing** at `/our-work` with occasion, style and service filters
  implemented as query-parameter links — shareable, keyboard-navigable and
  working with JavaScript disabled.
- **Design detail** at `/our-work/[slug]`: parent metadata shown once, ordered
  gallery, optional video, per-design SEO metadata, and a 404 for any unknown,
  draft or archived slug.
- **Gallery** at `/gallery`: every published photograph across the portfolio,
  each carrying its parent Design.
- **Lightbox**: modal dialog with focus trap, Escape with focus return,
  arrow-key navigation, wrap-around, horizontal swipe that ignores vertical
  intent, and body scroll locking. Portalled so no stacking context traps it.
- **Cover and related images**: one cover per design (enforced in the database
  since P3), related images ordered and inheriting all parent metadata, with
  per-image alt text override.
- **Featured designs** surfaced first in the listing and on the Home page.
- **Photo-level and design-level Get Quote CTAs**, both always carrying the
  parent Design.
- **Optional video/reel**: URL-only, embedded through `youtube-nocookie.com`
  for known providers and degraded to a plain link otherwise.
- **Sample portfolio content** for layout review: 6 designs, 24 procedurally
  generated placeholder images, active only when Supabase is unconfigured and
  labelled wherever it appears.

NOT implemented (correctly out of P5 scope): quote form and enquiry submission
(P6); reference uploads, email, WhatsApp instrumentation (P7); admin panel (P8);
sitemap, robots, structured data, analytics (P9); rate limiting and remaining
hardening (P10).

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

## Portfolio model

Design is the parent entity, now enforced end to end:

- `PortfolioPhoto` is `{ image, design }` — a photograph cannot be represented,
  rendered, linked or quoted without its parent.
- `toPhotos()` is the only flattening path and copies the parent onto each
  photograph.
- `designQuoteHref()` always carries the design; the photo id is optional
  context only.
- Row Level Security makes every child row invisible unless its parent Design is
  published, so a draft design's media cannot leak through a join.

## Sample content status

`lib/content/sample-portfolio.ts` and `public/samples/` (24 images, 364 KB) are
procedurally generated placeholders. They are **not** VRK Decor's work, they are
labelled on every portfolio surface, and they are active only when Supabase is
unconfigured. A unit test asserts they cannot appear once Supabase is
configured, and a build with Supabase configured generates no sample design
pages. **Both must be deleted before the production build.**

## Database / migration state

Unchanged from P3. Four migrations exist and are verified on every test run;
they have **not** been applied to any Supabase project.

## Files added or changed in P5

Added

- `features/portfolio/` — `types.ts`, `data.ts`, `image-url.ts`,
  `quote-link.ts`, `index.ts`, `README.md`, and `components/` (design card,
  grid, filter bar, lightbox, photo gallery, video embed, sample notice)
- `app/our-work/[slug]/page.tsx`
- `lib/content/sample-portfolio.ts`, `lib/db/with-timeout.ts`
- `public/samples/` — 24 placeholder images and a README
- `tests/unit/portfolio-model.test.ts`, `tests/unit/sample-portfolio.test.ts`
- `tests/e2e/portfolio.spec.ts`

Changed

- `app/our-work/page.tsx`, `app/gallery/page.tsx`, `app/page.tsx` — real
  portfolio data and cover images
- `next.config.ts` — image format and candidate-width policy (see Known issues)
- `playwright.config.ts` — worker policy and test timeout
- `lib/db/public-content.ts` — bounded reads
- `tests/e2e/public-pages.spec.ts` — image requests blocked in page-wide tests
- `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/CONTENT.md`
- `06_CHECKPOINT/PROJECT-CHECKPOINT.md`, `CHANGELOG.md`
- `09_DECISIONS/DECISIONS.md`

## Tests and results (run 2026-08-31 in this repository)

| Command                        | Result                                         |
| ------------------------------ | ---------------------------------------------- |
| `npm run format:check`         | PASS                                           |
| `npm run lint`                 | PASS — 0 errors, 0 warnings                    |
| `npm run typecheck`            | PASS — 0 errors                                |
| `npm test`                     | PASS — 14 files, 93 tests (was 74)             |
| `npm run test:db`              | PASS — 4 files, 61 tests (was 58)              |
| `npm run test:e2e`             | PASS — 110 tests (was 72), 42s                 |
| `npm run build`                | PASS — 13 routes + 6 design pages + middleware |
| `npm run verify:bundle`        | PASS — no server-only secret in client assets  |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities                       |

## Build status

Production build succeeds. `/our-work` is dynamic (it reads query-parameter
filters); `/our-work/[slug]` is pre-rendered per published design; everything
else public is static. With Supabase configured, no sample design pages are
generated — confirming samples cannot reach production.

## Security status

Unchanged from P3 and not weakened. P5 added no dependency. Notes specific to
this phase:

- Only published designs and their children are ever read; RLS is the boundary
  and the `status` filter is defence in depth.
- `resolveImageUrl` accepts a local path only under `/samples/`, so a stored
  key can never be turned into an arbitrary local URL.
- The video embed only iframes recognised providers, via `youtube-nocookie.com`,
  and degrades to a link otherwise — a stored URL cannot become an arbitrary
  iframe source.
- Public reads are bounded by a timeout, so an unreachable database degrades
  rather than holding requests open.

## Known issues

- **`/quote` still returns 404.** Every quote CTA — design-level and photo-level
  — points at it. Implemented in P6. It is the only intentionally broken
  internal link and the E2E link check excludes it explicitly.
- **Sample content and images must be deleted before the production build.**
- **AVIF output is disabled.** Next optimises images on demand, and AVIF
  encoding is far slower than WebP; on Hostinger's shared CPU a first visitor to
  an image-heavy page would pay seconds per image. Measured here: six cold
  1080px images took 0.58s as WebP versus navigation timeouts with AVIF
  enabled. Revisit if images are pre-generated at build time or served via a
  CDN.
- **Image candidate widths are capped at 1920.** Leaving 3840 in place let the
  browser request an upscale of a portrait source to roughly 20 megapixels,
  which a mobile browser can refuse to decode, leaving a silently blank image.
- Migrations are still not applied to any Supabase project (P3 carry-over).
- No webfont, no reversed logo variant (P2 carry-over); legal pages are drafts
  (P4 carry-over); `@playwright/test` pinned to 1.56.0 (P1 carry-over).

## Unresolved decisions

| Decision                                                     | Needed by            |
| ------------------------------------------------------------ | -------------------- |
| **Supabase staging and production projects must be created** | P6 onwards           |
| **Real portfolio designs and photography**                   | Production           |
| Approved hero photography or video                           | Sign-off             |
| Instagram / social account handle                            | Home social showcase |
| Legal review of the Privacy Policy and Terms                 | Production           |
| Approval of the proposed design system                       | Sign-off             |
| Final typeface selection and licence                         | Sign-off             |
| Reversed/light logo variant for dark surfaces                | Sign-off             |
| Exact Hostinger plan and Node.js version offered             | P12                  |
| Image upload dimension limits                                | P7                   |
| Practical maximum related images per Design                  | P8                   |
| Transactional email provider                                 | P7                   |
| Enquiry and reference-image retention period                 | P10                  |
| Google Analytics / Search Console owning account             | P9                   |
| Browser support floor                                        | P11                  |

## Manual actions required before later phases

1. **Create Supabase projects for staging and production** and apply the
   migrations (`supabase link`, `supabase db push`).
2. **Create the first admin**: a Supabase Auth user plus a matching
   `admin_users` row inserted with the service role.
3. Supply real designs and photography; delete `public/samples/` and
   `lib/content/sample-portfolio.ts`.
4. Supply approved hero photography or video.
5. Review the two draft legal pages and confirm the retention period.
6. Approve the design system; confirm the typeface; supply a reversed logo.
7. Create the GitHub repository and push; enable the CI workflow.
8. Confirm the Hostinger plan and the transactional email provider.

## Next action

Execute `05_PROMPTS/06-QUOTE-ENGINE.md` (P6 — Quote Engine): the `/quote` route,
the enquiry form with the required and optional fields from Requirements section
11, server-side validation, server-side verification that the selected Design
exists and is publicly eligible, and persistence of the enquiry with
`selected_design_id`.

P6 consumes the links this phase produces: `/quote?design=<slug>` and
`/quote?design=<slug>&photo=<image id>`. The design must be resolved and
re-verified server-side from that parameter — the customer never re-selects it.
Enquiry creation is server-side only; there is deliberately no anonymous INSERT
policy.
