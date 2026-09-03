# UI audit — public site

Phase 0 of the UI/visual/motion polish engagement. Read-only: nothing in this
document changes code. Scope is the public site only (`app/(site)/**`,
`components/{ui,layout,page}/**`, `features/{portfolio,enquiries}/components/**`)
— the Admin Panel (`app/admin/**`, `features/admin/**`) is out of scope, per
agreement earlier in this engagement.

**Important context this audit must be honest about:** a prior pass in this
same engagement already implemented and merged a round of glassmorphism/colour/
motion improvements directly to `main` (commit `2f7023d` and `f9201ba`), before
this stricter phased process was requested. This audit therefore describes the
**current, already-partially-improved** state, not a pristine baseline. Findings
below are either things that pass, gaps that pass exist but are unverified, or
concrete regressions/oversights from that earlier pass. Nothing here should be
read as "the whole site is dull and untouched."

---

## 1. Framework, styling approach, tokens

- **Framework**: Next.js 16.3.3 (App Router, Turbopack, Server Actions),
  React 19.2.8, TypeScript 5.9.3.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), CSS-first config — no
  `tailwind.config.js`. All theme tokens live in `@theme { ... }` inside
  **`app/globals.css`**, which is the single global stylesheet
  (`app/layout.tsx` imports it once).
- **Token source of truth**: **`lib/design-tokens.ts`** — a plain TypeScript
  module with `palette`, `semanticColors`, `contrastContract`, `glass`,
  `typeScale`, `sectionSpacing`, `radii`, `breakpoints`, `minTouchTargetPx`.
  `tests/unit/design-tokens.test.ts` fails the build if `app/globals.css`
  drifts from this file for every value it checks (palette steps, semantic
  colours, radii, glass tokens, the WCAG contrast contract). This is a real,
  enforced source-of-truth relationship, not aspirational.
- **Class merging**: `lib/cn.ts` is a plain `filter(Boolean).join(' ')` —
  **not** `tailwind-merge`. Conflicting utilities on one element are resolved
  by Tailwind's internal cascade-layer order, not by string position. This
  matters for finding M3 below.
- **Live reference**: `/design-system` (route: `app/(site)/design-system/page.tsx`)
  renders every token and several component states; it is `noindex`.

## 2. Design system inventory

**Colour** — three ramps (50–950) plus semantic roles, all in
`lib/design-tokens.ts` → `app/globals.css` `@theme`:
- `brand` (sage/olive) — anchored at `brand-700 = #61764B`
- `accent` (lime) — anchored at `accent-500 = #8EC840`
- `sand` (warm neutral) — anchored at `sand-950 = #252522`
- Semantic roles: `surface #FFFFFF`, `canvas #F5F7F1`, `canvas-deep #EDF1E5`,
  `surface-tint #ECF2E6`, `surface-subtle #F7F7F5`, `surface-muted #EDEEEA`,
  `surface-inverse #252522`, `ink #252522`, `ink-muted #707267`,
  `ink-soft #5B5C54`, `ink-inverse #FFFFFF`, `line #DCDDD7`, `line-soft #E4E7DD`,
  `focus #61764B`.
- 21 pairings are asserted in `contrastContract` (`lib/design-tokens.ts`) and
  checked by `tests/unit/design-tokens.test.ts` / `contrast.test.ts`.

**Type scale** — fluid `clamp()` sizes, `2xs`→`5xl`, defined once in
`typeScale` / mirrored as `--text-*`. Display font: a system serif stack
(`--font-display`); body font: a system sans stack (`--font-sans`). No webfont
is loaded (deliberate, documented, open client decision).

**Spacing** — Tailwind's 4px base scale for everything else; four named
section rhythms in `sectionSpacing`: `compact` (`py-10 sm:py-12`), `default`
(`py-14 sm:py-20`), `spacious` (`py-20 sm:py-28`, used once —
`app/not-found.tsx`), `panel` (`py-12 sm:py-16`, used inside rounded panels).
Container widths: `narrow` (2xl), `default` (5xl), `wide` (82rem/86rem).

**Radii** — `sm` 4px, `md` 8px, `lg` 14px, `xl` 20px, `2xl` 28px, `3xl` 36px,
`full` (pill, every action).

