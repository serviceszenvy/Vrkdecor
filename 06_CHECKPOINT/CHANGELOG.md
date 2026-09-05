# VRK Decor — Changelog

## 0.8.3 — 2026-09-05 — Mobile responsiveness and motion pass

A presentation-only release on top of 0.8.2, from the client's report that the
site read badly on an iPhone 15. No database change, no dependency added, no
business rule or security control altered. Every unit test, the full Playwright
suite and the production build pass unchanged.

Verified on an emulated iPhone 15 (393 x 852), Android (360 x 800), a 320px
handset, iPhone Pro Max (430 x 932) and a phone in landscape (852 x 393). No
page scrolls horizontally at any of them, no text renders below 12px, and no
console error is raised.

### Fixed — the iPhone-specific defects

- **`viewport-fit=cover` was never opted into** (`app/layout.tsx`), so every
  `env(safe-area-inset-*)` in the codebase resolved to zero. The sticky action
  bar's home-indicator allowance and the floating WhatsApp button's offset were
  therefore doing nothing on the device they were written for. The document now
  opts in, `app/globals.css` reads the four insets once into `--safe-*`, and
  every edge-anchored element spends them: the header (notch), the page gutter
  and the rounded panels (landscape notch, left and right), the action bar and
  the floating button (home indicator), and the lightbox.
- **`--mobile-cta-height` now includes the home-indicator inset**, so the last
  line of every page clears the action bar instead of sitting behind it.
- **`--header-height` was 4.5rem against a header that measures ~4.75rem**, so
  an anchored heading (`/services#occasions`) landed underneath it. It is now
  measured, and carries the notch inset.
- **Background scroll under the mobile menu and the lightbox.** `overflow:
hidden` on the body does not hold on iOS Safari; both now pin the body at its
  current offset and restore the scroll position on close.
- **Form fields are at least 16px on a phone**, which is what stops iOS zooming
  in on focus and never zooming back out. Zoom itself is deliberately not
  capped (WCAG 1.4.4).
- **`overflow-x: clip` on the root as well as the body**, so a decorative blob
  or a reveal that starts outside the viewport can never widen the document.
- **`next/image` with `fill` inside `ImageFrame`** had no positioned wrapper,
  which Next warns about and which leaves the image resolving against whatever
  ancestor happens to be positioned.

### Changed — the mobile layout

- **Vertical rhythm retuned for a handset.** The desktop steps are unchanged;
  the mobile ones are much tighter. Section padding, grid gaps, card padding
  and heading sizes all step up at `sm` rather than starting at desktop values.
  The home page is about 1,300px shorter and Our Work is 2,000px shorter.
- **Fluid type scale rebased.** `--text-3xl` through `--text-6xl` had mobile
  minimums drawn for a desktop; the hero headline rendered at 45px on a 393px
  screen. The desktop maximums are unchanged.
- **Hero actions stack full width on a phone** instead of sitting as two pills
  of different lengths on one ragged line.
- **The occasion grid is two across on a phone**, not three. At three the Tamil
  terms were breaking through the middle of a word ("Nichayathartha / m");
  `wrap-anywhere` has been replaced with ordinary wrapping and `hyphens: auto`.
- **The portfolio grid is two across on a phone.** A single column of 5:6 cards
  gave each design most of a screen. The card's type, chips and padding step
  down to match, and the "Featured" chip becomes the star it already means so
  it no longer pushes the occasion chip onto a second line.
- **The figures band stacks each cell** (plate above, figure and label below) on
  a phone, so the four cells are the same height and the longest label no
  longer wraps onto three lines.
- **Service, value and about cards are a row on a phone** — plate beside the
  copy rather than above it — so a list of six is not a screen of plates.
- **Touch targets.** Every footer link, the footer contact and legal rows, the
  developer credit and the contact-page channel links are now at least 44px
  tall. The consent checkbox is 24px on a phone.
- **Filter rails fade at their edges** on a phone, so it is visible that there
  are more chips past the screen edge.

### Added — motion

Everything below is disabled by `prefers-reduced-motion` and none of it is
required to read or use the page.

- **Reading progress and a header state** (`components/layout/scroll-progress.tsx`):
  one passive scroll listener drives a composited `scaleX` rail under the top
  edge and stamps `data-scrolled` on the document, which condenses the floating
  header. The rail is not rendered at all under reduced motion.
- **Scroll parallax** (`components/ui/parallax.tsx`) on the home and about
  photographs: transform only, coalesced into one animation frame per scroll
  burst, and stopped entirely by an `IntersectionObserver` while off screen.
