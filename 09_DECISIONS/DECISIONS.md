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

## P7 — Uploads, customer email and continuation decisions (2026-09-01)

- **File content is inspected in-process, with no image library.**
  `lib/uploads/image-signature.ts` reads magic bytes and header fields to report
  what a file actually is and how large its canvas is. Two reasons: an image
  library means a large native binary in a Hostinger managed Node deployment for
  three header reads, and decoding attacker-supplied images is itself an attack
  surface. The parser reads headers and never touches pixel data.
- **Dimension limits chosen (the open decision carried since P3): 200 px minimum
  per edge, 12000 px maximum per edge, 40 megapixels overall.** The lower bound
  keeps out thumbnails and tracking pixels that tell the design team nothing.
  The upper bounds refuse a decompression bomb: a few hundred bytes of PNG can
  declare a canvas of hundreds of megapixels, and while this application never
  decodes the file, an admin's browser will.
- **The whole submission is refused when any one file fails.** Accepting two of
  three would leave the customer believing all three arrived, and the form
  cannot repopulate a file input after an error, so the message says plainly
  that the images need choosing again.
- **Files are validated BEFORE the throttle.** A rejected attachment must not
  consume the duplicate window; otherwise a customer who fixes their file and
  resends is told we already have a request that was never created. The body has
  already been received by the time the action runs, so nothing expensive is
  moved ahead of the limiter.
- **The enquiry row is written before the objects.** The storage key is
  namespaced by the enquiry id, and more importantly a lead must never depend on
  an upload succeeding. A partial upload is reported to the customer
  (`?images=partial`) rather than hidden, and objects that were uploaded but
  could not be recorded are deleted rather than left as unreferenced private
  data.
- **`experimental.serverActions.bodySizeLimit` raised to 16 MB.** Server Actions
  default to a 1 MB body and the approved ceiling is three 5 MB images. This is
  not a relaxation of anything: the per-file limit, the count and the content
  check are all applied again server-side, and the bucket applies its own 5 MB
  limit in Supabase Storage. It is a framework feature of Next.js and introduces
  no Vercel dependency.
- **No re-encoding or EXIF stripping in Phase 1.** Re-encoding needs the image
  library this phase deliberately avoids, and the objects are never publicly
  served and never rendered on a public page. The residual point is that a
  customer's photograph may carry EXIF metadata, including location, which the
  VRK Decor team will see. That is a private image shared deliberately with the
  vendor, and it is recorded here so the retention decision (P10) covers it.
- **The transactional email provider is configuration, not code.** The provider
  is still an open client decision, so `lib/email/transport.ts` POSTs JSON to
  whichever HTTPS endpoint `EMAIL_PROVIDER_API_URL` names, with
  `EMAIL_PROVIDER_API_KEY` as a bearer token. No dependency was added, no vendor
  was chosen on the client's behalf, and if the chosen provider wants a different
  envelope, `buildRequestBody` is the single function to change. A plain-HTTP
  endpoint is refused, because the key travels with the request.
- **With email unconfigured, nothing is sent and nothing fails.** The transport
  becomes a no-op, and the confirmation page correctly promises no email. A page
  that promises a message nobody sent is worse than a page that promises
  nothing.
- **The confirmation send is awaited, not left running.** It is bounded by an
  eight-second timeout, and awaiting it is what lets the confirmation page tell
  the customer the truth about whether an email is coming. A fire-and-forget send
  would have to guess.
- **`Reply-To` is the approved business address.** A reply is something the
  customer chooses to send; nothing is delivered to VRK Decor unless they write.
  This is not the internal notification the requirements forbid, and a test
  asserts the business address is never a recipient and appears exactly once in
  the composer.
- **The confirmation carries no link to the customer's own images.** A signed URL
  in an inbox is a private image with a public door on it. The message names a
  count and nothing more.
- **A short reference code (`VRK-XXXXXXXX`) derived from the enquiry id**, so a
  customer can quote it on the phone without the full identifier travelling
  through an inbox. No public endpoint accepts either value.
- **The confirmation page carries the published design slug, three flags and
  nothing else.** The slug is public content and is what lets the page write the
  customer's WhatsApp message for them. It is re-resolved through the same
  published-only reader, so an invented or unpublished slug simply yields no
  name. There is still no enquiry identifier anywhere in the URL.
- **`WHATSAPP_PHONE_NUMBER` is reserved and deliberately unread.** The
  click-to-chat number is an approved business fact in `lib/site-config.ts` with
  a test behind it. An environment override would let the header, the footer and
  the continuation links disagree with each other, which is a worse failure than
  editing one approved constant. The variable is kept for the WhatsApp Business
  API work that Requirements section 12 places outside Phase 1.