**Shadows** — `card`, `raised`, `glass`, `panel`, `float`, plus `glow` (added
in the prior pass, a brand-tinted hover lift). See finding C2/D1: `raised` is
now nearly unused and four hover/focus states use one-off arbitrary
`shadow-[...]` values instead of any of these six named tokens.

**Breakpoints** — Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280,
`2xl` 1536. `lg` is the shell breakpoint (mobile nav / sticky bar below it,
full nav / admin sidebar at and above it).

## 3. Glassmorphism — how it's implemented, everywhere it's used

Three base surfaces plus one added in the prior pass, all in
`app/globals.css` `@layer components`:

| Class | Opaque fallback | Translucent value (inside `@supports (backdrop-filter)`) |
| --- | --- | --- |
| `.glass-surface` | `rgb(255 255 255 / 0.9)` | `rgb(255 255 255 / 0.62)`, blur 16px |
| `.glass-surface-strong` | `rgb(255 255 255 / 0.95)` | `rgb(255 255 255 / 0.86)`, blur 24px |
| `.glass-surface-tint` | `rgb(236 242 230 / 0.94)` | `rgb(236 242 230 / 0.74)`, blur 16px |
| `.glass-surface-vivid` | `rgb(221 240 196 / 0.95)` | `rgb(221 240 196 / 0.8)`, blur 16px |

`.glass-edge` adds a thin top highlight + faint corner reflection
(`::before`, radial + linear gradient). Every surface degrades to its opaque
fallback when `backdrop-filter` is unsupported — verified by a dedicated test.

**Every usage site** (public site only; grep-verified):

- `SiteHeader` (`components/layout/site-header.tsx:29`) — the floating nav
  container, `glass-surface-strong glass-edge`, always visible, sticky.
- `MobileNav` (`components/layout/mobile-nav.tsx:102,130`) — trigger button
  (`glass-surface`) and the sheet panel (`glass-surface-strong glass-edge`).
- `StickyMobileCta` (`components/layout/sticky-mobile-cta.tsx:24`) —
  `glass-surface-strong glass-edge`, fixed, below `lg`.
- `StatBar` (`components/page/stat-bar.tsx:31`) — the floating figures strip
  under the home hero, `glass-surface-strong glass-edge`.
- `HomeHero`'s assurance panel (`components/page/home-hero.tsx:95`, via
  `GlassPanel tone="strong"`).
- `DesignRail`'s prev/next buttons (`features/portfolio/components/design-rail.tsx:121`).
- `Button variant="glass"` (`components/ui/button.tsx:38`) — used on: header
  phone pill, contact page WhatsApp/Call, home page "Our Services"/"View All
  Work"/"See all services", CtaBand's two secondary actions, design-system
  showcase.
- `Card tone="glass"` (`components/ui/card.tsx:8`) — declared, **not
  currently used anywhere** in the public site.
- `Badge tone="glass"` (`components/ui/badge.tsx:16`) — the occasion/featured
  chip on every portfolio card (`design-card.tsx:77,81`), and the partner-vendor
  badge (`services/page.tsx:113`).
- `GlassPanel` primitive (`components/ui/glass.tsx`) — used directly by
  `HomeHero` and the `/design-system` showcase.

That's the complete list. It is **not** applied to ordinary content cards,
form fields, tables, or generic `Section` panels — those stay opaque
`bg-surface`/`bg-surface-tint`, consistent with the system's own stated rule
("never behind data").

## 4. Brand colours (measured, not invented)

From `07_BRAND_ASSETS/vrk-decor-logo.jpg`, as recorded in
`lib/design-tokens.ts` and `docs/DESIGN-SYSTEM.md` — **no colour below was
invented for this audit or the prior pass; both are pixel measurements of the
supplied logo artwork**:

- **Lime** `#8EC840` — the "VRK" wordmark → anchors `accent-500`.
- **Sage** `#61764B` — the "DECOR" wordmark, leaf and ellipse → anchors `brand-700`.

Full ramps (`lib/design-tokens.ts`):

```
brand:  50 #F6F9F3  100 #ECF2E6  200 #DAE5CF  300 #C2D2B2  400 #A4BB8B
        500 #85A06A  600 #6D8455  700 #61764B  800 #475637  900 #37432B  950 #242C1C
accent: 50 #F7FBF1  100 #EDF7E0  200 #DDF0C4  300 #C7E79D  400 #AAD671
        500 #8EC840  600 #74A831  700 #5E8828  800 #4B6D20  900 #3B5519  950 #263710
sand:   50 #F7F7F5  100 #EDEEEA  200 #DCDDD7  300 #C5C6BE  400 #A7AA9D
        500 #898B7E  600 #707267  700 #5B5C54  800 #484A43  900 #393A34  950 #252522
```