- **Ken Burns** on the hero photograph, so the picture is never quite still.
- **Counting figures** (`components/ui/count-up.tsx`) in the figures band and
  the footer. The approved string is what renders on the server and
  `role="img"` with `aria-label` fixes the accessible name to it, so the
  animation can never change what the figure says.
- **Press feedback** (`.press`): a fast scale-down on coarse pointers only,
  because hover is a desktop idea and the press is the only moment a touch
  screen can answer back. Applied to every card, chip, tile and floating action.
- **A breathing ring** behind the WhatsApp action, painted behind the button's
  own background so it only shows once it has grown past the edge.
- **Menu choreography**: the trigger rotates, the sheet rises from the header
  edge, and the items still stagger in.

### Changed — motion, for phones

- **The reveal blur is a desktop refinement.** On a phone it forced a
  full-size offscreen buffer for every revealing section and nobody could see
  it at 393px, so below `sm` the reveal is opacity and a shorter travel only.
- **The sideways reveals collapse to the ordinary rise below `sm`.** 36px of
  horizontal travel inside a 393px viewport is a wasted gesture and a chance
  for the document to grow sideways mid-animation.
- **`touch-action: manipulation`** on every control, which removes Safari's
  300ms double-tap-to-zoom delay, and the default grey tap highlight is
  replaced by the deliberate press state.

### Not changed

- No migration, no schema change, no seed change.
- No Server Action, query, validator, storage helper or business rule.
- No dependency added or upgraded.
- No security control, authorization rule, RLS policy or upload check.
- No approved business fact, figure or claim.

## 0.8.2 — 2026-09-05 — UI/UX refinement v2 (public website)

A presentation and content release on top of 0.8.1, from the client's
"Complete UI/UX, Content & Experience Refinement" brief. No database change,
no dependency added, no security control altered. One validation rule was
relaxed to match the simplified form (see Changed). The Admin Panel is
untouched.

### Added

- **A dark layer on the light site.** `surface-deep` (#37432b, the logo's own
  olive), `surface-deeper`, `ink-on-deep`, dark glass (`.glass-surface-deep`),
  the `.surface-aurora` and `.surface-bloom` backgrounds, ambient blobs, dot
  patterns and lime gradient text. Six new contrast pairings in the contract.
- **A motion system.** `Reveal` (`components/ui/reveal.tsx`) plus CSS: scroll
  reveals with rise / scale / left / right / mask effects, staggered entrances,
  page transitions (`app/(site)/template.tsx`), ambient drift, floating chips,
  hover lift and light sweep, the `.icon-deep` glow, accordion expansion and
  lightbox entrances. Hidden states apply only under `@media (scripting:
enabled)`; `prefers-reduced-motion` stills everything.
- **Home: four signature cards** (`SignatureGrid`, 2 × 2 on desktop, 2 columns on
  tablet, 1 on a phone) including a birthday celebration; the sample birthday
  design is featured and rewritten.
- **Our Work: accordion filters** (`FilterBar`): All plus the most popular
  occasions, then "More occasions" revealing the rest and the style and service
  rows. Popularity comes from published-design counts (`listFilterOptions` now
  returns counts). The selected filter is always visible.
- **Previous / Next work navigation** (`WorkNav`) with a counter on every
  design page, wrapping at both ends.
- **Services page rebuilt** with the twelve approved services in three groups
  and a grouped "Occasions we decorate" section (`lib/content/services-page.ts`),
  seventeen new distinctive icons, and a chip row of all fourteen approved
  occasions with their Tamil terms.
- **Gallery** as a masonry wall on the deep surface with hover chips and no
  captions; **lightbox** redesigned with a blurred colour stage, glass bar and
  "Get a Quote for this design" carrying the design and the photograph.
- **Quote flow**: `EnquiryOptions` (WhatsApp / Call / Send an enquiry as
  alternatives), a redesigned `CapturedDesign` panel, and the WhatsApp message
  now carries the design page URL (`absoluteDesignUrl`).
- **About page** rebuilt: editorial hero, figures, story split, philosophy,
  Founder & CEO section (`lib/content/founder.ts`, `FounderPortrait` with a
  designed placeholder), a timeline and Where We Create.
- **Where We Create** (`ServiceArea`): location chips and a map-inspired
  drawing, on the Home, About and Contact pages.
- **Zenvy** in the footer links to https://serviceszenvy.wixsite.com/home.

### Changed

- **Home hero** fits the first desktop viewport (`100svh` minus header, capped
  and floored) with a tighter header; grows naturally below `lg`.
- **Every inner-page hero, the value band, the closing call to action and the
  footer** now sit on the deep olive surface.