- **Prefilled WhatsApp messages carry public content only.** The URL is visible
  in the address bar, kept in browser history and read by WhatsApp, so it may
  carry the name of a published design and nothing about the customer.
- **`resolveImageUrl` now refuses a private key outright.** It would already
  fail, because the object is in another bucket that grants `anon` nothing, but
  a customer's inspiration image must never be handed to a function whose job is
  to build a public URL, whatever a future caller believes it is holding.
- **Vitest resolves `server-only` to the package's own empty build.** The marker
  throws on import by design, which is exactly what keeps the service-role client
  and the email transport out of a browser bundle; Vitest runs in Node, where
  those modules are legitimately importable. `next build` still applies the real
  marker and `npm run verify:bundle` independently proves nothing leaks.
- **Image test fixtures are real files produced by a real encoder**, committed at
  a few kilobytes each. Verifying a header parser against bytes written to
  satisfy it proves nothing. The hostile files are built in code, because each
  has to be wrong in one specific way.
- **No database migration was needed.** `reference_images` and
  `enquiries.confirmation_email_sent_at` were created in P3 with exactly the
  columns and constraints this phase consumes.

## P8 — Admin Panel decisions (2026-09-01)

- **Two independent checks on every administrative operation, and the
  service-role client is used nowhere in the Admin Panel.** `requireAdmin()`
  decides whether the request proceeds; the caller's own session client means
  Row Level Security decides, row by row, what each statement may touch. The
  tempting alternative — guard the page, then use the service role because it is
  simpler — would make the guard the only check standing, so one missed call
  would expose everything instead of nothing. `requireAdminContext()` exists so
  that holding an authorized identity and a service-role client at the same time
  is awkward to write by accident, and a unit test fails the build if the service
  role appears under `features/admin` or `app/admin` at all.
- **The public pages moved into an `app/(site)` route group so the Admin Panel
  could have its own shell.** A route group adds no URL segment, so every public
  route is exactly where it was. The reason is not tidiness: an enquiry inbox
  inside a marketing header, a "Get a Quote" sticky bar and a sales footer is
  confusing to work in and careless to show anyone standing behind the person
  using it. `app/not-found.tsx` sits outside the group, because Next.js renders
  it inside the root layout for an unmatched URL, so it renders the public chrome
  itself through the shared `SiteChrome` component.
- **`set_design_cover` and `move_design_image` are database functions, not
  sequences of PostgREST calls.** The cover is protected by a PARTIAL UNIQUE
  index, so clearing the old one and setting the new one must happen in one
  transaction; two round trips can leave a design with no cover if the second
  fails, and a single multi-row UPDATE can trip the index part-way depending on
  the order rows are visited. Reordering is a swap, which is two writes that must
  both land. Both functions are SECURITY INVOKER, so Row Level Security still
  applies inside them, and the `is_active_admin()` check at the top is there to
  give a clear error rather than a silent no-op.
- **Reordering is "move up / move down", not drag and drop.** It works with
  JavaScript disabled, it is operable from a keyboard, it needs no client-side
  state, and each move is one atomic call. Drag and drop would be nicer to
  demonstrate and worse to rely on.
- **A design cannot be published without a cover image.** Requirements & SOW
  section 9 makes the cover the image every card and listing uses, and P5 built
  the public portfolio on that promise. Publishing without one would put a broken
  card on the live site, so it is refused with a sentence rather than discovered
  later by a visitor.
- **Designs are archived, never deleted.** `enquiries.selected_design_id` is
  `ON DELETE RESTRICT` by the P3 decision, so a lead never loses the design it
  came from. Archiving removes it from the website and keeps the relationship.
- **Occasions, styles and services are deactivated, never deleted.** Designs
  reference them with `ON DELETE RESTRICT`, and their slugs are public filter
  URLs. Deactivating hides a term from the public site and from new designs while
  leaving existing work and existing links intact, which is what an admin
  actually means. Testimonials are the one thing the panel deletes outright,
  because nothing references them and a customer may ask for removal.
- **An enquiry's own answers are never editable; only `status` and
  `internal_notes` are.** An inbox where a lead's phone number or event date
  could be rewritten would be worth less than the paper record it replaced. The
  update names exactly those two columns, and a test asserts the others are
  absent.
- **Enquiries cannot be created from the Admin Panel by anyone**, including an
  active admin. They come from the public quote form through the server and from
  nowhere else, so the inbox cannot be salted with rows that never came from a
  customer. This falls out of the P3 decision to grant no INSERT policy, and P8
  deliberately did not add one.
