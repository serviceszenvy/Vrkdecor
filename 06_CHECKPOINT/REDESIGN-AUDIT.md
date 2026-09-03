# VRK Decor — Redesign Audit (Stage 1)

Date: 2026-09-01
Baseline: Prompt 8 (Admin Panel) — verified before any change was written.

| Baseline check      | Result                                  |
| ------------------- | --------------------------------------- |
| `npm run lint`      | PASS                                    |
| `npm run typecheck` | PASS                                    |
| `npm test`          | PASS — 27 files, 350 tests              |
| `npm run build`     | PASS — 24 routes, 6 design pages, proxy |

Nothing in this audit was inferred from the checkpoint alone. Every statement
below was read out of the working tree.

---

## 1. What was read

`CLAUDE.md`, `README.md`, `05_PROMPTS/01`–`08`, `06_CHECKPOINT/PROJECT-CHECKPOINT.md`,
`06_CHECKPOINT/CHANGELOG.md`, `09_DECISIONS/DECISIONS.md`, `docs/DESIGN-SYSTEM.md`,
the supplied logo (`public/brand/vrk-decor-logo.png`, 1120x677 RGBA with a real
alpha channel), the desktop reference image, the mobile reference image, and the
whole of `app/`, `components/`, `features/` and `lib/` (about 14,900 lines).

The three source `.docx` specifications are binary; their approved facts are
already distilled into `lib/site-config.ts`, `lib/content/business.ts` and
`lib/content/catalog.ts`, each of which cites the section it comes from and is
guarded by `tests/unit/content.test.ts`, `catalog-parity.test.ts` and
`site-config.test.ts`. Those files are treated as the functional source of
truth for business facts.

---

## 2. Public website audit

### 2.1 Visual

The current site is a competent, conventional marketing layout. It is not
premium, and it is not the reference.

- **No photography anywhere above the fold.** The home hero renders a flat green
  gradient panel, and that panel is `hidden` below `lg`, so a phone visitor gets
  a text block on a pale grey band. The reference is photography first.
- **No glass anywhere.** One `backdrop-blur-sm` on the header and one on the
  mobile bar. No translucent surfaces, no layered depth, no soft borders.
- **Header is a full-width bar with a bottom hairline.** The reference wants a
  floating, rounded, translucent container hovering over the hero.
- **No active navigation state.** `site-header.tsx` renders seven identical
  links; nothing tells the visitor where they are.
- **Radii are small and uniform** (`--radius-lg` = 14px on every card). The
  reference reads at 20–32px with a clear hierarchy between panel, card and chip.
- **Sections alternate white and #F7F7F5 in flat full-bleed bands.** The
  reference composes stacked rounded panels floating on a warm off-white ground.
- **Elevation is nearly invisible** — two shadow tokens, both very tight.
- **Colour is used sparingly and mostly as text.** No green-tinted surfaces, no
  soft brand washes, no accent chips. The palette itself is good and correctly
  measured from the logo; it is simply under-used.
- **The footer is a dark slab** (`sand-950`) carrying the logo on a white plate,
  because the supplied artwork is drawn for light backgrounds. The reference
  footer is light, four-column, and lets the logo sit naturally.
- **Portfolio cards are text-heavy**: a 4:3 image, then a white body with badges,
  a title and a meta line. The reference is a tall image with a single small
  occasion chip and almost nothing else.
- **CTA is a dark inverse band** with three same-weight buttons. The reference is
  a soft green panel with botanical decoration and one clear primary action.

### 2.2 UX

- The home page runs **eleven stacked sections** in the same rhythm. There is no
  pacing, and the featured work sits fifth.
- **Occasions and styles are rendered as flat badge clouds** — 14 and 10 pills in
  a row. They read as tags, not as an invitation.
- **`StickyMobileCta` and the header CTA both exist**, but there is no persistent
  WhatsApp action on desktop at all, even though WhatsApp is the approved primary
  continuation channel.