- **The quote form** asks for name, phone, event type, event date, location and
  a message, with email and reference images behind "Add more details".
  `venue` is optional and `requiredServices` may be empty in
  `lib/validation/enquiry.ts`; both database columns already allowed it.
- **Contact page** is one enquiry experience: "Let's plan your celebration",
  the three options, the studio details, Where We Create and the embedded form.
  Rendered per request.
- **Quote CTAs rationed**: at most two strong quote actions in a page body.
  Inner-page heroes point at the work instead.
- **Navigation**: Occasions removed from the primary navigation; `/occasions`
  redirects permanently to `/services#occasions`.
- **Buttons** gained `lime`, `deep` and `glass-deep` variants and a hover lift;
  badges gained `lime` and `deep`; `IconChip` gained `deep`, `lime` and
  `glass-deep`; `Section` gained `panel-deep` and `panel-bloom`.
- **Occasion, service and stat icons** now use the dark olive disc with a lime
  ring.

### Removed

- `app/(site)/occasions/page.tsx`. The content lives on Services.
- The `DesignRail` is no longer used on the home page (the file remains).

### Tests

- Unit: 373 (was 364). Validation tests updated for the optional venue and
  services; new tests for the retired route, the service grouping's honesty
  and the celebration links.
- End-to-end: 240 (was 238), all passing on desktop and mobile Chrome.
  Updated for the simplified form, the new Services structure, the redirect,
  the lightbox wording and the Zenvy link.

## 0.8.1 — 2026-09-01 — Visual redesign (public website and Admin Panel)

A design-only release. No database change, no business logic change, no
dependency added, no security control altered. The Prompt 8 codebase is the
baseline; every feature it delivered still works and is still proven by the same
tests.

### Added

- **Glassmorphism tokens and primitives.** `glass` in `lib/design-tokens.ts`,
  mirrored into `app/globals.css` as `--glass-*`, plus `.glass-surface`,
  `.glass-surface-strong`, `.glass-surface-tint` and `.glass-edge`. The
  translucent values live inside an `@supports (backdrop-filter)` block, so a
  browser without blur gets a readable near-opaque panel rather than text on a
  photograph. The blur radius is capped at 24px and a test enforces it.
- **New surface tokens** for the redesign: `canvas` (the warm off-white page
  ground), `canvas-deep`, `surface-tint`, `ink-soft` and `line-soft`. Eight new
  pairings were added to the contrast contract, all measured and passing.
- **New primitives.** `GlassPanel`, `IconChip`, `LeafRule` (`components/ui`),
  `LeafDecor`, `HomeHero`, `StatBar`, `ValueBand`, `OccasionGrid`,
  `serviceIcon` (`components/page`), `DesignRail` and `WhatsAppFab`.
- **A floating WhatsApp action** on every page at every size, offset above the
  mobile action bar so the two never overlap.
- **An icon family** of roughly twenty inline SVG glyphs in
  `components/layout/icons.tsx`, one per occasion and one per service. No icon
  dependency was added.
- **`lib/content/hero-media.ts`**, the single replacement point for the approved
  hero photograph when it is supplied.
- **`scripts/generate-sample-images.py`**, which regenerates the placeholder
  imagery. The 24 portfolio placeholders were regenerated in the brand's green
  and ivory palette and a hero placeholder was added.

### Changed

- **The public site** now composes as rounded panels floating on a warm
  off-white ground rather than full-bleed alternating bands.
- **Header.** A floating, rounded, translucent container over the hero, with a
  current-page indicator, a phone action and "Get a Quote". `headerNav` adds Home
  in front of the approved primary navigation.
- **Mobile navigation** is a rounded glass sheet with a current-page state. Its
  focus trap, Escape handling, portal, scroll lock and route-change close are
  unchanged.
- **Home page** rebuilt: photographic hero with a floating assurance panel, a
  glass figures band, a featured-work rail, the value band, an occasion icon
  grid, services, how it works, testimonials and a botanical closing action.
- **Portfolio cards** are photography first: a tall image, a glass occasion chip
  and the design name in a scrim. The design detail page now leads with its
  cover photograph.
- **Footer** is light and four-column, and carries "Developed with love by
  Zenvy".
- **Primary button colour** moved from `brand-800` to `brand-700`, the sage
  measured in the logo itself. White on it is 5.00:1. Every action is a pill.
- **The mobile action bar** carries Call and Get Quote. WhatsApp moved to its own
  floating action rather than being repeated.
- **The Admin Panel** gained a glass sidebar at `lg` and a compact bar below it,
  brand-consistent cards, filter chips, list rows and form controls. Tables and
  enquiry rows are deliberately opaque: no blur behind data anyone has to read.
