/**
 * VRK Decor — AI-derived proposed digital design system tokens.
 *
 * IMPORTANT: This is an AI-derived PROPOSED digital design system, not an
 * official VRK Decor brand guideline. It was produced by analysing the supplied
 * logo (`07_BRAND_ASSETS/vrk-decor-logo.jpg`) because no official brand guide
 * was supplied. It must be reviewed and approved by VRK Decor, and superseded
 * if an official brand guideline is later provided.
 *
 * Derivation (see docs/DESIGN-SYSTEM.md for the full rationale):
 * - `accent.500` (#8EC840) is the exact lime measured in the "VRK" wordmark.
 * - `brand.700` (#61764B) is the exact sage measured in the "DECOR" wordmark,
 *   the leaf and the enclosing ellipse.
 * - The remaining steps are a lightness ramp on the same hues.
 * - `sand` is a low-chroma warm neutral chosen to sit behind photography
 *   without competing with it.
 *
 * This file is the single source of truth for the palette. `app/globals.css`
 * mirrors these values into Tailwind theme variables, and
 * `tests/unit/design-tokens.test.ts` fails if the two ever drift apart or if a
 * documented text/background pairing stops meeting WCAG 2.1 AA.
 */

/** Measured directly from the supplied logo artwork. */
export const logoColors = {
  lime: '#8EC840',
  sage: '#61764B',
} as const;

export const palette = {
  /** Sage/olive — the primary brand colour. Calm, natural, premium. */
  brand: {
    50: '#F6F9F3',
    100: '#ECF2E6',
    200: '#DAE5CF',
    300: '#C2D2B2',
    400: '#A4BB8B',
    500: '#85A06A',
    600: '#6D8455',
    700: '#61764B',
    800: '#475637',
    900: '#37432B',
    950: '#242C1C',
  },
  /** Lime — the logo's highlight colour. Used sparingly, never for small text. */
  accent: {
    50: '#F7FBF1',
    100: '#EDF7E0',
    200: '#DDF0C4',
    300: '#C7E79D',
    400: '#AAD671',
    500: '#8EC840',
    600: '#74A831',
    700: '#5E8828',
    800: '#4B6D20',
    900: '#3B5519',
    950: '#263710',
  },
  /** Warm neutral — surfaces, text and borders behind photography. */
  sand: {
    50: '#F7F7F5',
    100: '#EDEEEA',
    200: '#DCDDD7',
    300: '#C5C6BE',
    400: '#A7AA9D',
    500: '#898B7E',
    600: '#707267',
    700: '#5B5C54',
    800: '#484A43',
    900: '#393A34',
    950: '#252522',
  },
} as const;

/**
 * Semantic roles. Components reference these, not raw palette steps, so the
 * palette can be re-tuned after client review without touching components.
 *
 * Redefined for the full dark-theme transformation: `canvas` is exactly the
 * brief's `#37432B` (`brand.900`), and every other ground is a darker or
 * lighter step of the same brand-dark family (plus `sand` for a distinct
 * neutral-dark alternating zone), never a flat repeat of the same colour —
 * "do not make every section exactly the same colour."
 *
 * `ink`/`inkMuted`/`inkSoft` flip to light values for the dark ground.
 * `surfaceInverse`/`inkInverse` flip roles too: they were "the one dark
 * exception" on a light site; now they are "the one bright exception" for an
 * occasional light card on the dark site (used sparingly, for hierarchy).
 */
export const semanticColors = {
  /** Card/raised-panel surface — one step lighter than `canvas`, so panels read as floating above the page rather than blending into it. */
  surface: palette.brand[800],
  /**
   * The page ground. Exactly the brief's `#37432B`. Every panel, card and
   * glass surface sits on this by default.
   */
  canvas: palette.brand[900],
  /** A deeper ground — recessed panels, or where two dark bands meet. */
  canvasDeep: palette.brand[950],
  /** A distinct dark zone for alternating sections — warm neutral, not brand-green, so it reads as a different area without ever going light. */
  surfaceTint: palette.sand[900],
  /** A further neutral-dark alternating background. */
  surfaceSubtle: palette.sand[950],
  /** Inset panels and image placeholders — distinct from both `surface` and `canvas`. */
  surfaceMuted: palette.sand[800],
  /**
   * The one bright exception, used sparingly for a strong hierarchy pop on
   * an otherwise all-dark page (e.g. a single featured callout card).
   */
  surfaceInverse: '#F5F7F1',
  /** Primary body and heading text — light, for the dark ground. */
  ink: '#F5F7F1',
  /** Secondary text, captions and metadata. */
  inkMuted: palette.sand[300],
  /** Body text on a TINTED dark surface, where `inkMuted` sits closer to its contrast floor. */
  inkSoft: palette.sand[200],
  /** Text for use on the occasional bright `surfaceInverse` card. */
  inkInverse: palette.brand[950],
  /** Hairlines and dividers — a lighter brand step, visible against every dark ground above. */
  border: palette.brand[600],
  /** The softer hairline, closer to the surface it sits on. */
  borderSoft: palette.brand[700],
  /**
   * Primary action background.
   *
   * `brand.700` is the sage measured in the logo itself. White on it is 5.00:1,
   * so it clears WCAG AA for a button label, and it is the mid-olive the
   * approved reference design uses for its primary buttons. Unchanged by the
   * dark-theme transformation — a self-contained colour, independent of the
   * ground it sits on.
   */
  actionPrimary: palette.brand[700],
  actionPrimaryHover: palette.brand[800],
  /** Accent action background — pairs with dark text only (never `ink`, which is now light). */
  actionAccent: palette.accent[500],
  actionAccentHover: palette.accent[600],
  /** Brand-coloured text and links, verified against every dark ground in this file. */
  brandText: palette.brand[300],
  /** Same value — kept as a distinct token for call sites that want to name "strong" emphasis explicitly, not because the colour differs. */
  brandTextStrong: palette.brand[300],
  /** Focus ring — accent, not brand: `brand.700` measures under 3:1 against these dark grounds. */
  focus: palette.accent[300],
} as const;