- The **`ImageFrame` hover zoom** is the only interaction feedback on the site.
- **Filter chips on Our Work** are three unlabelled rows of pills that push the
  grid below the fold on mobile.

### 2.3 Content

The existing copy is accurate and carefully grounded, which is its strength; it
is also flat, and in places it explains the software rather than talking to a
customer.

- `"Celebrations designed with care, across Tamil Nadu"` — serviceable, generic.
- `"Every design can start a quote request — you never have to describe it twice."`
  is a sentence about the form, on a portfolio page.
- `"Request a quote. Send an enquiry from any design or photograph. The design you
chose is captured automatically"` — internal mechanics, customer facing.
- Em dashes appear in customer facing copy in at least nine places
  (`home`, `our-work`, `gallery`, `quote`, `about`, `packages`, `contact`,
  `design detail`, `cta-band`). The redesign brief forbids them.
- `whyChooseUs` reads as a fact sheet (`"A team of 35+"`) rather than a benefit.
- Empty states are honest and well written; they are worth keeping in substance.

### 2.4 Responsive

- The hero image panel is hidden below `lg` — the mobile hero has no visual.
- `Container` is `max-w-7xl` with `px-5`, so mobile gutters are tight while
  desktop is wide; the reference has generous, even inset on both.
- Vertical rhythm is the same on both (`py-14 sm:py-20`), so mobile pages are
  long and airy in the wrong places.
- The mobile nav panel is a plain white sheet pinned under the header.
- The mobile sticky bar is a three-column grid of small ghost buttons.
- No horizontal-scroll gallery rail; the mobile portfolio is a 2-up grid.

### 2.5 Typography

`--font-display` is a local serif stack (Iowan Old Style / Palatino / Georgia)
and `--font-sans` is `system-ui`. No webfont is loaded, deliberately: typeface
selection and licensing are a recorded open decision, and the project must not
depend on a third-party font request. The scale itself is a good fluid clamp
scale. What is missing is hierarchy in _use_ — headings, eyebrows and card
titles are all `font-medium`, and letter spacing is one global `-0.01em`.

### 2.6 Components