- **Customer facing copy rewritten** across every page. No em dashes, no
  semicolons and no plus signs in marketing sentences; no claim that is not
  supported by the approved requirements.

### Fixed

- Definition lists in the figures band, the credential list and the footer no
  longer repeat their label in a visually hidden element, which a screen reader
  read twice.
- Occasion labels with a long Tamil term no longer overflow their tile.

### Not changed, deliberately

- The Design entity, its cover and related images, the parent relationship,
  filters, gallery, lightbox, and both the design-level and photo-level quote
  routes.
- Supabase architecture, RLS, storage policies, authentication, authorization,
  server-side validation, rate limiting and private reference-image handling.
- The approved business facts. The reference design shows a phone number, an
  email address and opening hours that differ from the approved requirements;
  the approved values were kept and no opening hours were invented.

## 0.8.0 — 2026-09-01 — P8 Admin Panel

### Added

- **The Admin Panel** at `/admin`, behind Supabase Auth, with a shell of its own:
  overview, enquiries, designs, packages, testimonials, and occasions/styles/
  services.
- **Authentication.** `/admin/login` signs in through Supabase Auth as a Server
  Action, rate limited per client and per email address, answering every failure
  with one message so the form cannot be used to discover which addresses exist.
  Sign-out clears the session.
- **Design management.** Create, edit, publish, unpublish and archive. Occasion,
  styles, services, location, description, featured flag, pricing mode, starting
  price and SEO fields. A design cannot be published without a cover image.
- **Media management.** Upload cover and related images, set the cover, reorder
  with move up / move down, edit alt text per image, delete an image, and add or
  remove provider video links.
- **Two database functions**, `set_design_cover` and `move_design_image`, so a
  cover change and a reorder each happen in one transaction. Both are SECURITY
  INVOKER, so Row Level Security applies inside them.
- **Occasions, styles and services management**, including the Tamil secondary
  term and the partner-vendor delivery model. Terms are deactivated, never
  deleted.
- **Packages and testimonials management.** A package starts as a draft and a
  testimonial as pending, so nothing reaches the public site without a
  deliberate act.
- **The enquiry inbox.** List and filter by pipeline step, open one lead, move it
  through the approved pipeline, write internal notes, view the customer's
  private reference images through five-minute signed URLs, and call or WhatsApp
  the customer with the message already written.
- **`lib/validation/admin.ts`** — the input contract for every admin form, and
  **`lib/slug.ts`** — generated, never accepted, URL slugs.
- **`lib/uploads/portfolio-images.ts`** — portfolio uploads through the same
  content-validating gate as customer uploads, with the portfolio bucket's own
  ceilings.
- **`lib/storage/portfolio-upload.ts`** — writes portfolio objects as the CALLER,
  so the storage policy applies as well as the guard.
- **59 new unit tests**, **31 new database tests** and **36 new end-to-end
  tests** covering the authorization guard on every page and action, RLS for
  every administrative statement as four kinds of caller, storage access, admin
  input validation, and what an unauthenticated visitor can reach.

### Changed

- **Public pages moved into an `app/(site)` route group** so the Admin Panel can
  have a shell of its own. A route group adds no URL segment: every public route
  is exactly where it was, and the end-to-end suite asserts the chrome is
  unchanged. `app/not-found.tsx` renders that chrome itself, being outside the
  group.
- `app/layout.tsx` now carries the document only; the public chrome lives in the
  new `SiteChrome` component.
- `lib/auth/admin.ts` — `getCurrentAdmin()` returns null instead of throwing when
  Supabase is unconfigured, and `requireAdminContext()` returns the guard's
  identity together with the session client its queries must use.
- `lib/storage/urls.ts` — `createReferenceSignedUrl` now takes the Supabase
  client as a required argument, so the Admin Panel signs with its own session
  and the storage policy applies too.
- `lib/uploads/reference-images.ts` — the per-file gate generalised so the
  customer and admin upload paths share one implementation and differ only in
  their bucket, ceilings and wording.
- `lib/navigation.ts` — `customerTelHref`, `customerWhatsAppHref` and
  `adminFollowUpMessage` for reaching a customer from the inbox.
- `next.config.ts` — `images.remotePatterns` scoped to the configured Supabase
  host and the PUBLIC portfolio path only, and `X-Robots-Tag: noindex` plus
  `Cache-Control: no-store` on every `/admin` response.
- `lib/db/types.ts` — the two new database functions declared.
- `tests/db/helpers.ts` — a style fixture, used by the new admin suite.
- `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/TESTING.md`,
  `features/admin/README.md`, `09_DECISIONS/DECISIONS.md`.

