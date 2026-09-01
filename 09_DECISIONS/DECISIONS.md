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

## P5 — Portfolio decisions (2026-08-31)

- **The parent relationship is structural, not conventional.**
  `PortfolioPhoto` is `{ image, design }`, `toPhotos()` is the only flattening
  path, and `designQuoteHref()` requires a design. A photograph therefore cannot
  be rendered or quoted without its parent, which is how "every photo resolves
  to its parent Design" is guaranteed rather than remembered.
- **Filters are query-parameter links, not client state.** Every filtered view
  is shareable and indexable, works without JavaScript, and is ordinary keyboard
  navigation.
- **Style and service filtering is applied in memory** after one query. Both
  live behind join tables and the PostgREST inner-join syntax for them cannot be
  integration-tested without a live Supabase project. Revisit if the portfolio
  reaches thousands of designs.
- **Public reads are bounded by a timeout.** An unreachable database costs a
  visitor a section, not the whole page.
- **Sample portfolio content is gated on Supabase being unconfigured.** That
  makes it impossible for placeholder designs to appear in staging or
  production, rather than relying on a flag someone must remember to switch. It
  is labelled wherever it appears and must be deleted before the production
  build.
- **`resolveImageUrl` accepts a local path only under `/samples/`**, so a stored
  storage key can never become an arbitrary local URL.
- **Only recognised video providers are embedded**, through
  `youtube-nocookie.com`; anything else degrades to a link, so a stored URL
  cannot become an arbitrary iframe source.
- **WebP-only image output; AVIF disabled.** Next optimises on demand, and AVIF
  encoding is far slower than WebP. On Hostinger's shared CPU a first visitor to
  an image-heavy page would pay seconds per image. Revisit only if images are
  pre-generated at build time or served through a CDN.
- **Image candidate widths capped at 1920.** A 3840 candidate let the browser
  request an upscale of a portrait source to roughly 20 megapixels, which a
  mobile browser can refuse to decode, producing a silently blank image. A
  decoration portfolio has no need for 3840px assets.
- **Image tests assert that images decode in the browser, while in view.** A
  file can be present, valid on disk and served with a 200 and still never
  render; and asserting at the end of a long scroll produces false failures,
  because browsers abandon in-flight lazy loads that leave the viewport.
- **Playwright worker count is explicit and overridable.** Rendering
  image-heavy pages is CPU-bound, and excess workers starve both the browsers
  and the server under test, producing navigation timeouts that look like
  product failures.

## P6 — Quote engine decisions (2026-09-01)

- **Submission is a Next.js Server Action, not a route handler.** Three
  properties decided it: Next verifies the request Origin against the host
  before a Server Action runs, which is the CSRF/request-integrity control the
  Technical Development Specification section 12 requires; the form degrades to
  a plain HTML POST and works with JavaScript disabled, as the filters do; and
  it leaves no public JSON endpoint for anyone to script against.
- **The parent Design is a lookup key in the form, never a value.** The hidden
  `design` field is re-resolved server-side on submit through the same
  published-only reader the page used. The worst a tampered field can do is
  attach a different _published_ Design. This is why there is no signed token or
  encrypted field: the parameter is already powerless.
- **A design parameter that does not resolve degrades to a general enquiry**
  with a visible notice, rather than a 404 or a silent drop. A draft, archived,
  deleted and invented slug are answered identically, so the form cannot be used
  to discover whether unpublished work exists.
- **Event type and required services are closed vocabularies**, validated
  against the approved occasion and service lists rather than accepted as free
  text. It is a data-quality decision and an injection-surface decision at once:
  the value that reaches the database is always one of a fixed set of slugs.
- **Budget is free text, not a range picker.** Requirements section 16 says the
  website shows no customer budget ranges; offering a list of ranges to choose
  from would publish them by implication.
- **Event date is validated against the business timezone (Asia/Kolkata)**, not
  the server clock, so an event "today" is never rejected by a server running in
  UTC. Bookings are accepted up to three years ahead.
