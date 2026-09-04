# UI/UX audit — public site

Phase 0 of the UI/visual/motion **transformation** engagement. Read-only:
nothing in this document changes code. Scope is the public site only
(`app/(site)/**`, `components/{ui,layout,page}/**`,
`features/{portfolio,enquiries}/components/**`) — the Admin Panel
(`app/admin/**`, `features/admin/**`) is out of scope, per agreement earlier
in this engagement.

**This supersedes the previous, narrower audit** written for an earlier,
smaller-scope "polish" brief. That document (and a first round of changes it
led to) is still in `main` — see §0 below for exactly what already happened
and, importantly, **one direct conflict with the new brief that needs your
decision before Phase 2 can start.**

---

## 0. What already happened, and the one real conflict

Before this "transformation" brief arrived, an earlier, smaller "polish" brief
for the same site was implemented and merged straight to `main` (commits
`2f7023d`, `f9201ba`): glass-edge/vivid-tone refinement, ambient low-opacity
blobs, scroll-reveal, hover/press motion on buttons/cards/nav/portfolio/quote
form. That work is real, live in `main`, and this audit reflects the site
**with it already applied** — not a pristine baseline.

**The conflict:** that earlier brief said, explicitly, *"Do not switch to dark
mode... keep the website primarily light, bright and clean."* Everything built
follows that — every section today is a light surface (`canvas`, `surface`,
`surface-tint`) or translucent glass over a light ground. This new brief says,
explicitly, the opposite for section-level treatment: *"Dark backgrounds are
allowed and encouraged... Hero → rich branded/dark visual background... CTA →
strong branded/dark section... Footer → darker premium treatment."*

These cannot both be true. I have not picked a side — Phase 2 in this plan is
blocked on you confirming which direction to take (see §9). Everything else in
this audit is unaffected by that decision and can proceed regardless.

---

## 1. Framework, architecture, styling approach

- **Framework**: Next.js 16.3.3 (App Router, Turbopack, Server Actions),
  React 19.2.8, TypeScript 5.9.3.
- **Styling**: Tailwind CSS v4, CSS-first config — no `tailwind.config.js`.
  All theme tokens live in `@theme { ... }` inside **`app/globals.css`**,
  the single global stylesheet (`app/layout.tsx` imports it once).
- **Token source of truth**: **`lib/design-tokens.ts`** — `palette`,
  `semanticColors`, `contrastContract`, `glass`, `typeScale`,
  `sectionSpacing`, `radii`, `breakpoints`, `minTouchTargetPx`.
  `tests/unit/design-tokens.test.ts` fails the build if `app/globals.css`
  drifts from it, for every value it checks. Real and enforced.
- **Class merging**: `lib/cn.ts` is a plain string-join, **not**
  `tailwind-merge`. Conflicting utilities on one element resolve by
  Tailwind's cascade-layer order, not string position — this is the root
  cause of finding M3 below.