### Security

- Every admin page and mutation applies TWO checks: `requireAdmin()`, and the
  caller's own session client so Row Level Security decides row by row.
- **The service-role client is used nowhere in the Admin Panel**, asserted by a
  test. Using it would leave the guard as the only check standing.
- Every administrative statement is tested as an active admin, a disabled admin,
  a signed-in customer and an anonymous visitor.
- Disabling an admin takes effect on the very next request.
- Nobody can grant themselves admin rights, active admins included. P8 also
  revokes the INSERT, UPDATE and DELETE privileges Supabase grants
  `authenticated` on `admin_users` by default, which no policy allowed but which
  should not be there.
- Admin forms are parsed by schemas that read only the fields they declare, so
  `status`, `published_at`, `created_at` and identifiers cannot be smuggled in.
- Slugs are generated; video URLs must be HTTPS and belong to the provider
  chosen; money is whole rupees in and paise out.
- Only `status` and `internal_notes` of an enquiry are ever writable, and no
  browser session can create one.
- Private reference images are read under RLS, signed with the admin's own
  session for five minutes, and rendered with a plain `<img>` so the image
  optimiser never caches a customer's photograph.
- No admin page is indexable or cacheable, and the public site links to `/admin`
  from nowhere.

### Unchanged deliberately

- **No internal notification email to VRK Decor.** The Admin Panel is the
  internal enquiry inbox, which is why its overview leads with new enquiries.
  `tests/unit/enquiry-no-internal-email.test.ts` still passes unchanged.
- **No dependency was added.**

## 0.7.0 — 2026-09-01 — P7 Uploads, Customer Email & WhatsApp

### Added

- **Private reference-image uploads** on the quote form. Up to three inspiration
  images per enquiry (JPG, PNG or WEBP, 5 MB each), written to the private
  `references` bucket under a server-generated key and never publicly readable.
  The control is a plain file input, so it works with JavaScript disabled.
- **`lib/uploads/`** — secure upload validation. `image-signature.ts` reads magic
  bytes and header fields to report what a file actually is and how large its
  canvas is, parsing headers only and never decoding pixel data.
  `reference-images.ts` applies count, size, declared-type, CONTENT and dimension
  checks, and sanitises the filename for display. No dependency was added.
- **Dimension limits**, the open decision carried since P3: 200 px minimum per
  edge, 12000 px maximum per edge, 40 megapixels overall, so a decompression
  bomb is refused before it can be stored.
- **`lib/storage/reference-upload.ts`** — writes validated images to the private
  bucket with `upsert: false`, using the type proven by the bytes, and removes
  objects that were uploaded but could not be recorded.
- **`lib/email/`** — the customer confirmation. `confirmation-message.ts`
  composes it (pure, no I/O), `transport.ts` sends it over a provider-agnostic
  HTTPS JSON API described entirely by environment variables, and
  `send-confirmation.ts` orchestrates and never throws.
- **`features/enquiries/confirmation.ts`** — sends the confirmation only after
  the enquiry is stored, and writes `confirmation_email_sent_at` only when the
  provider accepted the message.
- **WhatsApp and phone continuation.** Prefilled click-to-chat links on the quote
  page, the confirmation page, the confirmation email, and inside the error
  summary when a submission fails or is throttled — the moment a customer is
  most likely to give up. Messages are built server-side from public content
  only.
- **`EMAIL_PROVIDER_API_URL`** in the environment contract and `.env.example`.
- **111 new unit tests**, **15 new database tests** and **42 new end-to-end
  tests** covering content-based file validation, decompression bombs, the
  three-image ceiling, private-image exposure, email composition and failure
  handling, ordering guarantees, continuation links and no-JavaScript uploads.
- **Real image fixtures** in `tests/fixtures/images/`, produced by a real
  encoder, so the header parser is verified against genuine files rather than
  against bytes written to satisfy it.

### Changed

- `features/enquiries/actions.ts` — files are validated before the throttle (so
  a rejected attachment cannot consume the duplicate window), the enquiry is
  persisted, then images are uploaded, then the confirmation is attempted, then
  the redirect carries the design slug and the honest outcome flags.
- `features/enquiries/data.ts` — uploads and links reference images after the
  enquiry row exists; adds `markConfirmationEmailSent`.
- `app/quote/submitted/page.tsx` — reads `design`, `email` and `images` flags,
  offers both continuation channels, and promises a confirmation email only when
  one was actually accepted.
- `features/enquiries/components/quote-form.tsx` — the reference-image field,
  `multipart/form-data`, an honest email hint, and continuation links in the
  error summary.
- `features/portfolio/image-url.ts` — refuses to build a public URL from a
  private reference key.