- **Slugs are generated, never accepted.** An admin may override one, but the
  override runs through the same `slugify`, so a public URL segment can never
  carry a path, a query string, a percent-encoded sequence or a script.
- **Video URLs are validated against the chosen provider's own hosts and must be
  HTTPS.** A stored URL becomes an iframe on a public page; a lookalike host such
  as `youtube.com.evil.test` is refused rather than embedded.
- **Admin input is validated exactly as strictly as public input.** The panel is
  behind authentication, which is precisely why the temptation exists to treat
  its forms as trusted. They are a browser posting bytes, and what they post
  lands in columns the public website renders.
- **Private reference images are rendered with a plain `<img>`, never
  `next/image`.** The optimiser would fetch a customer's private photograph and
  cache it on disk under a URL derived from the signed one, which is the exact
  thing a private bucket exists to prevent. `referrerPolicy="no-referrer"` keeps
  the signed URL out of Referer headers, and the signed URL is issued with the
  admin's own session so the storage policy applies as well as the guard.
- **`next/image` `remotePatterns` added, scoped to the configured Supabase host
  and the PUBLIC portfolio path only.** Without it, `next/image` refuses every
  real storage URL, which P5 never hit because sample content is local. With a
  broad pattern, a mistaken or tampered storage key could point the optimiser at
  an arbitrary host. The private bucket is deliberately absent from the list.
- **Portfolio uploads accept JPG, PNG and WEBP, not AVIF**, even though the
  bucket allows AVIF for delivery. `lib/uploads/image-signature.ts` reads the
  first three; adding a half-verified AVIF parser to accept a format that
  `next/image` re-encodes to WebP anyway would be work with no benefit and one
  more place to be wrong. Extending the probe is how to add it later.
- **The application's own upload ceiling (15 MB) sits just under the framework's
  (16 MB).** A request over the Server Action body limit is rejected before any
  application code runs, and the admin would see a generic failure rather than a
  sentence. The form states both limits.
- **Portfolio images require 800 px on the shorter edge**, higher than the 200 px
  floor for customer reference images, because these are shown full width on a
  design page and anything smaller would be upscaled.
- **Least privilege on `admin_users` tightened.** P3 granted `select` to
  `authenticated` and left Supabase's default INSERT, UPDATE and DELETE grants in
  place. No policy allowed them, so Row Level Security already refused — an
  insert raised and an update matched no row — but P8 revokes the privileges as
  well, so that a future migration adding a policy to that table cannot
  accidentally open a door nobody meant to open.
- **Sign-in is rate limited per client AND per email address.** Either limit
  alone leaves an obvious way around: one client trying many addresses, or many
  clients trying one. A wrong password and an unknown address are answered
  identically so the form is not an address checker.
- **The Admin Panel is honest when Supabase is not configured.** Rather than a
  login box that silently fails, the sign-in page says there is no database
  connected and what to set. That is the state a reviewer sees on a fresh
  checkout, and `getCurrentAdmin()` returns null instead of throwing so every
  admin route stays routable.

## Visual redesign (post-P8)