- **Live reference**: `/design-system` (`app/(site)/design-system/page.tsx`),
  `noindex`, renders every token and several component states, including an
  "Inverse band" showcase of the dark surface tokens (see §9 — these tokens
  already exist and are already tested, they're just not used anywhere real).

## 2. Design tokens in place today

**Colour** — three ramps (50–950) plus semantic roles
(`lib/design-tokens.ts` → `app/globals.css` `@theme`):
- `brand` (sage/olive) — anchored at `brand-700 = #61764B`
- `accent` (lime) — anchored at `accent-500 = #8EC840`
- `sand` (warm neutral) — anchored at `sand-950 = #252522`
- Semantic: `surface #FFFFFF`, `canvas #F5F7F1`, `canvas-deep #EDF1E5`,
  `surface-tint #ECF2E6`, `surface-subtle #F7F7F5`, `surface-muted #EDEEEA`,
  **`surface-inverse #252522`** (dark, defined, unused on any real page),
  `ink #252522`, `ink-muted #707267`, `ink-soft #5B5C54`,
  **`ink-inverse #FFFFFF`** (same story), `line #DCDDD7`, `line-soft #E4E7DD`,
  `focus #61764B`.
- 21 pairings asserted in `contrastContract`, checked by
  `tests/unit/design-tokens.test.ts` / `contrast.test.ts` — including the
  inverse pairing, which is tested but, again, never actually rendered
  outside `/design-system`.

**Type scale** — fluid `clamp()`, `2xs`→`5xl` (`typeScale` / `--text-*`).
Display: system serif stack (`--font-display`, no webfont loaded — deliberate
open decision). Body: system sans stack (`--font-sans`).

**Spacing** — Tailwind's 4px base scale; four named section rhythms:
`compact` (`py-10 sm:py-12`), `default` (`py-14 sm:py-20`), `spacious`
(`py-20 sm:py-28`, used once, `app/not-found.tsx`), `panel`
(`py-12 sm:py-16`). Container widths: `narrow` (2xl), `default` (5xl), `wide`
(82rem/86rem).

**Radii** — `sm` 4px → `3xl` 36px, plus `full` (pill, every action).

**Shadows** — `card`, `raised`, `glass`, `panel`, `float`, `glow` (the last
added in the earlier pass). `raised` is now nearly dead — see D1.

**Breakpoints** — Tailwind defaults, `sm` 640 → `2xl` 1536. `lg` (1024) is
the shell breakpoint.

## 3. Glassmorphism today — implementation and every usage site

Four base surfaces, all in `app/globals.css` `@layer components`:

| Class | Opaque fallback | Translucent (inside `@supports (backdrop-filter)`) |
| --- | --- | --- |
| `.glass-surface` | `rgb(255 255 255 / 0.9)` | `rgb(255 255 255 / 0.62)`, blur 16px |
| `.glass-surface-strong` | `rgb(255 255 255 / 0.95)` | `rgb(255 255 255 / 0.86)`, blur 24px |
| `.glass-surface-tint` | `rgb(236 242 230 / 0.94)` | `rgb(236 242 230 / 0.74)`, blur 16px |
| `.glass-surface-vivid` | `rgb(221 240 196 / 0.95)` | `rgb(221 240 196 / 0.8)`, blur 16px |

`.glass-edge` adds a thin top highlight + faint corner reflection
(`::before`, radial + linear gradient). Every surface degrades to its opaque
fallback without `backdrop-filter` support (tested).

**Every usage site**, grep-verified: `SiteHeader` (sticky nav container),
`MobileNav` (trigger + sheet), `StickyMobileCta`, `StatBar` (home figures
strip), `HomeHero`'s assurance panel (via `GlassPanel`), `DesignRail`'s
prev/next buttons, `Button variant="glass"` (header phone pill, contact
WhatsApp/Call, home "Our Services"/"View All Work"/"See all services",
CtaBand's two secondary actions, design-system showcase), `Badge tone="glass"`
(every portfolio card's occasion/featured chip, the partner-vendor badge),
`GlassPanel` (HomeHero, `/design-system`). `Card tone="glass"` is declared but
**used nowhere**.

This is a single-level system in practice — one blur radius (16px, 24px on
the header only), one opacity band per tone, applied uniformly regardless of
what's behind it. It does not currently respond to its background (a busy
photo vs. a plain gradient get the same blur/opacity), and there's no
"featured" glass tier stronger than `vivid`. This is the biggest gap between
what exists and what Phase 1's "2–4 level, background-responsive glass
system" asks for.

## 4. Brand colours (measured from the logo, not invented)

From `07_BRAND_ASSETS/vrk-decor-logo.jpg`, recorded in
`lib/design-tokens.ts` and `docs/DESIGN-SYSTEM.md`:

- **Lime `#8EC840`** — the "VRK" wordmark → anchors `accent-500`.
- **Sage `#61764B`** — the "DECOR" wordmark, leaf and ellipse → anchors `brand-700`.

Full ramps:

```
brand:  50 #F6F9F3  100 #ECF2E6  200 #DAE5CF  300 #C2D2B2  400 #A4BB8B
        500 #85A06A  600 #6D8455  700 #61764B  800 #475637  900 #37432B  950 #242C1C
accent: 50 #F7FBF1  100 #EDF7E0  200 #DDF0C4  300 #C7E79D  400 #AAD671
        500 #8EC840  600 #74A831  700 #5E8828  800 #4B6D20  900 #3B5519  950 #263710
sand:   50 #F7F7F5  100 #EDEEEA  200 #DCDDD7  300 #C5C6BE  400 #A7AA9D
        500 #898B7E  600 #707267  700 #5B5C54  800 #484A43  900 #393A34  950 #252522
```

No colour outside these three ramps (plus pure white/black-adjacent
`surface`/`ink`) appears anywhere in the scoped codebase — confirmed by grep
for hex literals and arbitrary Tailwind colour classes outside `brand-*`,
`accent-*`, `sand-*`.

## 5. Pages and components reviewed

**Pages** (`app/(site)/**`): home, `about`, `contact`, `services`, `packages`,
`occasions`, `gallery`, `our-work`, `our-work/[slug]`, `quote`,
`design-system` (internal, `noindex`), `terms`, `privacy-policy`. Shell:
`app/(site)/layout.tsx` → `SiteChrome`. Root: `app/layout.tsx`,
`app/not-found.tsx`, `app/globals.css`.

**Shared UI** (`components/ui/`): `Button`/`ButtonLink`, `Card`/`CardBody`/
`CardTitle`/`CardMeta`, `Badge`, `Container`, `GlassPanel`/`IconChip`/
`LeafRule`, `ImageFrame`/`ImageScrim`, `Section`/`SectionHeading`, `Reveal`,
`SkipLink`.

**Layout** (`components/layout/`): `SiteChrome`, `SiteHeader`, `MobileNav`,
`NavLinks`, `SiteFooter`, `StickyMobileCta`, `WhatsAppFab`, `Logo`,
`icons.tsx` (≈20 hand-drawn inline SVGs, no icon library).

**Page composites** (`components/page/`): `Hero`, `HomeHero`, `CtaBand`,
`ValueBand`, `StatBar`, `StatList`, `OccasionGrid`, `LeafDecor`,
`EmptyState`, `DraftNotice`, `service-icon`.

**Portfolio** (`features/portfolio/components/`): `DesignCard`, `DesignGrid`,
`DesignRail`, `FilterBar`, `Lightbox`, `PhotoGallery`, `VideoEmbed`,
`SampleContentNotice`.

**Enquiries** (`features/enquiries/components/`): `QuoteForm`,
`CapturedDesign`, `LocalStoreNotice`, `UnavailableDesignNotice`,
`ReferenceImageField`.

Excluded: `app/admin/**`, `features/admin/**`.

## 6. Current design strengths

Worth preserving through the transformation, not just noting:

- **A real, enforced token pipeline.** Colour/radius/glass tokens can't drift
  between `lib/design-tokens.ts` and the CSS without failing a test — rare
  for a project this size, and worth keeping intact through Phase 1.
- **Brand colours are genuinely measured, not guessed**, and the constraint
  that `accent-500` (lime) never carries small text on white is itself
  enforced by a test, not just a convention.
- **Accessibility is a first-class citizen already**: 44px touch targets
  (`minTouchTargetPx`, checked), visible focus rings globally
  (`:focus-visible` in `app/globals.css`), a skip link, semantic landmarks,
  and a global `prefers-reduced-motion` rule that already zeroes every
  transition/animation duration site-wide.
- **Glass is already restrained**, not applied reflexively — confirmed by the
  usage inventory in §3. Ordinary content cards, tables and form fields stay
  opaque. This is a good instinct to keep even as the system grows to more
  levels.
- **`Reveal` (scroll entrance) is accessibility-safe by construction**: gated
  behind `@media (scripting: enabled)` so a no-JS visitor never sees hidden
  content, and rides the existing reduced-motion rule for free.
- **Componentization is consistent** — `Section`/`Card`/`Button`/`Badge`
  primitives are actually reused everywhere rather than page-specific
  one-offs, which makes a systematic Phase 1 token pass tractable.

## 7. Typography assessment

- Two-family pairing (serif display / sans body) is a reasonable, on-brand
  choice echoing the logo's own display serif ("DECOR"), and it's fluid
  (`clamp()`) rather than stepped at breakpoints — good foundation.
- **Weight is not used as a hierarchy tool.** `SectionHeading`
  (`components/ui/section.tsx:164`) applies `font-medium` to every heading
  level (h1/h2/h3 alike) — hierarchy comes entirely from `font-size`
  (`text-4xl`/`3xl`/`2xl`), never from weight contrast. A premium system
  typically pairs size steps with at least one weight step (e.g. `h1`
  semibold, `h2`/`h3` medium) for a stronger, faster-scanning hierarchy.
- **No italic, no small-caps, no numeric/tabular variant use anywhere** —
  fine for now, but worth deciding deliberately rather than by omission if
  Phase 2 wants a more "editorial premium" feel.
- Body copy sits at a single `text-base`/`text-lg` scale project-wide; line
  length (measure) is controlled well by `max-w-2xl`/`max-w-xl` wrappers
  almost everywhere text appears, so readability itself is not a problem —
  the gap is purely in hierarchy contrast.
- Eyebrow labels (`text-2xs font-semibold tracking-[0.22em] uppercase`) are
  the only strong-weight text in the entire type system outside buttons —
  everything else sits at `font-medium` or the sans default.

## 8. The 15 most important improvements

Grouped as requested; each has a file reference. Numbered findings from the
prior audit are kept (same evidence, re-verified against the current `main`)
since nothing has changed since they were written.

### Motion — problems

**M1 — Ambient motion is not reduced or dropped on small screens.**
`--animate-drift-slow`, `--animate-drift-slower`, `--animate-gradient-pan`
(`app/globals.css`) run unconditionally at every breakpoint. Usage:
`components/page/home-hero.tsx:32,52,56`, `hero.tsx:45,49`,
`cta-band.tsx:30,32,37`, `value-band.tsx:23,25`. Contradicts Phase 4's
explicit "reduce or drop ambient motion... on small screens."

**M2 — Backdrop blur runs on every scroll frame on mobile, unmitigated.**
`SiteHeader` (`components/layout/site-header.tsx:29`) is `sticky` with 24px
blur at every viewport size, including low-end mobile — the exact cost
`docs/DESIGN-SYSTEM.md` §4b itself warns about, with no lighter mobile
fallback.

**M3 — `Button variant="glass"` hover shadow replaces, not enhances, the
glass shadow.** `components/ui/button.tsx:38`. `.glass-surface-strong` sets
`box-shadow` inside `@layer components`; `hover:shadow-raised` is a Tailwind
utility in the `utilities` layer. Per the CSS Cascade Layers spec, a
later-declared layer always wins regardless of specificity or source order —
Tailwind declares `utilities` after `components`. So hovering doesn't blend
the two shadows, it fully replaces one with the other, inconsistent with the
glow-shadow hover language used everywhere else
(`button.tsx:30,32`, `card.tsx:48`, `design-card.tsx:46`).

**C1 (consistency) — `Card tone="glass"` + `interactive` is a latent version
of M3.** `components/ui/card.tsx:8,46-52`. No current usage combines them
(grep-verified), but it will misbehave identically the first time someone
does.

### Motion — opportunities (things the new brief asks for that don't exist yet)

**MO1 — No parallax anywhere**, despite Phase 3 explicitly allowing it
"where appropriate." Candidate: the hero photograph
(`components/page/home-hero.tsx`) is a plain `object-cover` image with no
scroll-linked movement.

**MO2 — No mouse-follow or pointer-reactive glass effects.** Every glass
surface (§3) is static regardless of cursor position — Phase 1/3 explicitly
call for this as part of a "premium, dimensional" glass system.

**MO3 — Hero entrance is one fade, not a choreographed sequence.**
`components/page/home-hero.tsx:75` wraps the *entire* eyebrow+headline+lead+
CTA block in a single `motion-safe:animate-fade-in` — everything appears
simultaneously rather than eyebrow → headline → lead → CTA staggering in,
which is what "cinematic entrance" implies.

**MO4 — No image reveal-mask or clip-path transitions anywhere** — every
image (portfolio cards, gallery, hero) simply appears via `next/image` with
no reveal treatment on load or on scroll-into-view.

**MO5 — Buttons have no icon micro-interaction.** Icons inside `ButtonLink`
(e.g. `ArrowRightIcon` on every "Explore"/"View All" CTA) are static; only
the button shell itself lifts on hover. A small icon nudge/translate on hover
is a common, cheap premium signal that's entirely absent.

### Consistency

**C2 — Four hover/focus states bypass the shadow token scale** with one-off
arbitrary values, none reusing the six named tokens even where semantically
identical: `whatsapp-fab.tsx:25` (conceptually `--shadow-float`),
`button.tsx:30`, `quote-form.tsx:520`, `filter-bar.tsx:47`.

**C3 — `glass-surface-vivid` has no automated contrast coverage.** Every
other surface/text pairing is in `contrastContract`
(`lib/design-tokens.ts`) and gated by a test; the newest glass tone isn't.

### Mobile

**Mob1 — Same root cause as M1**, listed separately because it's an explicit
acceptance criterion: ambient blob drift and 24px header blur cost the same
on a 390px phone as on a 1920px desktop.

**Mob2 — Horizontal-overflow verification only covers 390px.**
`tests/e2e/public-pages.spec.ts` checks one width; the acceptance criteria
here ask for eight (320/375/390/430/768/1024/1440/1920) — seven of those have
never been checked on any page.

### Desktop

**D2 (desktop) — Large-screen canvas is underused above `2xl`.** Every page
caps content at `max-w-[86rem]` (≈1376px) inside `Container`/panel wrappers.
On a 1920px display that leaves roughly 270px of near-empty margin on each
side, filled only by the very low-opacity `.canvas-wash` gradient — no
decorative content, texture, or secondary visual interest occupies that
space. Verified by reading `Container`'s width table
(`components/ui/container.tsx:6-11`) against common desktop viewport widths;
not yet confirmed visually (see Phase 7 screenshot plan).

### Hierarchy

**H1 — The home page runs eleven consecutive sections of near-identical
visual weight.** `app/(site)/page.tsx`: hero → stats → featured designs →
value band → occasions → services → how it works → styles → testimonials →
CTA → coverage, every `Section tone="panel"` in the same white rounded-card
treatment. Nothing currently signals which 2–3 sections are the primary path
to conversion. (This is also where §9's dark-section decision would have the
most visual impact — a dark or richly-coloured section deliberately placed
here would fix H1 and satisfy the new brief's "visual rhythm" goal at once.)

**H2 — Inconsistent use of the eyebrow micro-label.** Most sections lead with
a small-caps eyebrow; "Featured Designs" (`app/(site)/page.tsx`,
`SectionHeading id="featured-designs"`) has none, with no documented rule for
when one applies.

### Spacing

**S1 — Horizontal gutters stack when `Container` sits inside a panel.**
`Section tone="panel"` (`components/ui/section.tsx`) wraps content in an
outer `px-3 sm:px-5 lg:px-6` panel, then renders `Container`
(`px-4 sm:px-6 lg:px-10`) *inside* it. At `lg` these stack to 64px of
horizontal inset per side (128px total on a 1440px viewport) — likely
unintentional, and inconsistent with Hero/HomeHero/CtaBand/ValueBand/StatBar,
which use only the outer padding with no nested `Container` padding on top.

### Dead / duplicated CSS

**D1 — `--shadow-raised` is used in exactly one place** (`button.tsx:38`,
see M3) after this engagement's earlier pass moved most hover elevation to
the new `--shadow-glow` — effectively vestigial.

### Contrast

**C4 — The WhatsApp FAB's icon fails the 3:1 UI-component minimum, computed.**
`components/layout/whatsapp-fab.tsx`: white icon on `bg-[#25D366]`. Computed
WCAG contrast: **≈1.98:1** (relative luminance of `#25D366` ≈ 0.479;
`(1.0+0.05)/(0.479+0.05) ≈ 1.98`) against the 3:1 minimum this engagement's
own acceptance criteria set. This is WhatsApp's own standard brand
treatment, used near-universally this way, so there's a real case for
accepting it as a third-party brand-mark exception — but it fails the
literal bar and deserves a deliberate decision, not silence.

## 9. Decision needed before Phase 2: light-only, or strategic dark sections?

Spelled out because it changes real implementation work, not just a
preference:

**Option A — Stay light-only** (the earlier brief's instruction, and what
`main` currently does everywhere). Phase 2 then means: richer gradients,
more ambient colour, stronger glass, better hierarchy — all within light
surfaces. Lower risk, less new component work, direct continuation of what's
already live.

**Option B — Add strategic dark/high-contrast sections** (this new brief's
explicit ask). The token system is already prepared for this — `Section
tone="inverse"` and the full `ink-inverse`/`surface-inverse` pairing already
exist and are already contrast-tested, just unused outside `/design-system`
(§2, §6). Candidate placements per the brief's own suggestions and H1 above:
home hero, the closing CTA band, possibly the footer. This is meaningfully
more implementation work (new dark-surface variants of `HomeHero`/`CtaBand`/
`SiteFooter`, re-verifying contrast for every text/icon pairing against dark
backgrounds specifically, re-checking glass-over-dark legibility) and a
bigger visual departure from what a stakeholder may have already seen on
`main`.

I'd default to **Option B** if forced to choose — it's what this brief asks
for, the tokens already exist, and it directly fixes H1 — but I'm not
picking it unilaterally given it reverses an explicit prior instruction.
Which do you want?

## 10. Proposed phased plan

Matches this brief's Phase 0–7 numbering:

- **Phase 1 (foundations)**: consolidate the four one-off shadow values
  (C2) into named tokens; fix the M3/C1 cascade-layer collision; expand glass
  from a flat single-level system to 2–4 named, background-responsive levels
  (§3's gap); name a small motion duration/easing scale; add
  `glass-surface-vivid` to `contrastContract` (C3); resolve §9.
- **Phase 2 (visual direction)**: apply §9's decision; fix H1/H2 (visual
  rhythm, documented eyebrow rule); address D2 (large-screen treatment);
  strengthen typographic weight hierarchy (§7); retire or repurpose
  `--shadow-raised` (D1).
- **Phase 3 (motion)**: gate M1/M2/Mob1 behind a breakpoint; build the
  choreography gaps in MO1–MO5 (staggered hero entrance, button icon
  micro-interactions, image reveal treatment, and — with your sign-off given
  the brief's own caution around parallax/mouse-follow cost — selective
  parallax and pointer-reactive glass).
- **Phase 4 (mobile)**: verify at all eight widths (Mob2); dedicated pass at
  320px specifically, since nothing has been checked that narrow yet.
- **Phase 5 (accessibility)**: full contrast sweep including the vivid tone
  and, if §9 goes to Option B, every new dark-surface pairing; resolve or
  document C4.
- **Phase 6 (visual polish)**: second full pass once the above lands, per
  the brief's own checklist.
- **Phase 7 (verification)**: Playwright screenshots at 375/768/1440 (plus
  the wider set from Phase 4) for every in-scope page; fix what they show;
  confirm build + existing test suite.

Branched as `feature/ui-transformation` off `main`. Will commit once per
phase, per the working rules.

**Stopping here for your approval — and specifically for a decision on §9 —
before any code changes.**
