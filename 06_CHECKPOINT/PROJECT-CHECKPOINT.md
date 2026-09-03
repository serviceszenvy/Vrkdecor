# VRK Decor — Project Checkpoint

Version: 0.8.2
Status: VISUAL REDESIGN COMPLETE, plus a public-site-only polish pass
(glassmorphism balance, brand-coloured ambient motion, scroll-reveal, hover/
press micro-interactions). P8 remains the last functional phase; the Admin
Panel was intentionally not touched by the polish pass.
Current phase: Redesign of P8 (complete) + public-site polish (complete).
Next functional phase: P9.
Completed phases: P1, P2, P3, P4, P5, P6, P7, P8, plus the redesign and this
polish pass
Last updated: 2026-09-03

## What this release is

A design-only release on top of the verified Prompt 8 codebase. It changed how
the application looks and what it says to a customer. It changed nothing about
what it does.

- **No database change.** Still six migrations, byte for byte the same.
- **No business logic change.** No Server Action, query, validator or storage
  helper was edited.
- **No dependency added.** `package.json` is unchanged.
- **No security control weakened.** The authorization model, RLS, storage
  policies, upload validation, rate limiting and private reference-image
  handling are untouched, and every test that proves them still passes.

The baseline was re-verified before any code was written: lint, typecheck, 350
unit tests and a production build all passed against the unmodified repository.

## Verified project state

Foundation (P1), design system and shell (P2), database/auth/storage with RLS
(P3), public website (P4), portfolio (P5), quote engine (P6), private uploads,
customer email and continuation (P7), and the Admin Panel (P8), now presented in
the approved VRK Decor visual language. SEO and analytics (P9), the remaining
hardening (P10), QA/UAT (P11) and the production deployment (P12) are still not
implemented.

## The design system, in one place

The full document is `docs/DESIGN-SYSTEM.md`; `06_CHECKPOINT/REDESIGN-AUDIT.md`
records the audit this redesign was planned from. The parts a future engineer
most needs to know:

### Colour