## 5. Every page, layout and shared component in scope

**Pages** (`app/(site)/**`): home (`page.tsx`), `about`, `contact`,
`services`, `packages`, `occasions`, `gallery`, `our-work`,
`our-work/[slug]`, `quote`, `design-system` (internal, `noindex`), `terms`,
`privacy-policy`. Shell: `app/(site)/layout.tsx` → `SiteChrome`. Root:
`app/layout.tsx`, `app/not-found.tsx`, `app/globals.css`.

**Shared UI** (`components/ui/`): `Button`/`ButtonLink`, `Card`/`CardBody`/
`CardTitle`/`CardMeta`, `Badge`, `Container`, `GlassPanel`/`IconChip`/
`LeafRule`, `ImageFrame`/`ImageScrim`, `Section`/`SectionHeading`, `Reveal`,
`SkipLink`.

**Layout** (`components/layout/`): `SiteChrome`, `SiteHeader`, `MobileNav`,
`NavLinks`, `SiteFooter`, `StickyMobileCta`, `WhatsAppFab`, `Logo`, `icons.tsx`.

**Page-level composites** (`components/page/`): `Hero`, `HomeHero`,
`CtaBand`, `ValueBand`, `StatBar`, `StatList`, `OccasionGrid`, `LeafDecor`,
`EmptyState`, `DraftNotice`, `service-icon`.

**Portfolio feature** (`features/portfolio/components/`): `DesignCard`,
`DesignGrid`, `DesignRail`, `FilterBar`, `Lightbox`, `PhotoGallery`,
`VideoEmbed`, `SampleContentNotice`.

**Enquiries feature** (`features/enquiries/components/`): `QuoteForm`,
`CapturedDesign`, `LocalStoreNotice`, `UnavailableDesignNotice`,
`ReferenceImageField`.

Excluded: everything under `app/admin/**` and `features/admin/**`.

## 6. The 15 most significant problems

### Motion

**M1 — Ambient motion is not reduced or dropped on small screens.**
`app/globals.css` defines `--animate-drift-slow`, `--animate-drift-slower`,
`--animate-gradient-pan`; they run unconditionally at every breakpoint.
Usage sites: `components/page/home-hero.tsx:32,52,56`,
`components/page/hero.tsx:45,49`, `components/page/cta-band.tsx:30,32,37`,
`components/page/value-band.tsx:23,25`. This directly contradicts the
requirement to reduce/drop ambient motion on small screens where it costs
frames — nothing here is currently breakpoint-gated.

**M2 — Backdrop blur runs on every scroll frame on mobile with no
mitigation.** `SiteHeader` (`components/layout/site-header.tsx:29`) is
`sticky` with `glass-surface-strong` (24px blur) and repaints on every scroll
frame at every viewport size, including low-end mobile — the exact cost the
system's own documentation (`docs/DESIGN-SYSTEM.md` §4b) warns about, but
there is no smaller-blur or opaque fallback below a breakpoint.

**M3 — `Button variant="glass"` hover shadow silently replaces, not
enhances, the glass shadow.** `components/ui/button.tsx:38`:
`glass-surface-strong text-ink hover:bg-white motion-safe:hover:shadow-raised`.
`.glass-surface-strong` sets `box-shadow: var(--shadow-glass)` inside
`@layer components` (`app/globals.css`). Tailwind emits its own utilities
(including `hover:shadow-raised`) into the `utilities` layer, and per the CSS
Cascade Layers spec a later-declared layer always wins over an earlier one
regardless of specificity or source order — `@import "tailwindcss"` declares
`components` before `utilities`. So on hover the box-shadow doesn't blend;
it's fully replaced by `--shadow-raised`, discarding the glass shadow
character. This is inconsistent with the glow-shadow hover language used
everywhere else (`button.tsx:30,32`, `card.tsx:48`, `design-card.tsx:46`).
Live on: header phone pill, contact WhatsApp/Call, home "Our Services"/"View
All Work"/"See all services", CtaBand's two secondary actions.