- **Phone numbers are normalised to E.164 on the way in.** VRK Decor follows up
  by phone and WhatsApp, so the Admin Panel must be able to build `tel:` and
  `wa.me` links without guessing. Ten-digit and trunk-prefixed numbers are
  treated as Indian; an explicit `+` is kept as given.
- **`enquiries.selected_image_id` added** (migration
  `20260901090000_enquiry_source_image.sql`): a nullable FK to `design_images`
  with `ON DELETE SET NULL`, recording which photograph started the quote.
  Requirements section 11 approves the CTA starting from "a Design page or any
  gallery photo" and section 19 requires `photo_quote_cta_click` to be
  distinguishable from `quote_cta_click`; without this column the origin is lost
  at submission and cannot be reconstructed. It is strictly subordinate to
  `selected_design_id`, which keeps `ON DELETE RESTRICT`, and a trigger refuses
  any row whose photograph belongs to a different Design — or whose photograph
  has no Design at all.
- **Rate limiting ships in P6 rather than waiting for P10.** The quote form is
  the first anonymous write surface in the application; shipping it unthrottled
  and hardening later would mean shipping a known gap. The implementation is an
  in-process fixed-window limiter, which is honest about its scope: P10 replaces
  the store, not the call sites. Client keys are hashed so the limiter is not a
  place where visitor IP addresses accumulate.
- **A duplicate submission is answered with the confirmation, not an error.**
  The same number, design, date and event type inside ten minutes is one lead.
  The customer is told plainly that we already have it (`?repeat=1`) rather than
  being shown a second confirmation for an enquiry that was deliberately not
  created.
- **Success redirects to `/quote/submitted`**, a separate `noindex` page with no
  enquiry identifier in the URL. A refresh cannot resubmit, and there is nothing
  in the address bar to guess, share or look up.
- **Reference images: the relationship in P6, the upload in P7.** The schema,
  the three-image ceiling and the linking path are implemented and tested now;
  accepting files would require the MIME/content/size/dimension validation that
  P7 owns, and doing that halfway would be a security regression.
- **A local in-memory enquiry store, gated on Supabase being unconfigured.**
  Adopting the pattern P5 established for sample portfolio content: it makes the
  whole flow demonstrable and end-to-end testable before a Supabase project
  exists, it is impossible in staging or production, it is labelled on the page
  so nobody believes an enquiry was delivered when it was not, and a unit test
  asserts it throws rather than runs once Supabase is configured.
- **The Admin Panel data path is implemented, the Admin Panel is not.**
  `listEnquiries` reads as the signed-in user so Row Level Security decides, and
  the database suite proves an active admin sees the enquiry while anonymous and
  non-admin callers cannot. P8 renders it. "The enquiry reaches the internal
  inbox" is therefore verified in P6; the screens are P8's.
- **The service-role client writes; the caller's session reads.** Unchanged from
  P3's decision that there is no anonymous INSERT policy. The insert names its
  columns explicitly so `status`, `internal_notes` and
  `confirmation_email_sent_at` can never be set from a public request.
- **The E2E suite gives each test its own client address and phone number.**
  The form is rate limited exactly as it will be in production; tests sharing an
  identity would throttle each other and report a working limiter as a broken
  form.
- **The test Supabase shim now grants `service_role` table privileges**, which
  real Supabase does. Without it the P6 write path — service-role only by
  design — could not be tested at all.

## Pending

- Exact Hostinger plan
- Supabase staging and production projects must be created and the migrations applied
- Image upload dimension limits (file size limits chosen in P3)
- Email provider
- Retention period
- Approval of the proposed design system (or supply of an official brand guideline)
- Final typeface selection and licence
- Reversed/light logo variant for dark surfaces
- Approved hero photography or video, and real portfolio designs and photography
  (the sample set in public/samples/ must be deleted before the production build)
- Instagram / social account handle for the Home page showcase
- Legal review of the draft Privacy Policy and Terms & Conditions