- `lib/navigation.ts` — `whatsAppHrefWithMessage` and the two message builders.
- `next.config.ts` — `serverActions.bodySizeLimit` raised to 16 MB for three
  5 MB images; every other limit is unchanged and re-applied server-side.
- `vitest.config.mts` — `server-only` resolves to the package's own empty build
  so server modules can be unit-tested. `next build` still applies the real
  marker, and `npm run verify:bundle` independently proves nothing leaks.
- `.env.example`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/TESTING.md`,
  `docs/ENVIRONMENT.md`, `features/enquiries/README.md`,
  `09_DECISIONS/DECISIONS.md`.

### Security

- Files are validated by their bytes, not their labels: an SVG, HTML page, PHP
  script, ZIP, GIF, PDF or a file that merely begins with JPEG magic bytes is
  refused however it is named or labelled, and so is a genuine PNG announced as
  a JPEG.
- Storage keys stay server-generated and random; the customer's filename is
  display metadata and appears in no key.
- No code path can build a public URL for a reference image, and the Admin
  Panel's summary carries a count rather than a key.
- The enquiry is persisted before any upload or email is attempted. Neither can
  fail the request, and a partial upload is reported to the customer plainly.
- The confirmation email has exactly one recipient, the customer. VRK Decor is
  never notified by email; `Reply-To` delivers nothing unless the customer
  writes. The message carries no signed URL, storage key, price, tracking pixel
  or state-changing link.
- Email transport is HTTPS-only, timeout-bounded, and never logs the recipient,
  the message or the API key.
- Prefilled WhatsApp messages carry public content only and cannot be redirected
  through their own text.

### Unchanged deliberately

- **No internal notification email to VRK Decor.** The Admin Panel remains the
  internal enquiry inbox, and `tests/unit/enquiry-no-internal-email.test.ts`
  still passes unchanged.
- **No new dependency**, and **no new migration** — P3 created
  `reference_images` and `enquiries.confirmation_email_sent_at` with exactly the
  columns and constraints this phase consumes.

## 0.6.0 — 2026-09-01 — P6 Quote Engine

### Added

- **Quote engine** (`features/enquiries/`): the complete Get Quote workflow from
  a Design or from an individual portfolio photograph, with the parent Design
  captured automatically and never re-selected by the customer.
- **`/quote`** — the enquiry form. Reached three ways, all one page: the
  site-wide CTA (`/quote`), a design-level CTA (`/quote?design=<slug>`) and a
  photo-level CTA (`/quote?design=<slug>&photo=<image id>`).
- **`/quote/submitted`** — a `noindex` confirmation page carrying no enquiry
  identifier, so a refresh cannot resubmit and there is nothing to guess or
  share.
- **`quote-context.ts`** — the single path by which a Design enters a quote. It
  resolves the slug server-side against published designs only, accepts a
  photograph only when it belongs to that Design, and is run again on submit.
- **`lib/validation/enquiry.ts`** — the field contract from Requirements section
  11: name, phone, event type, event date, venue, city, required services and
  consent required; email, guest count, budget and notes optional. Closed
  vocabularies for event type and services, E.164 phone normalisation, event
  dates judged in the business timezone, and control/zero-width character
  stripping.
- **`submitQuoteRequest`** — a Server Action, so the request Origin is verified
  before it runs and the form works with JavaScript disabled.
- **`lib/rate-limit.ts` and `features/enquiries/throttle.ts`** — per-client,
  per-phone and per-request limits, with duplicate submissions absorbed rather
  than turned into a second lead.
- **Reference-image relationship**: up to three private images per enquiry,
  validated in `referenceImagesSchema`, capped again in `linkReferenceImages`
  and enforced by the existing database trigger. The upload itself is P7.
- **`listEnquiries`** — the Admin Panel's inbox query, running as the caller so
  Row Level Security decides. P8 renders it.
- **Migration `20260901090000_enquiry_source_image.sql`** — nullable
  `enquiries.selected_image_id` with `ON DELETE SET NULL`, recording which
  photograph started the quote, plus a trigger refusing any photograph that does
  not belong to the enquiry's own Design.
- **Local in-memory enquiry store**, active only when Supabase is unconfigured
  and labelled on the page, so the flow is demonstrable and testable before a
  Supabase project exists.
- **82 new unit tests**, **18 new database tests** and **48 new end-to-end
  tests** covering validation, design capture, tampered parameters, throttling,
  the full Design → Photo → Quote → Enquiry journey, no-JavaScript operation and
  the absence of any internal email path.

### Changed

- `lib/db/types.ts` — `EnquiryRow.selected_image_id`.
- `tests/db/schema-types.test.ts` — the new column declared, keeping the
  schema-drift guard honest.
- `tests/db/supabase-shim.sql` — `service_role` now receives the table
  privileges real Supabase grants it, without which the service-role write path
  could not be tested.
- `tests/e2e/public-pages.spec.ts` — the `/quote` exclusion removed; every
  footer link now resolves.
- `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/SECURITY.md`,
  `features/enquiries/README.md`.

### Security

- Server-side validation on every field, with the parser reading only the fields
  it declares — `status`, `internal_notes`, `confirmation_email_sent_at` and
  `selected_design_id` cannot be set from a public request.
- The parent Design is re-resolved server-side on submit, so a tampered hidden
  field can at most substitute another published Design.
- A draft, archived, deleted and invented slug are answered identically.
- CSRF/request integrity through Server Actions; no public JSON endpoint exists.
- Rate limiting on the first anonymous write surface, with client keys hashed.
- Storage failures log a fixed message, never the error object or the customer's
  values.

### Explicitly not done

- **No internal email to VRK Decor**, in line with Requirements section 11. A
  unit test scans the quote sources for mail transports, `mailto:`, the business
  address and notification environment variables and fails if any appears.
- Reference-image upload, the customer confirmation email and WhatsApp
  instrumentation remain P7. The Admin Panel screens remain P8.

## 0.5.0 — 2026-08-31 — P5 Portfolio

### Added

- **Portfolio feature** (`features/portfolio/`): published-only reads of the
  full design tree (occasion, styles, services, images, videos), filter options
  derived from designs that actually exist, and view models that make the parent
  relationship structural.
- **Design listing** at `/our-work` with occasion, style and service filters as
  query-parameter links — shareable, keyboard-navigable and working with
  JavaScript disabled.
- **Design detail** at `/our-work/[slug]`: parent metadata shown once, ordered
  gallery, optional video, per-design SEO metadata, and a 404 for any unknown,
  draft or archived slug.
- **Gallery** at `/gallery` showing every published photograph, each carrying
  its parent Design.
- **Lightbox**: a modal dialog with focus trap, Escape with focus return,
  arrow-key navigation, wrap-around, horizontal swipe that ignores vertical
  intent, and body scroll locking; portalled so no stacking context traps it.
- **Featured designs** ordered first in the listing and on the Home page.
- **Design-level and photo-level Get Quote CTAs**, both always carrying the
  parent Design.
- **Optional video/reel**, URL-only, embedded through `youtube-nocookie.com` for
  recognised providers and degraded to a plain link otherwise.
- **Sample portfolio content**: 6 designs and 24 procedurally generated
  placeholder images, active only when Supabase is unconfigured and labelled on
  every portfolio surface.
- `lib/db/with-timeout.ts` — bounded public reads.
- **19 new unit tests** and **38 new end-to-end tests** covering parent
  resolution, filters, gallery, lightbox, swipe, video, sample safety and image
  rendering; **3 new database tests** for portfolio tree visibility under RLS.

### Changed

- Home, Our Work and Gallery now render real portfolio data with cover images.
- `next.config.ts`: WebP-only output and image candidate widths capped at 1920
  (see Fixed).
- `playwright.config.ts`: explicit worker policy and test timeout.
- `lib/db/public-content.ts`: reads bounded by a timeout.
- Page-wide end-to-end tests block image optimisation, which is irrelevant to
  their assertions and dominated their runtime.

### Fixed

Found by inspecting rendered pages and by writing an assertion that images
actually decode:

- **A design card's stretched link covered unrelated page content.** The card
  had no positioned ancestor, so `after:inset-0` expanded to the nearest one and
  silently swallowed clicks on the filters.
- **Public reads could hang a page render.** A slow or unreachable database had
  no timeout; reads now degrade to fallback content instead.
- **Images could be served with a 200 and still never render.** On-demand AVIF
  encoding was slow enough on a small machine to exceed navigation timeouts, and
  an uncapped 3840 candidate let the browser request an upscale of a portrait
  source to roughly 20 megapixels, which a mobile browser refuses to decode.
  WebP-only output and a 1920 cap fixed both; six cold 1080px images now
  optimise in 0.58s. The end-to-end suite went from 9.2 minutes to 42 seconds.
- **An image-decode assertion was itself wrong**: checking every image at the
  end of a long scroll reported healthy images as broken, because browsers
  abandon in-flight lazy loads that leave the viewport. It now asserts images
  decode while they are in view.

### Portfolio rules enforced

- A Design is the parent entity; no duplicate Design record is created for a
  related photograph.
- A photograph cannot be represented, rendered, linked or quoted without its
  parent — `PortfolioPhoto` is `{ image, design }` by construction.
- Every quote link carries the design; the photo id is optional context only.
- Only published Designs are publicly visible, and RLS hides every child row of
  an unpublished parent so media cannot leak through a join.
- Related images inherit the parent's occasion, styles, services, location and
  description; only alt text is overridden per image.

### Verification

`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (93),
`npm run test:db` (61), `npm run test:e2e` (110), `npm run build`,
`npm run verify:bundle` and `npm audit --audit-level=high` all pass. Renderings
of the listing, detail, gallery, lightbox and mobile views were inspected.

