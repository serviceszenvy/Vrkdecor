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

## P3 — Database, auth and storage decisions (2026-08-31)

- **Migrations live in `supabase/migrations/`.** That is where the Supabase CLI
  applies them, and P12 will deploy from there. TypeScript data access stays in
  `lib/db/` as the repository contract requires.
- **A `styles` table plus `design_styles` and `design_services` join tables.**
  The Requirements & SOW require filtering by occasion, style and service, and
  record that an admin enters "style(s)" — plural — per Design. One occasion,
  many styles, many services. The style vocabulary is exactly the approved list.
- **CHECK constraints rather than PostgreSQL enum types** for status domains, so
  adding a value later is an ordinary migration.
- **Money in paise (`bigint`)**, never floating point.
- **`ON DELETE RESTRICT` from `enquiries.selected_design_id` to `designs`.** A
  lead must never silently lose the Design it came from; designs with enquiries
  are archived rather than deleted. Design media cascade normally.
- **No anonymous INSERT policy on `enquiries` or `reference_images`.** The
  specification says only authorized admins mutate enquiries. Enquiries are
  created server-side with the service role after validation and rate limiting,
  so leads cannot be forged, enumerated or altered from a browser.
- **`admin_users` has no client write policy at all.** Provisioning the first
  and any subsequent admin is a deliberate server/service-role operation.
- **`is_active_admin()` is `SECURITY DEFINER` with a pinned `search_path`**, so
  a policy on `admin_users` can consult `admin_users` without recursion and the
  function body cannot be redirected by a caller-controlled search path.
- **RLS is `FORCE`d** on the three tables holding customer and admin data, so an
  owner-privileged connection cannot bypass policies by accident.
- **Storage object keys are server-generated and random**, never derived from a
  user-supplied filename; the original filename is retained for display only.
- **Upload limits selected and documented** (Master Implementation
  Specification section 18): portfolio 10 MB (JPEG/PNG/WebP/AVIF), references
  5 MB (JPEG/PNG/WebP). No SVG — it is scriptable. Enforced at the bucket level
  as well as in application validation (P7). Dimension limits remain open.
- **Video is URL-only in Phase 1**, adopting the specification's recommended
  default; `design_videos` stores an HTTPS provider URL, never an upload.
- **`lib/db/types.ts` is hand-maintained**, because `supabase gen types`
  requires a linked project. A schema-introspection test compares it against the
  live schema and fails on drift.
- **Database tests run against real PostgreSQL, not mocks.** A local shim
  supplies the Supabase `auth`/`storage` surface and roles so the real
  migrations apply unmodified; the shim is a test fixture and never reaches a
  Supabase project. Security policies are worth nothing untested.
- **A client-bundle secret scanner runs in CI.** Server modules import
  `server-only`, and the scanner independently proves no server-only value
  reaches a browser asset.

## P4 — Public website decisions (2026-08-31)

- **A requirements-derived content module (`lib/content`) is the canonical page
  copy**, and the database is preferred over it when configured. This keeps the
  site rendering before Supabase exists while ensuring VRK Decor's own admin
  edits win once it does. A test fails if the module and the seed migration
  disagree.
- **Public content readers never throw.** A missing or unavailable database
  yields approved fallback content or an empty state, not an error page. Only a
  message is logged, never the error object, so connection details cannot reach
  logs.
- **Public reads use a sessionless anon client**, so pages stay statically
  renderable. Row Level Security still applies exactly as for any visitor.
- **Empty states instead of placeholder content.** Designs, packages and
  testimonials are admin-managed; inventing samples would put unapproved claims
  on a live site.
- **The social/Instagram showcase and before/after sections are not built.** No
  account handle and no before/after pairs have been supplied, and neither can
  be invented. Both are recorded as outstanding client input.
- **The hero uses a deliberate brand panel, not an empty image frame**, until
  approved photography is supplied, and it is hidden below `lg` where it would
  only push content down.
- **The legal pages ship as clearly-marked drafts.** Leaving the footer links
  broken was the alternative. Every statement describes what the application
  actually does, open items (retention, analytics provider) say they are being
  confirmed rather than stating invented values, and each notice carries a
  `data-draft-notice` attribute so P11/P12 can confirm removal.
- **`/our-work` and `/gallery` are created in P4 as routes with metadata and a
  published-designs listing**, so no navigation link 404s. P5 replaces their
  bodies with the filters, detail pages and lightbox.
- **The contact page links to the quote flow rather than shipping its own
  form.** Server-side validation and rate limiting belong to P6 and P10; an
  unvalidated form would be a security regression.
- **Page titles omit the brand and let the layout template append it.** The Home
  page supplies an absolute title because Next.js does not apply a layout
  template to its own root segment.
- **Sitemap, robots and structured data stay in P9.** P4 delivers unique
  metadata, canonical URLs and Open Graph only, as the phase boundary defines.

## Pending

- Exact Hostinger plan
- Supabase staging and production projects must be created and the migrations applied
- Image upload dimension limits (file size limits chosen in P3)
- Email provider
- Retention period
- Approval of the proposed design system (or supply of an official brand guideline)
- Final typeface selection and licence
- Reversed/light logo variant for dark surfaces
- Approved hero photography or video, and portfolio photography
- Instagram / social account handle for the Home page showcase
- Legal review of the draft Privacy Policy and Terms & Conditions
