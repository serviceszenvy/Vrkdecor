# VRK Decor — Proposed digital design system

> **This is an AI-derived PROPOSED digital design system, not an official VRK
> Decor brand guideline.**
>
> No official brand guide was supplied with the project. As directed by
> `CLAUDE.md`, this system was derived by analysing the only supplied brand
> asset — the logo at `07_BRAND_ASSETS/vrk-decor-logo.jpg`. It is a proposal for
> client review and approval. If VRK Decor later supplies an official brand
> guideline, that guideline supersedes this document and the tokens must be
> updated to match.
>
> Nothing here redraws, recolours or reinterprets the logo itself. The artwork
> is used unmodified.

A live reference of every token and component renders at `/design-system` in a
running application. That page is marked `noindex` and is for internal review.

---

## 1. Logo analysis

The supplied artwork is 1600x1200 px, flat colour on a white background. Pixel
analysis of the artwork found exactly two brand colours:

| Element                         | Measured colour  | HSL           | Contrast on white |
| ------------------------------- | ---------------- | ------------- | ----------------- |
| "VRK" wordmark                  | `#8EC840` (lime) | 86°, 55%, 52% | 2.00:1            |
| "DECOR" wordmark, leaf, ellipse | `#61764B` (sage) | 89°, 22%, 38% | 5.00:1            |

Both sit in the same yellow-green hue family (86–89°), which is what makes the
mark read as one system rather than two colours. The composition is a leaf and
an enclosing ellipse: organic, calm, horticultural — appropriate for floral and
event decoration, and deliberately not loud.

Two consequences drive the whole system:

1. **The sage is the usable colour.** At 5.00:1 on white it passes WCAG AA for
   normal text. It becomes the primary brand colour.
2. **The lime is a highlight, not a text colour.** At 2.00:1 on white it fails
   AA badly. It is used for fills, accents and eyebrow text on dark surfaces,
   and never for small text on a light background. This constraint is enforced
   by an automated test.

The logo is drawn for light backgrounds. It has no reversed or single-colour
variant, which is why the dark footer presents it on a white plate.
**Recommended client action: supply a reversed logo variant for dark surfaces.**

---

## 2. Colour

Three ramps, defined in `lib/design-tokens.ts` and mirrored into Tailwind theme
variables in `app/globals.css`.

### brand — sage/olive

Anchored at `brand-700 = #61764B`, the exact sage measured in the logo.

| Step    | Hex           | Typical use                                        |
| ------- | ------------- | -------------------------------------------------- |
| 50      | `#F6F9F3`     | Tinted panel, outline-button hover                 |
| 100     | `#ECF2E6`     | Badge background                                   |
| 200     | `#DAE5CF`     | Badge border                                       |
| 300     | `#C2D2B2`     | Decorative rules                                   |
| 400     | `#A4BB8B`     | Illustration                                       |
| 500     | `#85A06A`     | Illustration                                       |
| 600     | `#6D8455`     | Secondary graphic                                  |
| **700** | **`#61764B`** | **Brand text, links, outline buttons, focus ring** |
| 800     | `#475637`     | Primary button background                          |
| 900     | `#37432B`     | Primary button hover                               |
| 950     | `#242C1C`     | Deep accent                                        |

### accent — lime

Anchored at `accent-500 = #8EC840`, the exact lime measured in the logo.

| Step    | Hex                   | Typical use                                               |
| ------- | --------------------- | --------------------------------------------------------- |
| 100–200 | `#EDF7E0`, `#DDF0C4`  | Featured badge background                                 |
| 300     | `#C7E79D`             | Eyebrow text and small text **on dark surfaces** (11.2:1) |
| **500** | **`#8EC840`**         | **Accent CTA fill, highlights** — with ink text only      |
| 600     | `#74A831`             | Accent CTA hover                                          |
| 800–950 | `#4B6D20` … `#263710` | Accent text on light backgrounds where needed             |

### sand — warm neutral

A low-chroma warm neutral (hue 70°). Warm rather than blue-grey so it sits
under warm event photography — marigolds, drapery, lighting — without a cold
cast.

| Step | Hex       | Typical use                         |
| ---- | --------- | ----------------------------------- |
| 50   | `#F7F7F5` | Alternating section background      |
| 100  | `#EDEEEA` | Image placeholder, secondary button |
| 200  | `#DCDDD7` | Borders and hairlines               |
| 600  | `#707267` | Muted text (4.89:1 on white)        |
| 950  | `#252522` | Body text, inverse surface, footer  |

### Semantic roles