### Not included

Quote form and enquiry submission (P6); reference uploads, email and WhatsApp
instrumentation (P7); admin panel (P8); sitemap, robots, structured data and
analytics (P9). `/quote` still returns 404.

## 0.4.0 — 2026-08-31 — P4 Public Website

### Added

- **Ten public pages**, all statically rendered: Home, Our Work, Services,
  Occasions, Packages, Gallery, About, Contact, Privacy Policy and Terms &
  Conditions.
- **Home page** covering the Requirements section 7 checklist: hero with
  Explore Our Work and Get a Quote, credentials, featured occasions, featured
  designs, browse by style, services overview, Why Choose VRK Decor, How It
  Works, testimonials and a final CTA.
- **Content layer** (`lib/content/`) carrying only requirements-derived copy —
  positioning, credentials, coverage, journey steps, and the approved 14
  occasions, 12 services and 10 styles, with partner-vendor delivery marked.
- **Database-optional reads** (`lib/db/public-content.ts`): pages prefer
  Supabase rows so VRK Decor's admin edits win, fall back to approved content,
  and never throw. The site renders fully with no database configured.
- **SEO foundations** (`lib/seo.ts`): a unique title and description per page,
  canonical URLs and Open Graph tags.
- **Page components** (`components/page/`): `Hero`, `CtaBand`, `StatList`,
  `EmptyState` and `DraftNotice`.