/**
 * Text/background pairings this design system commits to.
 * Verified against WCAG 2.1 by `tests/unit/design-tokens.test.ts`.
 * `min` is the required contrast ratio: 4.5 for normal text, 3 for large text
 * (>=24px, or >=18.66px bold) and for non-text UI boundaries.
 */
export const contrastContract = [
  // --- Body text against every dark ground in the system ---
  { name: 'body text on surface', fg: semanticColors.ink, bg: semanticColors.surface, min: 4.5 },
  { name: 'body text on canvas', fg: semanticColors.ink, bg: semanticColors.canvas, min: 4.5 },
  {
    name: 'body text on canvas deep',
    fg: semanticColors.ink,
    bg: semanticColors.canvasDeep,
    min: 4.5,
  },
  {
    name: 'body text on tinted panel',
    fg: semanticColors.ink,
    bg: semanticColors.surfaceTint,
    min: 4.5,
  },
  {
    name: 'body text on subtle surface',
    fg: semanticColors.ink,
    bg: semanticColors.surfaceSubtle,
    min: 4.5,
  },
  // --- Muted/soft secondary text — the tighter cases, since these sit closer to the 4.5:1 floor ---
  {
    name: 'muted text on surface',
    fg: semanticColors.inkMuted,
    bg: semanticColors.surface,
    min: 4.5,
  },
  {
    name: 'muted text on canvas',
    fg: semanticColors.inkMuted,
    bg: semanticColors.canvas,
    min: 4.5,
  },
  {
    name: 'muted text on subtle surface',
    fg: semanticColors.inkMuted,
    bg: semanticColors.surfaceSubtle,
    min: 4.5,
  },
  {
    name: 'muted text on tinted panel',
    fg: semanticColors.inkMuted,
    bg: semanticColors.surfaceTint,
    min: 4.5,
  },
  {
    name: 'soft text on tinted panel',
    fg: semanticColors.inkSoft,
    bg: semanticColors.surfaceTint,
    min: 4.5,
  },
  // --- Brand-coloured text/links — the lightened brand-300, checked against every ground ---
  {
    name: 'brand text on surface',
    fg: semanticColors.brandText,
    bg: semanticColors.surface,
    min: 4.5,
  },
  {
    name: 'brand text on canvas',
    fg: semanticColors.brandText,
    bg: semanticColors.canvas,
    min: 4.5,
  },
  {
    name: 'brand text on tinted panel',
    fg: semanticColors.brandTextStrong,
    bg: semanticColors.surfaceTint,
    min: 4.5,
  },
  {
    name: 'brand text on canvas deep',
    fg: semanticColors.brandTextStrong,
    bg: semanticColors.canvasDeep,
    min: 4.5,
  },
  // --- Focus ring (accent-300, not brand — brand.700 measures under 3:1 on these grounds) ---
  { name: 'focus ring on surface', fg: semanticColors.focus, bg: semanticColors.surface, min: 3 },
  { name: 'focus ring on canvas', fg: semanticColors.focus, bg: semanticColors.canvas, min: 3 },
  // --- Structural ---
  {
    name: 'border on surface',
    fg: semanticColors.border,
    bg: semanticColors.surface,
    min: 1.2,
  },
  // --- Buttons: self-contained colour pairs, independent of the ground they sit on ---
  {
    name: 'primary button label',
    fg: '#FFFFFF',
    bg: semanticColors.actionPrimary,
    min: 4.5,
  },
  {
    name: 'primary button label (hover)',
    fg: '#FFFFFF',
    bg: semanticColors.actionPrimaryHover,
    min: 4.5,
  },
  {
    // Accent buttons always pair with dark ink, never the (now light) `ink`
    // token — accent-500 is a light lime regardless of the site's theme.
    name: 'accent button label',
    fg: palette.brand[950],
    bg: semanticColors.actionAccent,
    min: 4.5,
  },
  {
    name: 'accent button label (hover)',
    fg: palette.brand[950],
    bg: semanticColors.actionAccentHover,
    min: 4.5,
  },
  // --- The one bright exception surface (`surfaceInverse`) ---
  {
    name: 'text on the bright exception surface',
    fg: semanticColors.inkInverse,
    bg: semanticColors.surfaceInverse,
    min: 4.5,
  },
  {
    // The opaque fallback of `glass-surface-vivid` (rgb(75 109 32 / 0.95))
    // composited over `canvas` (brand-900) — the dark ground it now sits on.
    // docs/ui-audit.md finding C3: this tone previously had no automated
    // contrast coverage.
    name: 'text on vivid glass',
    fg: semanticColors.ink,
    bg: '#4A6B21',
    min: 4.5,
  },
] as const;