Components reference these, never a raw palette step:

| Role              | Value       |
| ----------------- | ----------- |
| `surface`         | `#FFFFFF`   |
| `surface-subtle`  | `sand-50`   |
| `surface-muted`   | `sand-100`  |
| `surface-inverse` | `sand-950`  |
| `ink`             | `sand-950`  |
| `ink-muted`       | `sand-600`  |
| `ink-inverse`     | `#FFFFFF`   |
| `line`            | `sand-200`  |
| `focus`           | `brand-700` |

### Contrast contract

Thirteen text/background pairings are declared in `contrastContract` and
asserted by `tests/unit/design-tokens.test.ts`. A palette change that drops any
pairing below its required ratio fails the build. Headline results:

| Pairing              | Ratio   | Requirement |
| -------------------- | ------- | ----------- |
| Body text on white   | 15.37:1 | 4.5         |
| Muted text on white  | 4.89:1  | 4.5         |
| Brand text on white  | 5.00:1  | 4.5         |
| Primary button label | 7.91:1  | 4.5         |
| Accent button label  | 7.68:1  | 4.5         |
| Accent text on dark  | 11.23:1 | 4.5         |

A further test records the deliberate constraint that `accent-500` on white is
below 4.5:1 and must not be used for small text there.

---

## 3. Typography

The logo pairs a heavy condensed sans ("VRK") with a serif carrying decorative
swashes ("DECOR"). The digital system mirrors that pairing:

- **Display (headings)** — a serif, echoing the DECOR wordmark. Carries the
  premium, editorial tone the brand is positioned for.
- **Sans (body and interface)** — a neutral sans for readability at small sizes
  and in forms.

### Webfonts are a deliberate open decision

No webfont is loaded. `--font-display` and `--font-sans` in `app/globals.css`
currently resolve to high-quality system stacks and are the **swap point**: once
the client approves and licenses a typeface, self-host it with
`next/font/local` and replace the first entry in each stack.

Self-hosting rather than a font CDN is recommended for this project: no
third-party request, faster first render on mobile connections, no external
dependency for a Hostinger deployment, and better privacy.

Candidate pairings to review (all open-licensed): Cormorant Garamond or
Playfair Display for display, with Inter or Source Sans 3 for body.

### Scale

Fluid `clamp()` sizes, so headings scale with the viewport without a media query
at each breakpoint.

| Token       | Size            | Use                     |
| ----------- | --------------- | ----------------------- |
| `text-5xl`  | 2.75 → 4rem     | Page hero               |
| `text-4xl`  | 2.25 → 3rem     | H1                      |
| `text-3xl`  | 1.875 → 2.25rem | Section heading         |
| `text-2xl`  | 1.5 → 1.75rem   | Sub-section, card title |
| `text-lg`   | 1.125rem        | Lead paragraph          |
| `text-base` | 1rem            | Body                    |
| `text-sm`   | 0.875rem        | Metadata, nav           |
| `text-xs`   | 0.8125rem       | Eyebrow, caption        |

Headings use `text-balance`, paragraphs use `text-pretty`, and headings tighten
letter-spacing slightly (-0.01em).

---

## 4. Spacing and layout

Spacing uses Tailwind's 4px base scale. Sections use three fixed vertical
rhythms so pages never drift into ad-hoc padding:

| Rhythm     | Padding          |
| ---------- | ---------------- |
| `compact`  | `py-10 sm:py-12` |
| `default`  | `py-14 sm:py-20` |
| `spacious` | `py-20 sm:py-28` |

Container widths: `narrow` (2xl) for prose, `default` (5xl), `wide` (7xl) for
photography grids. Horizontal gutters are `px-5 sm:px-6 lg:px-8`.

Radii: `sm` 4px, `md` 8px (buttons), `lg` 14px (cards and image frames),
`xl` 24px. Elevation is deliberately restrained — two shadow tokens — so
photography, not chrome, carries the visual weight.

---

## 5. Components

### Buttons

Six variants, three sizes. Every size is at least 44x44 CSS pixels, which
exceeds the WCAG 2.1 AA target-size minimum and suits one-handed mobile use.

| Variant     | Use                                                  |
| ----------- | ---------------------------------------------------- |
| `primary`   | The main action on a light surface — "Get a Quote"   |
| `accent`    | The main action on a dark surface or photograph      |
| `secondary` | Neutral secondary action                             |
| `outline`   | Tertiary action, filters, "View Design"              |
| `ghost`     | Low-emphasis action, toolbars, the mobile action bar |
| `inverse`   | Action on a dark surface                             |