- **The logo-derived palette was kept, not replaced.** `brand-700` (#61764B) and
  `accent-500` (#8EC840) are the exact colours measured in the supplied
  artwork, which is already what "a refined green palette derived from the logo"
  means. The redesign added surfaces around them rather than changing them.
- **The primary button moved from `brand-800` to `brand-700`.** It matches the
  mid-olive in the approved reference design, it is the logo's own sage, and
  white on it is 5.00:1, comfortably over the 4.5:1 AA requirement.
- **Glass degrades before it blurs.** The translucent values are applied only
  inside `@supports (backdrop-filter)`. Every glass surface is a near-opaque
  panel without it, so no browser is ever asked to render text over a
  photograph. The blur radius is capped at 24px because `backdrop-filter`
  repaints on every scroll frame.
- **No glass behind data.** Admin tables, enquiry rows and form fields are
  opaque white. Reading a customer's phone number through a blurred photograph
  is a worse tool, whatever it looks like in a screenshot.
- **Still no webfont.** The typeface licence remains an open client decision, and
  a hosted font would add both a third-party request and a build-time network
  dependency on Hostinger. The display and sans stacks in `app/globals.css` are
  the swap point, and a test fails if an `@font-face` or a font CDN appears.
- **The mobile action bar dropped WhatsApp.** WhatsApp became a floating action
  present at every size, so keeping it in the bar as well would have put the same
  action on screen twice and squeezed the two that remain.
- **The footer has no social row.** No Instagram, Facebook or YouTube account has
  been supplied. A link to a profile that does not exist is worse than no link,
  so the contact column carries the channels VRK Decor actually answers on.
- **The reference design's contact details were NOT adopted.** It shows a phone
  number, an email address and opening hours that differ from the approved
  requirements. Business facts come from the requirements, so the approved
  values were kept and no opening hours were invented.
  **Client action: confirm which contact details and opening hours are correct.**
- **Placeholder imagery is generated, never sourced.** `scripts/generate-sample-images.py`
  produces the green and ivory botanical placeholders procedurally. They are
  obviously synthetic, they carry a visible notice wherever they appear, and
  `public/samples/` is still deleted before the production build.
- **The Admin Panel moved from tabs to a sidebar.** Six sections already
  overflowed a phone in a row of tabs, and there will be more.

## UI/UX refinement v2 (2026-09-05)

Source: the client's "VRK Decor — Complete UI/UX, Content & Experience
Refinement" brief, applied to the 0.8.1 visual redesign. The brief assumed a
fully dark site; the client clarified in the session that the light theme
should stay but become noticeably more colourful, with clearly visible dark
sections in the logo's own colours. That is what was built.

- **Light ground kept, dark layer added.** The page ground is still the warm
  off-white canvas. The hero of every page, the value band, the closing call to
  action, the founder section, the gallery wall and the footer now sit on
  `surface-deep` (#37432b, the logo's dark olive) lit by lime and sage. New
  tokens: `surface-deep`, `surface-deeper`, `ink-on-deep`, dark glass, and six
  new contrast pairings, all asserted by the design-token tests.
- **A motion layer with two safety rails.** Scroll reveals, staggered entrances,
  ambient drift, page transitions, hover depth and the icon glow are CSS plus one
  small `IntersectionObserver` component. The hidden reveal state applies only
  under `@media (scripting: enabled)`, so a page without JavaScript shows
  everything, and `prefers-reduced-motion` collapses every animation to an
  instant. No dependency was added.
- **The home hero is sized to the first desktop viewport.** `100svh` less the
  floating header and the page inset, capped at 54rem and floored so a short
  laptop never crushes the type. Below `lg` the constraint is dropped and the
  hero grows naturally. Nothing is cropped.
- **The Occasions page was removed.** It duplicated Services. Services now
  carries both the twelve approved services (grouped by who delivers them) and
  the occasions, grouped the way a customer thinks about them. `/occasions` is a
  permanent (308) redirect to `/services#occasions`, `routes.occasions` points
  at the anchor, and the admin revalidation no longer names the old path.
- **Celebration categories are presentation, not catalogue.** The brief asked
  for categories such as haldi, destination and beach weddings, church decor,
  showroom openings, car decor and Kerala weddings. They appear on Services as
  kinds of celebration, each linked to the closest of the fourteen APPROVED
  occasions. The database, the quote form's event types and the Admin Panel are
  unchanged, and a unit test fails if a celebration points at an unapproved
  slug or if a partner-vendor service is ever grouped under "our own team".
  **Client action: confirm the celebration categories and their wording.**
- **The quote form was simplified.** Name, phone, event type, event date,
  location and a message, plus the mandatory consent line; email and the three
  private reference images sit behind an "Add more details" disclosure. To make
  that honest, `venue` became optional and `requiredServices` may be empty in
  `lib/validation/enquiry.ts`. Both columns already allowed it (`venue` was
  nullable and `required_services` defaulted to `'{}'`), so there is no
  migration. The venue and the services are discussed on the follow-up call,
  which is how VRK Decor works anyway. Every other rule is unchanged: closed
  vocabularies, sanitisation, phone normalisation, consent, throttling, and the
  Design re-resolved server-side.
- **WhatsApp carries the selected design's URL.** `designEnquiryMessage` now
  takes the public URL of the design page (`absoluteDesignUrl`, built from the
  slug on the approved production domain) so the team knows exactly which
  design is being asked about. The message is still public content only, still
  length-capped, and drops the name rather than truncating the URL.
- **Three alternative ways to enquire, everywhere.** `/quote` and `/contact`
  present WhatsApp, Call and Send an enquiry as equal alternatives under one
  heading. The Contact page embeds the same quote engine (same Server Action,
  validation and rate limiting) instead of linking to it, and is rendered per
  request so the form's date bounds are current.
- **Quote CTAs were rationed.** A page body carries at most two strong quote
  actions: a page-specific one where it exists (the design's own button, the
  lightbox) and the closing band. Inner-page heroes no longer ask for a quote;
  they point at the work. The header and the mobile bar remain site-wide.
- **Previous / Next between designs.** The design page shows the previous and
  next design in listing order, wrapping at the ends, with a counter. Plain
  links to the existing routes; the page transition template does the rest.
- **The gallery is a wall, not a catalogue.** Masonry at each photograph's own
  proportion on the deep surface, no caption under any image; the design name is
  a hover chip and the lightbox title, and always in the accessible name.
- **The founder section states only what was supplied.** Name and role from
  the brief, positional copy, no achievement, year count or client count. The
  portrait is a designed placeholder; `lib/content/founder.ts` is the one
  replacement point. **Client action: supply the founder photograph.**
- **The sample birthday design is now featured** so the home page's four
  signature cards include a birthday celebration. Real data: whatever the admin
  marks featured, four of them.

## Mobile responsiveness and motion (2026-09-05)

**`viewport-fit=cover` rather than the browser's default inset.** The site is
built out of full-bleed rounded panels and edge-anchored floating controls, so
letting the browser inset the whole page inside the safe area would leave a
band of ground above the notch and below the home indicator. Opting into cover
means the layout owns those insets, which is also what makes
`env(safe-area-inset-*)` report a real value — under the default it is always
zero, which is why the safe-area handling already in the codebase had no
effect. The four insets are read once into `--safe-*` in `app/globals.css`
rather than being spelled out at each use site, because `env()` is only
meaningful inside the property that consumes it and the 0px fallback has to be
written every time.

**Zoom is not capped.** `maximumScale` or `userScalable: false` would stop iOS
zooming the page on field focus, and would also stop a visitor enlarging the
type, which fails WCAG 1.4.4. The 16px floor on form fields on a phone is what
prevents the automatic zoom instead.

**Mobile values step UP at `sm`, desktop values are unchanged.** Every spacing,
type and grid change in this release adds a smaller mobile value below the
existing one rather than editing the desktop value. Nothing about the approved
desktop composition moves.

**Two across, not one, for the occasion tiles and the portfolio.** Three
occasion tiles across 393px was splitting the Tamil terms through the middle of
a word; one portfolio card across gave each design most of a screen. Both are
now two, with the card's own type and chips stepped down to match.

**Counting figures use `role="img"` with `aria-label`.** The figures are
approved business facts and must be rendered exactly as approved. The approved
string is what renders on the server, so a crawler, a printed page and a
visitor without JavaScript all get the real figure; `role="img"` makes the
ticking digits presentational and fixes the accessible name to the approved
string, so the animation can never change what the figure says. A visible copy
plus a screen-reader copy was rejected because it puts the same figure in the
page twice.

**Press feedback, not hover, on a touch screen.** `hover` is a desktop idea.
`.press` is scoped to `@media (hover: none)` so the two never fight, and the
default grey tap highlight is turned off because the page now has a press
state of its own.

**The reveal blur is a desktop-only refinement.** A blur on a revealing section
forces a full-size offscreen buffer every frame, which is the most expensive
thing this effect can ask of a mid-range phone, and at 393px nobody sees it.
Below `sm` the reveal is opacity and a shorter travel. The sideways reveals
collapse to the ordinary rise there for the same reason, and because 36px of
horizontal travel inside a 393px viewport is a chance for the document to grow
sideways mid-animation.

**The body is pinned, not `overflow: hidden`, while the menu or lightbox is
open.** `overflow: hidden` on the body does not hold the page still on iOS
Safari. Pinning it at its current offset does, at the cost of restoring the
scroll position on close, which both components now do.

## Pending

- Exact Hostinger plan
- Supabase staging and production projects must be created and the migrations applied
- Transactional email provider selection, and its credentials
- Retention period
- Approval of the proposed design system (or supply of an official brand guideline)
- Final typeface selection and licence
- Reversed/light logo variant for dark surfaces
- Approved hero photography or video, and real portfolio designs and photography
  (the sample set in public/samples/ must be deleted before the production build;
  `lib/content/hero-media.ts` is the single replacement point for the hero image)
- Confirmation of the contact details and opening hours shown in the approved
  reference design, which differ from the approved requirements
- Instagram / social account handle for the Home page showcase
- Legal review of the draft Privacy Policy and Terms & Conditions
- The founder's photograph for the About page (`lib/content/founder.ts`)
- Confirmation of the celebration categories and wording on the Services page
- Confirmation that venue and services may be left to the follow-up call (the simplified quote form)
- Testing on physical iOS and Android handsets. The mobile pass was verified in
  emulated viewports (iPhone 15, iPhone Pro Max, a 360px and a 320px Android,
  and landscape); the safe-area behaviour in particular can only be confirmed
  on a real notched device.