**M4 — Two unnamed, unreconciled entrance-motion systems.** Hero content uses
`motion-safe:animate-fade-in` (a CSS `@keyframes`, plays once automatically on
paint, no scroll trigger — `home-hero.tsx`, `hero.tsx`). Everything below the
fold uses `Reveal` (`components/ui/reveal.tsx`, IntersectionObserver-driven).
Both are reasonable choices for their position on the page, but neither is
documented as a deliberate two-track system, so the next person touching
either one has no rule to follow.

**M5 — No named, documented duration/easing scale.** Durations actually in
use: `duration-200`, `duration-300`, `0.25s` (`--animate-sheet-in`), `0.5s`
(`--animate-fade-in`), `0.6–0.7s` (`.reveal`), `12–22s` (drift/gradient-pan).
Easings: Tailwind's default `ease`, an explicit `ease-out`, and a bespoke
`cubic-bezier(0.16, 1, 0.3, 1)` used only by `.reveal`. Functional, but not
consolidated into the "2 or 3 named easings, one set of standard transitions"
the brief asks for.

### Consistency

**C1 — `Card tone="glass"` + `interactive` is a latent version of M3.**
`components/ui/card.tsx:8,46-52`: `tones.glass` sets `box-shadow` via
`.glass-surface` (components layer); `interactive` adds
`hover:shadow-glow`/`focus-within:shadow-glow` (utilities layer). No current
usage combines `tone="glass"` with `interactive` (grep-verified), so this
isn't live yet, but it will silently misbehave exactly like M3 the first time
someone reaches for that combination.