/**
 * Glassmorphism tokens — redefined dark for the full dark-theme
 * transformation. Translucency still exists to let content (photography,
 * the ambient blobs and gradients behind a panel) stay visible through the
 * interface, not as a decorative finish on every box, so these stay
 * restrained: `blur` is capped, because a large `backdrop-filter` radius is
 * repainted on every scroll frame and is the single most expensive thing a
 * glass design can do to a mid-range phone.
 *
 * Four levels, each with a distinct role, not four names for the same
 * darkness: `surface` is the everyday dark glass, `surfaceStrong` is denser
 * and more opaque for text-heavy panels, `surfaceTint`/`surfaceVivid` are
 * brand- and accent-tinted glass for a small number of highlight moments,
 * and `surfaceInverse` is now the one *bright* glass exception (roles
 * flipped from the light theme, where it was the one dark exception).
 *
 * Where each one is allowed to appear is documented in docs/DESIGN-SYSTEM.md.
 */
export const glass = {
  /** Default dark glass — the header, floating panels, chips. */
  surface: 'rgb(55 67 43 / 0.55)',
  /** Denser, more opaque dark glass — dense text, the mobile nav sheet. */
  surfaceStrong: 'rgb(36 44 28 / 0.82)',
  /** Brand-tinted (sage) glass for a calmer highlight than `surfaceVivid`. */
  surfaceTint: 'rgb(71 86 55 / 0.62)',
  /** Accent-tinted (lime) glass for a small number of featured moments. */
  surfaceVivid: 'rgb(75 109 32 / 0.65)',
  /** The one bright exception — a light, near-opaque card for hierarchy. */
  surfaceInverse: 'rgb(245 247 241 / 0.82)',
  /** A subtle accent-coloured glow, not a plain white edge. */
  border: 'rgb(199 231 157 / 0.35)',
  borderSoft: 'rgb(142 200 64 / 0.18)',
  highlight: 'rgb(199 231 157 / 0.4)',
  blur: '16px',
  blurStrong: '24px',
} as const;

/**
 * Fluid type scale. Values are `clamp(min, preferred, max)` so headings scale
 * with the viewport without a media query at every breakpoint.
 */
export const typeScale = {
  '2xs': '0.75rem',
  xs: '0.8125rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: 'clamp(1.25rem, 1.15rem + 0.4vw, 1.375rem)',
  '2xl': 'clamp(1.5rem, 1.35rem + 0.7vw, 1.75rem)',
  '3xl': 'clamp(1.875rem, 1.6rem + 1.2vw, 2.25rem)',
  '4xl': 'clamp(2.25rem, 1.85rem + 1.9vw, 3rem)',
  '5xl': 'clamp(2.75rem, 2.1rem + 3vw, 4rem)',
} as const;

/** Section rhythm. Sections use these vertical paddings, nothing ad hoc. */
export const sectionSpacing = {
  compact: 'py-10 sm:py-12',
  default: 'py-14 sm:py-20',
  spacious: 'py-20 sm:py-28',
  /** Inside a rounded panel, which already carries its own inset. */
  panel: 'py-12 sm:py-16',
} as const;

export const radii = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.875rem',
  xl: '1.25rem',
  '2xl': '1.75rem',
  '3xl': '2.25rem',
  full: '9999px',
} as const;

/** Breakpoints are Tailwind's defaults; recorded here so documentation is exact. */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Minimum interactive target size in CSS pixels.
 * WCAG 2.1 AA requires 24x24; this system commits to 44x44 for touch comfort.
 */
export const minTouchTargetPx = 44;

export type Palette = typeof palette;
export type SemanticColors = typeof semanticColors;
export type Glass = typeof glass;