**Rule:** control responsive visibility by wrapping a button, never by passing
`hidden` in `className`. The button base sets `inline-flex`, and class order in
the attribute does not resolve CSS conflicts. This is documented in `lib/cn.ts`.

### Cards

`Card` is the surface container for Designs, services, packages and
testimonials. `interactive` adds a hover elevation for cards that are entirely a
link target; it also responds to `focus-within`, so keyboard users get the same
affordance.

### Badges

Pills for occasion, style and service tags. `brand` for occasion, `neutral` for
style, `accent` for a featured flag, `inverse` on dark surfaces.

### Imagery treatment

The portfolio is photography-first, so image handling is a system-level concern:

- `ImageFrame` fixes an aspect ratio (`square`, `portrait`, `landscape`, `wide`,
  `hero`) so grids never shift while images load.
- The placeholder is `surface-muted`, a warm neutral, not grey.
- `zoomOnHover` applies a restrained 4% scale, wrapped in `motion-safe:` so it
  is disabled under `prefers-reduced-motion`.
- `ImageScrim` is a gradient overlay that keeps captions legible over any
  photograph.
- Per-image alt text is a data concern owned by the portfolio model, not this
  system; `ImageFrame` carries no alt text of its own.

---

## 6. Navigation and shell

- **Header** — sticky, translucent, with the logo, the primary navigation from
  the approved site structure and a persistent "Get a Quote" action. Sticky so
  the conversion action stays reachable while scrolling photography.
- **Mobile navigation** — a disclosure panel below `lg`. It is rendered through
  a portal (the header uses `backdrop-filter`, which would otherwise become the
  containing block for its fixed children). It manages `aria-expanded`,
  `aria-controls`, focus entry, a focus trap, Escape-to-close with focus return
  and body scroll locking, and it closes on route change.
- **Mobile sticky action bar** — Call, WhatsApp and Get Quote, required by the
  Requirements & SOW section 4. Hidden at `lg` and above.
  `--mobile-cta-height` reserves the space it occupies so it never covers
  content.
- **Footer** — dark inverse band with the logo, the site structure, contact
  actions, coverage areas and legal links.

Navigation targets come from `lib/navigation.ts`. Phone and WhatsApp hrefs are
built from the approved business contact details in `lib/site-config.ts`.

---

## 7. Responsive principles

Mobile-first. Breakpoints are Tailwind's defaults: `sm` 640, `md` 768, `lg` 1024,
`xl` 1280, `2xl` 1536 px.

- `lg` is the shell breakpoint: below it, the mobile menu and sticky action bar;
  at and above it, the full horizontal navigation.
- Photography grids go 1 → 2 → 3 columns at `sm` and `lg`.
- Type scales fluidly rather than stepping at breakpoints.
- Touch targets stay at 44px at every size.
- Layouts use flex and grid with relative units; no fixed-width containers.

---

## 8. Accessibility rules

These are requirements of the system, not suggestions:

- **Contrast** — every documented pairing meets WCAG 2.1 AA and is tested.
- **Focus** — a visible 2px `brand-700` focus ring with a 2px offset on every
  focusable element. Never removed.
- **Skip link** — the first tab stop, moving focus to `#main`.
- **Semantics** — one `h1` per page, ordered headings, landmark elements, and
  navigation landmarks with accessible names ("Primary", "Mobile").
- **Targets** — 44x44 CSS pixels minimum.
- **Motion** — all animation wrapped in `motion-safe:`; a global
  `prefers-reduced-motion` block disables transitions and smooth scrolling.
- **Images** — `alt` is always required of the consumer; decorative SVG icons
  are `aria-hidden` and take their accessible name from the control.
- **Colour is never the only signal** — badges carry text, not colour alone.

Automated coverage: the contrast contract in unit tests, plus end-to-end tests
for the skip link, focus visibility, heading structure and the mobile menu's
keyboard behaviour. A full accessibility audit is P11.

---

## 9. What this system does not yet cover

Delivered by later phases, against these same tokens:

| Not yet covered                                          | Phase                   |
| -------------------------------------------------------- | ----------------------- |
| Form controls, labels, validation and error styling      | P6                      |
| File upload control for reference images                 | P7                      |
| Portfolio grid, filter chips, lightbox and gallery       | P5                      |
| Admin panel tables, drag-and-drop ordering, status chips | P8                      |
| Toasts and confirmation states                           | P6–P8                   |
| Approved photography and final copy                      | P4                      |
| Final typeface                                           | Pending client decision |