| Component                                            | Verdict                                                                                                                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button` / `ButtonLink`                              | **Reuse, restyle.** API is good (variant, size, fullWidth, external handling, 44px floor). Needs pill radius, a glass variant, an icon slot. |
| `Card` / `CardBody` / `CardTitle`                    | **Reuse, restyle.** Needs larger radii and a glass variant.                                                                                  |
| `Container`                                          | **Reuse, retune.** Widths and gutters change.                                                                                                |
| `Section` / `SectionHeading`                         | **Redesign.** Needs canvas and tint tones, panel mode, an accent word in the title and the centred leaf divider from the reference.          |
| `ImageFrame` / `ImageScrim`                          | **Reuse, extend.** Add portrait/tall ratios and larger radii.                                                                                |
| `Badge`                                              | **Reuse, extend.** Add a glass tone for on-image chips.                                                                                      |
| `SkipLink`                                           | **Unchanged.**                                                                                                                               |
| `Logo`                                               | **Unchanged artwork.** Wrapper sizing only.                                                                                                  |
| `icons.tsx`                                          | **Extend.** Five glyphs today; the reference needs roughly twenty.                                                                           |
| `SiteHeader`                                         | **Redesign.**                                                                                                                                |
| `MobileNav`                                          | **Redesign** — keep the focus trap, Escape handling, portal and route-change close verbatim.                                                 |
| `SiteFooter`                                         | **Redesign.**                                                                                                                                |
| `StickyMobileCta`                                    | **Redesign, keep the contract** (Call, WhatsApp, Get Quote, `data-testid`).                                                                  |
| `SiteChrome`                                         | **Extend** — add the floating WhatsApp action.                                                                                               |
| `Hero`                                               | **Redesign**, plus a new photography hero for the home page.                                                                                 |
| `CtaBand`                                            | **Redesign.**                                                                                                                                |
| `StatList`                                           | **Redesign** into the glass stat bar.                                                                                                        |
| `EmptyState` / `DraftNotice` / `SampleContentNotice` | **Reuse, restyle.** Their honesty is a feature.                                                                                              |
| `DesignCard` / `DesignGrid`                          | **Redesign** presentation only. `designHref` untouched.                                                                                      |
| `FilterBar`                                          | **Restyle.** Link-based, no-JS filtering must stay exactly as it is.                                                                         |
| `PhotoGallery` / `Lightbox`                          | **Restyle only.** Focus trap, arrows, swipe, portal and the photo-level quote CTA are untouchable.                                           |
| `VideoEmbed`                                         | **Unchanged** — provider allowlist is a security control.                                                                                    |
| `QuoteForm` and enquiry components                   | **Restyle only.**                                                                                                                            |
| `AdminShell` / `admin-ui`                            | **Redesign** presentation only.                                                                                                              |

### 2.7 Portfolio presentation

Architecturally correct and must not be touched:

- `Design` is the parent; `DesignImage` rows hang off it; the gallery is a
  flattening of parents (`toPhotos`).
- `designQuoteHref(slug, imageId)` always carries the parent design; the photo id
  is context only.
- `resolveQuoteContext` re-resolves and re-verifies the design server side, and
  `CapturedDesign` renders it read-only — there is no design selector on `/quote`.
- Only published designs are listed; RLS is the boundary and the query filter is
  defence in depth.

Presentation is the only weakness: 4:3 cards in a 3-up grid with heavy text
bodies, and no rail.

### 2.8 CTA presentation

`CtaBand` is a dark band with three equally weighted buttons (`Get a Quote`,
`WhatsApp us`, `Call us`), which flattens the primary action. The reference has
one primary and one secondary.

---

## 3. Admin Panel audit

### 3.1 Visual

- A `surface-subtle` top bar with a wordmark, the admin email, a "View site" link
  and Sign out, then a second row of underline tab links.
- Everything below is white cards with 14px radii and hairline borders.
- Stat tiles are plain bordered boxes; the highlighted one uses `accent-50`,
  which is the same treatment as the "sample content" warning on the public site.
- No brand presence beyond the wordmark. It does not read as the same product.

### 3.2 UX

- **Horizontal tabs do not scale.** Six sections already overflow on a phone into
  a horizontal scroller with no affordance.
- **No visible signed-in context** below `sm` (the email is `hidden sm:inline`).
- Lists are `<ul>` with divider rows rather than tables with headers, so scanning
  many enquiries is harder than it should be.
- Feedback banners are fine and correctly `role="alert"`.
- Forms are single-column, correctly labelled, with `aria-describedby` wiring and
  error summaries that link to the field. **This is good work and stays.**

### 3.3 Component structure

`AdminShell`, `AdminPageHeading`, `AdminCard`, `StatusBadge` (server) and
`Feedback`, `SubmitButton`, `Field`, `CheckboxGroup`, `echoed`/`echoedList`
(client). The split is clean. All of it can be restyled without touching a
single action or query.

### 3.4 Responsive

- The tab row overflows.
- Two-column form grids collapse correctly.
- The enquiry detail page stacks acceptably.
- Nothing is broken; nothing is designed for the small screen either.

---

## 4. Regression risks

| Risk                                        | Control                                                                                                                                                                    |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A guard is lost while moving admin markup   | `tests/unit/admin-authorization.test.ts` walks every admin page and action. Do not move code across the guard line.                                                        |
| A service-role import creeps into the admin | Asserted by the same test.                                                                                                                                                 |
| Public page h1 copy changes break E2E       | `tests/e2e/public-pages.spec.ts` pins every h1. Copy changes must update it in the same commit.                                                                            |
| Footer/shell contract changes break E2E     | `tests/e2e/shell.spec.ts` pins the footer phone link, WhatsApp href, sticky bar test id and mobile nav behaviour.                                                          |
| Design token drift                          | `tests/unit/design-tokens.test.ts` compares `globals.css` to `lib/design-tokens.ts` value by value and re-checks every contrast pairing. New tokens must be added to both. |
| Button variant classes                      | `tests/unit/ui-primitives.test.ts` asserts `primary` contains `bg-brand-800` and the 44px floor. Changing the primary colour means updating that assertion deliberately.   |
| Backdrop blur on long mobile pages          | Blur is capped and used on a small number of fixed or small surfaces only.                                                                                                 |
| `next/image` and private reference images   | Reference images must stay on plain `<img>`. Do not "tidy" them into `next/image`.                                                                                         |

### Must not be touched

Supabase clients and RLS, `requireAdminContext`, every file under
`features/admin/actions`, `features/enquiries/actions.ts`, `lib/validation/*`,
`lib/uploads/*`, `lib/storage/*`, `middleware.ts`, `next.config.ts` headers and
`remotePatterns`, the six migrations, `quote-link.ts`, `quote-context.ts`, the
provider allowlist in `VideoEmbed`, and the no-internal-email invariant.

---

## 5. Proposed design system

### 5.1 Colour tokens

The existing `brand` (sage/olive, anchored at `#61764B`) and `accent` (lime,
anchored at `#8EC840`) scales are already measured from the supplied logo and
are kept **unchanged** — they are exactly the "refined green palette derived
from the logo" the brief asks for. What is added is the surface layer the
reference needs.

| New token              | Value     | Role                                                              |
| ---------------------- | --------- | ----------------------------------------------------------------- |
| `--color-canvas`       | `#F5F7F1` | Page ground. Warm off-white with a green cast.                    |
| `--color-canvas-deep`  | `#EDF1E5` | Second ground for tinted bands.                                   |
| `--color-surface-tint` | `#ECF2E6` | Soft green panel (why-choose, contact card).                      |
| `--color-ink-soft`     | `#5B5C54` | Body text on tinted surfaces (4.5:1 fails there for `ink-muted`). |
| `--color-line-soft`    | `#E4E7DD` | Hairline on canvas.                                               |

Verified: ink on canvas 14.24:1, `ink-muted` on canvas 4.53:1, `brand-700` on
canvas 4.63:1, `ink-soft` on tint 5.9:1, white on `brand-700` 5.00:1. The primary
button moves from `brand-800` to `brand-700` to match the reference's mid-olive
and still clears AA at 5.00:1. Every pairing is added to `contrastContract` so
the existing test proves it.

### 5.2 Glass tokens

| Token                    | Value                                         |
| ------------------------ | --------------------------------------------- |
| `--glass-surface`        | `rgb(255 255 255 / 0.62)`                     |
| `--glass-surface-strong` | `rgb(255 255 255 / 0.82)`                     |
| `--glass-surface-tint`   | `rgb(236 242 230 / 0.72)`                     |
| `--glass-border`         | `rgb(255 255 255 / 0.55)`                     |
| `--glass-border-soft`    | `rgb(97 118 75 / 0.14)`                       |
| `--glass-highlight`      | inset top hairline, `rgb(255 255 255 / 0.65)` |
| `--glass-blur`           | `16px` (capped; `24px` only on the header)    |

Restraint rules: photography and content stay dominant; glass is used on the
header, the hero feature panel, the stat bar, on-image chips, the mobile sheet,
the floating actions and the admin sidebar — not on every card.

### 5.3 Radii, elevation, spacing

`--radius-md .5rem`, `--radius-lg .875rem` (kept), `--radius-xl 1.25rem`,
`--radius-2xl 1.75rem`, `--radius-3xl 2.25rem`, `--radius-pill 999px`.
Shadows: `--shadow-card` (kept), `--shadow-raised` (kept), `--shadow-glass`,
`--shadow-float` (fixed actions), `--shadow-panel` (stacked rounded panels).
Section rhythm gains a `panel` mode: rounded panels inset from the canvas with
`py-16 sm:py-20` inside and `gap-4 sm:gap-6` between.

### 5.4 Typography

Kept as local stacks. `--font-display` is retuned to lead with transitional
serifs that render as editorial on every platform, `--font-sans` gains
`Inter`/`Segoe UI Variable` ahead of `system-ui`. **No webfont is added**: the
typeface licence is an unresolved client decision, and a Google Fonts dependency
would be both a third-party request and a build-time network dependency on
Hostinger. Hierarchy is delivered through size, weight, tracking and colour:

`eyebrow` 12px / 600 / 0.2em caps / brand-700 · `h1` 5xl display 500 / -0.02em ·
`h2` 4xl display · section lead 18px `ink-muted` · card title 20px display ·
card body 14–15px · CTA 16px 500 · metadata 13px · footer 14px.

### 5.5 Component system

New: `GlassPanel`, `IconChip`, `FeaturePanel`, `StatBar`, `DesignRail`,
`OccasionGrid`, `ValueBand`, `LeafDecor`, `WhatsAppFab`, `NavLinks` (client, for
the active indicator), `AdminSidebar`, `AdminTable`.
Restyled: everything in section 2.6 marked _restyle_.
Untouched: `SkipLink`, `VideoEmbed`, `quote-link.ts`, every action and query.

### 5.6 Public page redesign

Home: photographic hero + floating feature panel → glass stat bar → signature
work rail → occasions icon grid → why choose band → featured services →
how it works → testimonials → floral CTA → footer.
Inner pages: compact glass hero over a tinted photographic band, then panels.
Our Work: rail-free grid of tall image cards with an on-image occasion chip.
Design detail: full-width cover, glass detail panel, gallery, unchanged CTAs.

### 5.7 Admin redesign

Fixed glass sidebar at `lg` and above with the brand mark, section list with an
active pill and the sign-out block at the foot; a compact glass top bar on small
screens with the same list in a sheet. Dashboard tiles become glass cards with
icon chips. Lists become real tables with headers, zebra-free hairlines and
generous row height. Forms keep their exact accessibility wiring and gain a
denser, calmer visual. **Tables and enquiry rows stay on opaque white** — no
blur behind data anyone has to read all day.

### 5.8 Content strategy

Rewrite every customer facing string. Rules applied: no em dashes, no
semicolons, no plus signs or hyphens standing in for "and" in marketing copy; no
superlatives or guarantees; nothing that is not supported by the approved
requirements; no explanation of how the form works where a customer expects to
be spoken to. Approved figures (14+, 600+, 35+), the positioning statement, the
14 occasions with their Tamil terms, the 12 services with partner-vendor marking
and the five coverage areas are preserved exactly.

**Two deliberate refusals.** The reference image shows a phone number, an email
address and business hours that differ from the approved requirements
(`+91 99940 72435`, `vrk.groups@gmail.com`, and no approved opening hours). The
approved values are kept and no opening hours are invented. Both are listed as
items for client confirmation.

### 5.9 Image strategy

No approved photography exists. `public/samples/` already holds 24 procedurally
generated placeholders and a README, active **only** when Supabase is
unconfigured and labelled on screen wherever they appear. That mechanism is
kept and extended: a small set of green and ivory botanical placeholders is
generated in the same way for the hero and the occasion tiles, written to
`public/samples/`, listed in its README and covered by the existing
"delete before production" rule. One constant, `HERO_IMAGE`, is the single
replacement point for the approved hero photograph.

### 5.10 Responsive strategy

Mobile is designed, not scaled: rounded header card with a phone button and a
menu button, hero photograph with the headline over a light plate, 2x2 stat
card, horizontal snap rail for signature work, 2-up value cards, 3-up occasion
icon grid, stacked CTA buttons, sectioned footer, floating WhatsApp above the
sticky action bar. Blur is reduced at small sizes, gutters go to 16px, section
padding to `py-12`, and the hero headline is clamped so it never wraps badly.

---

## 6. What Stage 2 will not do

No database change, no business logic change, no dependency added, no security
control weakened, no P9 or later work (sitemap, robots, structured data,
analytics, CSP).