The logo-derived palette was **kept**, not replaced. `brand-700` (#61764B) and
`accent-500` (#8EC840) are still the exact colours measured in the supplied
artwork. What the redesign added is the surface layer around them:

| Token          | Value     | Role                           |
| -------------- | --------- | ------------------------------ |
| `canvas`       | `#F5F7F1` | The warm off-white page ground |
| `canvas-deep`  | `#EDF1E5` | Second ground                  |
| `surface-tint` | `#ECF2E6` | Soft green panel               |
| `ink-soft`     | `#5B5C54` | Body text on a tinted panel    |
| `line-soft`    | `#E4E7DD` | Hairline on the canvas         |

Two rules follow from measurement, not taste, and both are enforced by
`tests/unit/design-tokens.test.ts`: on `surface-tint`, `ink-muted` falls to
4.24:1 so tinted panels use `ink-soft`, and `brand-700` falls to 4.38:1 so they
use `brand-800`. The contrast contract now has **21** pairings, all passing.

The primary button moved from `brand-800` to `brand-700`, the logo's own sage.
White on it is 5.00:1.

### Glass

```
lib/design-tokens.ts  `glass`      the values
app/globals.css       --glass-*    mirrored, asserted by test
                      .glass-surface / -strong / -tint / .glass-edge
```

Three rules, each with a test:

1. **The blur radius is capped at 24px.** `backdrop-filter` repaints on every
   scroll frame; a large radius is the most expensive thing a glass design can
   ask of a mid-range phone.
2. **Glass degrades before it blurs.** The translucent values live only inside
   `@supports (backdrop-filter)`. A browser without it gets a near-opaque panel,
   never text floating on a photograph.
3. **Never behind data.** Admin tables, enquiry rows and form fields are opaque
   white.

Glass is used on the header, the hero panel, the figures bar, on-image chips,
the mobile sheet, the floating actions and the admin sidebar. Nowhere else.

### Typography

Still no webfont. The typeface licence is an open client decision, and a hosted
font would be both a third-party request and a build-time network dependency on
Hostinger. `--font-display` and `--font-sans` in `app/globals.css` are the swap
point, and a test now fails if an `@font-face` rule or a font CDN appears.

## Public website changes

| Area        | Change                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Composition | Rounded panels floating on a warm off-white ground, replacing full-bleed alternating bands. `Section tone="panel"`.                                                                        |
| Header      | Floating rounded translucent container over the hero, current-page indicator, phone action, "Get a Quote". `headerNav` adds Home in front of the approved navigation.                      |
| Mobile nav  | Rounded glass sheet with a current-page state. Focus trap, Escape, portal, scroll lock and route-change close all unchanged.                                                               |
| Home        | Photographic hero with a floating assurance panel, glass figures band, featured-work rail, value band, occasion icon grid, services, how it works, testimonials, botanical closing action. |
| Portfolio   | Tall photography-first cards with a glass occasion chip and the name in a scrim. Filters became a rail on small screens. The design detail page leads with its cover photograph.           |
| CTA         | One primary action and two quiet alternatives, on a soft green panel with botanical corners.                                                                                               |
| Footer      | Light, four-column, with the approved figures and "Developed with love by Zenvy".                                                                                                          |
| Actions     | Every button is a pill. WhatsApp became a floating action at every size; the mobile bar carries Call and Get Quote.                                                                        |
| Copy        | Rewritten across every page.                                                                                                                                                               |

## Admin Panel changes

Presentation only. Not one action, query or guard was edited.

- A glass sidebar at `lg` and above, a compact bar with a scrollable section
  strip below it. Six sections already overflowed a phone as tabs.
- Brand-consistent cards, filter chips, list rows, form controls and status
  badges, sharing the public site's tokens at a denser scale.
- The sign-out control and the identity line are each rendered exactly once, so
  there is no duplicate test id and no two ways to sign out on one screen.
- **Tables and enquiry rows are opaque.** No blur behind anything anyone has to
  read all day.

## Content changes

Every customer facing string was rewritten or reviewed. The rules applied:

- No em dashes, semicolons or plus signs in marketing sentences.
- No superlative, ranking or guarantee. Asserted by
  `tests/unit/content.test.ts` and by an end-to-end test that walks every page.
- Nothing said that the approved requirements do not support.
- No explanation of how the software works where a customer expects to be
  spoken to.

Preserved exactly: the approved figures (14+, 600+, 35+), the positioning
statement, the 14 occasions with their Tamil terms, the 12 services with their
partner-vendor marking, and the five coverage areas.

**Two deliberate refusals, both needing client confirmation.** The reference
design shows a phone number, an email address and opening hours that differ from
the approved requirements. The approved values were kept and **no opening hours
were invented**. The reference footer also shows Instagram, Facebook and YouTube
links; no account handle has been supplied, so the footer has no social row.

## Image strategy

No approved photography exists yet.

- `scripts/generate-sample-images.py` regenerates every placeholder. The 24
  portfolio placeholders were regenerated in the brand's green and ivory palette
  and a hero placeholder was added (`public/samples/hero-celebration.webp`).
- They are obviously synthetic, they are shown **only** when Supabase is not
  configured, they carry a visible notice wherever they appear, and
  `public/samples/` is still deleted before the production build.
- **`lib/content/hero-media.ts` is the single replacement point** for the
  approved hero photograph. The hero paints a brand gradient underneath the
  image, so a missing file degrades to a finished-looking section rather than a
  broken one.
- `tests/fixtures/images/` are test fixtures, never served, and must NOT be
  deleted.

## Files added

- `components/ui/glass.tsx` — `GlassPanel`, `IconChip`, `LeafRule`
- `components/layout/nav-links.tsx`, `components/layout/whatsapp-fab.tsx`
- `components/page/home-hero.tsx`, `leaf-decor.tsx`, `occasion-grid.tsx`,
  `service-icon.tsx`, `stat-bar.tsx`, `value-band.tsx`
- `features/portfolio/components/design-rail.tsx`
- `lib/content/hero-media.ts`
- `scripts/generate-sample-images.py`
- `public/samples/hero-celebration.webp`
- `06_CHECKPOINT/REDESIGN-AUDIT.md`

## Files changed

Every public page under `app/(site)`, `app/not-found.tsx`, `app/layout.tsx`,
`app/globals.css`; every file in `components/ui`, `components/layout` and
`components/page`; `features/portfolio/components/*`,
`features/enquiries/components/*`; every page under `app/admin` and both
`features/admin/components/admin-shell.tsx` and `admin-ui.tsx`;
`lib/design-tokens.ts`, `lib/navigation.ts` (added `headerNav`),
`lib/content/business.ts` and `lib/content/index.ts`; `docs/DESIGN-SYSTEM.md`,
`09_DECISIONS/DECISIONS.md`, `06_CHECKPOINT/CHANGELOG.md`; the 24 sample images.

Tests changed: `tests/unit/design-tokens.test.ts` (new token, radius, glass and
degradation assertions), `tests/unit/ui-primitives.test.ts` (primary colour and
the pill shape), `tests/e2e/public-pages.spec.ts` (new headings, figures scoped
to the figures band), `tests/e2e/shell.spec.ts` (the action-bar contract and a
new test for the floating WhatsApp action).

## Files deliberately NOT changed

`lib/auth/*`, `lib/db/*`, `lib/storage/*`, `lib/uploads/*`, `lib/validation/*`,
`lib/rate-limit.ts`, `lib/email/*`, `middleware.ts`, `next.config.ts`,
`supabase/migrations/*`, every file under `features/admin/actions`,
`features/enquiries/actions.ts`, `features/enquiries/quote-context.ts`,
`features/portfolio/quote-link.ts`, `features/portfolio/data.ts` (one metadata
string only), and `features/portfolio/components/video-embed.tsx`.

## Portfolio architecture — unchanged and re-proven

- Design is the parent. A Design has one cover image and many related images.
- Related images inherit the parent's occasion, styles, services and location.
- `designQuoteHref(slug, imageId)` always carries the parent Design. The photo
  id is context only.
- `/quote` re-resolves and re-verifies the Design server side and renders it
  read-only. **There is no control anywhere on that page for choosing a Design.**
- Only published Designs are ever listed. RLS is the boundary; the query filter
  is defence in depth.

Proven by `tests/e2e/quote.spec.ts` ("the customer never re-selects the design",
"every photograph of a design leads to a quote for that same design") and
`tests/e2e/portfolio.spec.ts`, all of which pass unchanged.

## Database / migration state

**Six** migrations, unchanged by this release, verified on every database test
run. They have **not** been applied to any Supabase project.

| Migration                                 | Contents                                      |
| ----------------------------------------- | --------------------------------------------- |
| `20260831120000_initial_schema.sql`       | Tables, constraints, triggers                 |
| `20260831120100_row_level_security.sql`   | RLS policies and privileges                   |
| `20260831120200_storage.sql`              | Buckets and storage policies                  |
| `20260831120300_seed_reference_data.sql`  | Approved occasions, services, styles          |
| `20260901090000_enquiry_source_image.sql` | `enquiries.selected_image_id` and its trigger |
| `20260901120000_admin_media_ordering.sql` | `set_design_cover`, `move_design_image`       |

## Tests and results (run 2026-09-01 in this repository)

| Command                        | Result                                                |
| ------------------------------ | ----------------------------------------------------- |
| `npm run format:check`         | PASS                                                  |
| `npm run lint`                 | PASS — 0 errors, 0 warnings                           |
| `npm run typecheck`            | PASS — 0 errors                                       |
| `npm test`                     | PASS — 27 files, 364 tests (was 350)                  |
| `npm run test:db`              | PASS — 7 files, 125 tests, against real PostgreSQL 16 |
| `npm run test:e2e`             | PASS — 238 tests, 2 projects (desktop and mobile)     |
| `npm run build`                | PASS — 24 routes + 6 design pages + proxy             |
| `npm run verify:bundle`        | PASS — no server-only secret in client assets         |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities                              |

Fourteen unit tests were added, all of them about the design system: token
parity for the new surfaces, radii and glass values, the blur ceiling, the
no-webfont rule, the graceful degradation of every glass surface, the pill
shape, and eight new contrast pairings.

## Build status

Production build succeeds. The route shape is unchanged from P8: every `/admin`
route is dynamic because each reads cookies, and every public route is exactly
where it was.

## Security status

Not weakened, and not touched. No dependency was added. No file under
`lib/auth`, `lib/storage`, `lib/uploads`, `lib/validation` or
`features/admin/actions` was edited. `tests/unit/admin-authorization.test.ts`
still walks every admin page and action and still passes, which means every
guard is still in place and the service-role client is still absent from the
Admin Panel. `tests/db/admin-operations.test.ts` still exercises every
administrative statement as four kinds of caller against real PostgreSQL.

One presentational decision is a security-adjacent improvement rather than a
regression: private reference images are still rendered with a plain `<img>` and
`referrerPolicy="no-referrer"`, never `next/image`.

## Known issues

**Pre-existing, discovered during the 0.8.2 polish pass, unrelated to it:**
`tests/unit/admin-authorization.test.ts` fails against the current
`features/admin/actions/auth.ts` and `shared.ts` (`signInAction` and the
`shared.ts` exports are not recognised as guarded/exported the way the test
expects). Confirmed by stashing every 0.8.2 change and re-running the suite —
the failure reproduces identically on the unmodified 0.8.1 code, so it predates
this pass. Not investigated further because the Admin Panel was out of scope
for 0.8.2. Needs a look before the next Admin Panel phase.

Redesign-specific:

- **The hero and portfolio images are generated placeholders.** They read as
  green foliage and blossom, which suits the brand, but they are not
  photographs and they are not VRK Decor's work. Real photography is the single
  biggest remaining visual gap.
- **No webfont.** The headings use a local serif stack. The approved reference
  uses a specific editorial serif; matching it exactly needs the typeface
  decision and licence.
- **The footer has no social row** and the contact panel shows no opening hours,
  because neither is approved. Both are visible differences from the reference.
- **The Admin Panel has not been seen signed in**, here or anywhere: there is no
  Supabase project, so the redesigned sidebar, dashboard, lists and forms have
  been type-checked, linted, built and structurally tested but not viewed with
  data in them. Check them first when the project exists.

Carried over from P8 and earlier, all unchanged:

- Nothing in the Admin Panel has been exercised against a real Supabase project.
- The end-to-end admin suite covers the unauthenticated view only.
- There is no "forgot password" flow; reset from the Supabase dashboard.
- No audit log.
- Image reordering is one step at a time.
- AVIF uploads are refused; the content probe reads JPEG, PNG and WebP.
- Email is not deliverable until a provider is configured.
- Rate limiting is per Node process, keyed on `x-forwarded-for`.
- Sample content and images must be deleted before the production build;
  `tests/fixtures/images/` must stay.
- AVIF output disabled; image candidate widths capped at 1920.
- Migrations are not applied to any Supabase project.
- Legal pages are drafts; `@playwright/test` is pinned to 1.56.0.
- `next build` warns that the `middleware` file convention is deprecated in
  favour of `proxy`. Pre-existing; best migrated in P10 or P12.

## Unresolved decisions

| Decision                                                                                              | Needed by           |
| ----------------------------------------------------------------------------------------------------- | ------------------- |
| **Supabase staging and production projects must be created**                                          | Before any real use |
| **Transactional email provider and credentials**                                                      | Before launch       |
| **Real portfolio designs and photography**                                                            | Production          |
| **Approved hero photograph** (`lib/content/hero-media.ts`)                                            | Sign-off            |
| **Which contact details are correct** — the approved requirements or the ones in the reference design | Before launch       |
| **Whether opening hours should be published, and what they are**                                      | Before launch       |
| Instagram, Facebook and YouTube handles for the footer                                                | Before launch       |
| Legal review of the Privacy Policy and Terms                                                          | Production          |
| Approval of the proposed design system                                                                | Sign-off            |
| Final typeface selection and licence                                                                  | Sign-off            |
| Reversed/light logo variant for dark surfaces                                                         | Sign-off            |
| Exact Hostinger plan and Node.js version offered                                                      | P12                 |
| Enquiry and reference-image retention period                                                          | P10                 |
| Google Analytics / Search Console owning account                                                      | P9                  |
| Browser support floor                                                                                 | P11                 |
| Whether more than one admin account is needed                                                         | P11                 |

## Manual actions required before later phases

1. **Create Supabase projects for staging and production** and apply the six
   migrations (`supabase link`, `supabase db push`).
2. **Create the first admin**: a Supabase Auth user, plus a matching
   `admin_users` row inserted **with the service role**.
3. **Verify the Admin Panel against the real project**, in this order: sign in;
   create a design; upload a cover image and two related images; reorder them;
   change the cover; edit alt text; publish; confirm the design appears on the
   public site; unpublish; confirm it disappears; open an enquiry; view a
   reference image; change the pipeline step; write a note. Then sign in as a
   non-admin user and confirm every admin URL redirects to sign-in.
4. Choose the transactional email provider and set `EMAIL_PROVIDER_API_URL`,
   `EMAIL_PROVIDER_API_KEY` and `EMAIL_FROM_ADDRESS`.
5. Supply real designs and photography; set the approved hero image in
   `lib/content/hero-media.ts`; delete `public/samples/` and
   `lib/content/sample-portfolio.ts`. Keep `tests/fixtures/images/`.
6. **Confirm the contact details and whether opening hours should be shown.**
7. Supply the social account handles, or confirm the footer stays without them.
8. Review the two draft legal pages and confirm the retention period.
9. Approve the design system; confirm the typeface; supply a reversed logo.
10. Create the GitHub repository and push; enable the CI workflow.
11. Confirm the Hostinger plan, and that its request body limit is at least
    16 MB so uploads are not truncated by the platform.

## Next action

Execute `05_PROMPTS/09-SEO-ANALYTICS.md` (P9 — SEO and analytics).

**Do not start it automatically.**

P9 consumes what P8 produced, unchanged by this redesign:

- The sitemap must include published designs, packages and the public pages, and
  **must exclude `/admin` entirely**, along with `/quote/submitted` and
  `/design-system`. `robots.txt` should disallow `/admin`.
- `designs.seo_title` and `seo_description` are editable by an admin and are the
  values a design page should prefer over its name and description.
- Analytics events must distinguish `quote_cta_click` from
  `photo_quote_cta_click`; `enquiries.selected_image_id` already records which
  photograph started a quote.
- **P9 must not add analytics to the Admin Panel.** It is an internal tool, its
  responses are `no-store`, and a third-party script there would put customer
  names, phone numbers and enquiry contents in front of an analytics vendor.

One new thing for P9 to be aware of: the home page hero now renders a real
`next/image` with `priority`. When the approved photograph replaces the
placeholder, check its Largest Contentful Paint before shipping.