- **13 new unit tests** asserting the approved figures and positioning verbatim,
  catalogue parity between the content module and the seed migration, and the
  absence of superlative or pricing claims.
- **46 new end-to-end tests** covering every route, unique metadata, canonical
  and Open Graph tags, heading structure, navigation and footer link integrity,
  partner-vendor labelling, contact details, draft notices, horizontal-overflow
  freedom at 390px and the sticky action bar.
- `docs/CONTENT.md` recording where every piece of content comes from and what
  still needs client approval.

### Changed

- `app/page.tsx` replaced the P2 shell placeholder with the real Home page.
- Page titles are concise and the root layout's template appends the brand; the
  Home page supplies an absolute title because Next.js does not apply the
  template to the root segment.
- Documentation updated: `docs/README.md`, `ARCHITECTURE.md`, `TESTING.md`.

### Fixed

Found by inspecting the rendered pages rather than by a failing test:

- The hero media collapsed to zero width. A grid item that is only
  `justify-self-end` shrinks to its content, which collapses a percentage-width
  child; the wrapper now sets `w-full`.
- The Home page title lost the brand entirely, because Next.js does not apply a
  layout's title template to the root segment.
- The hero placeholder gradient was so pale it read as a broken image. It is now
  a deliberate brand panel, hidden below `lg` where it would only push content
  down.

### Content integrity

- Approved figures (14+ years, 600+ events, 35+ team) are printed exactly and
  never rounded; tests fail if they change.
- No superlative, ranking or guarantee claim appears anywhere, checked in unit
  tests and in the rendered pages.
- Partner-vendor delivery is displayed rather than hidden, as the requirements
  demand.
- Prices come only from admin-entered package rows; no budget range is shown and
  the site performs no pricing arithmetic beyond paise-to-rupee conversion.
- Sections with no approved content show honest empty states. The social/
  Instagram showcase and before/after sections are deliberately not built,
  because no handle and no pairs have been supplied.
- The two legal pages are drafted from the site's real data handling and carry a
  visible draft notice pending review.

### Verification

`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (74),
`npm run test:db` (58), `npm run test:e2e` (72), `npm run build` (12 routes),
`npm run verify:bundle` and `npm audit --audit-level=high` all pass. Desktop and
mobile renderings were captured and inspected.

### Not included

Portfolio filters, design detail pages, gallery lightbox and photo-level quote
CTAs (P5); the quote form and enquiry submission (P6); uploads, email and
WhatsApp instrumentation (P7); admin panel (P8); sitemap, robots, structured
data and analytics (P9). `/quote` still returns 404 and is implemented in P6.

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