**C2 — Four hover/focus states bypass the shadow token scale with one-off
arbitrary values**, none reusing the six named shadow tokens even where one is
semantically identical: `whatsapp-fab.tsx:25`
(`shadow-[0_10px_24px_-8px_rgb(37_211_102/0.7)]` — conceptually the same
"float" elevation `--shadow-float` already names), `button.tsx:30`
(primary's resting shadow), `quote-form.tsx:520` (focus-ring glow),
`filter-bar.tsx:47` (active chip shadow).

**C3 — `glass-surface-vivid` has no automated contrast coverage.** Every
other surface/text pairing in the system is asserted in `contrastContract`
(`lib/design-tokens.ts`) and checked by `tests/unit/design-tokens.test.ts`.
The new vivid tone (added in the prior pass) is not — its readability is
currently established only by inspection, not by the same test that gates
every other pairing.

### Mobile

**Mob1 — Same root cause as M1**, called out separately because it's an
explicit acceptance criterion: ambient blob drift and the 24px header blur are
identical in cost and visual weight on a 390px phone and a 1920px desktop.

**Mob2 — Horizontal-overflow verification only covers one width.**
`tests/e2e/public-pages.spec.ts` checks "no horizontal scroll" at 390px only.
The acceptance criteria for this engagement ask for 320, 375, 390, 768, 1024,
1440 and 1920 — five of those seven widths have never actually been checked,
on any page.

### Hierarchy

**H1 — The home page runs eleven consecutive sections of near-identical
visual weight.** `app/(site)/page.tsx`: hero → stats → featured designs →
value band → occasions → services → how it works → styles → testimonials →
CTA → coverage. Every `Section tone="panel"` gets the same white rounded card
treatment and the same `SectionHeading` scale; nothing signals which 2–3
sections are the primary path to conversion versus supporting/browse content.

**H2 — Inconsistent use of the eyebrow micro-label.** Most sections lead with
a small-caps eyebrow (`Services`, `How it works`, `Testimonials`); "Featured
Designs" (`app/(site)/page.tsx`, `SectionHeading id="featured-designs"`) has
none. There's no documented rule for when a section gets an eyebrow and when
it doesn't, so the inconsistency reads as an oversight rather than a choice.

### Spacing

**S1 — Horizontal gutters stack when `Container` sits inside a panel.**
`Section tone="panel"` (`components/ui/section.tsx`) wraps its content in an
outer `px-3 sm:px-5 lg:px-6` (12→20→24px) rounded panel, then renders
`<Container width={width}>` **inside** that panel, and `Container`
(`components/ui/container.tsx`) adds its own `px-4 sm:px-6 lg:px-10`
(16→24→40px). At `lg` the two stack to a combined 64px of horizontal inset
per side (128px total on a 1440px viewport) before any content starts — this
may be intentional, but it is not documented as such, and it's a materially
different (much larger) gutter than the Hero/HomeHero/CtaBand/ValueBand/
StatBar panels get, which use only the outer `px-3 sm:px-5 lg:px-6` with no
nested `Container` padding on top.

### Dead / duplicated CSS

**D1 — `--shadow-raised` is now used in exactly one place.** After this
engagement's prior pass moved most hover elevation to the new `--shadow-glow`,
`shadow-raised` (still declared in `@theme` and `lib/design-tokens.ts`)
appears in the codebase only via `button.tsx:38` (see M3) — effectively
vestigial, kept alive by what looks like an oversight rather than a deliberate
choice to keep two elevation tones.

### Contrast

**C4 (contrast) — The WhatsApp FAB's icon fails the 3:1 UI-component
minimum, computed.** `components/layout/whatsapp-fab.tsx`: white icon
(`WhatsAppIcon`) on `bg-[#25D366]`. Computed WCAG contrast ratio: **≈1.98:1**
(relative luminance of `#25D366` ≈ 0.479; `(1.0+0.05)/(0.479+0.05) ≈ 1.98`),
against the 3:1 minimum this engagement's own acceptance criteria set for UI
components. This is WhatsApp's standard brand green + white mark, used near-
universally this way across the web, so there's a real argument for treating
it as an accepted third-party brand-mark exception rather than "fixing" it —
but it fails the literal numeric bar and should be a deliberate decision, not
an unexamined one.

---

## 7. What's already satisfied by the prior pass

To avoid re-litigating settled ground in the phases below:

- Colour/spacing/radius/shadow/glass tokens already live in one place
  (`lib/design-tokens.ts` → `app/globals.css`), enforced by a test.
- Three (now four) named glass surface levels exist; glass is not applied ad
  hoc per-card — confirmed by the usage inventory in §3.
- A global `prefers-reduced-motion` rule already exists
  (`app/globals.css:407-420`) and zeroes every animation/transition duration
  site-wide — it already does what Phase 1 asks for, though it's coarser
  (kills all motion) than "keeps opacity only, disables transforms and
  background motion" — worth a closer look in Phase 1 (see proposed plan).
- `Reveal`'s CSS is gated behind `@media (scripting: enabled)`, so content is
  never hidden from a no-JS visitor.
- Buttons, cards, badges, icon chips, nav, footer, portfolio cards/lightbox/
  filters and the quote form already received a hover/press/motion pass (see
  `06_CHECKPOINT/CHANGELOG.md` 0.8.2 entry) — this audit is about tightening
  and fixing what's there, largely not starting from zero.

---

## 8. Proposed phased plan

Given the findings above, I'd fold the fixes into your existing Phase 1–4
structure rather than invent new phases:

- **Phase 1 (foundations)**: add named shadow tokens for the 4 arbitrary
  values (C2), fix the cascade-layer collision (M3/C1) by moving the glass
  hover treatment into a plain CSS rule instead of mixing a Tailwind utility
  with a `@layer components` class, name the duration/easing scale (M5), add
  `glass-surface-vivid` to `contrastContract` (C3), and reconsider the
  reduced-motion rule's granularity (opacity-only vs. kill-everything).
- **Phase 2 (visual)**: resolve H1 (establish which sections are primary vs.
  secondary and differentiate them) and H2 (a documented eyebrow rule), fix S1
  (decide and document the intended gutter — likely drop `Container`'s inner
  padding when nested inside a panel), retire or repurpose `--shadow-raised`
  (D1).
- **Phase 3 (motion)**: gate M1/M2/Mob1 behind a breakpoint (disable
  `animate-drift-*`/`animate-gradient-pan` and drop header blur to a lighter
  treatment below `sm` or `md`), reconcile M4 by documenting the two-track
  entrance-motion system as intentional (or unifying it).
- **Phase 4 (mobile)**: covered mostly by Phase 3's motion gating; also worth
  a fresh visual pass at 320px specifically, since nothing has been checked
  that narrow yet.
- **Phase 5 (verify)**: Playwright screenshots at 320/375/390/768/1024/1440/
  1920 for every page in scope (closes Mob2), a decision on C4 (accept as a
  documented brand exception, or adjust), full contrast sweep including the
  vivid tone, then build + existing test suite.

I'd branch this work as `feature/ui-polish` (already created) and commit once
per phase, per your working rules.

Stopping here for approval before any code changes.
