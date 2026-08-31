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
 */
export const semanticColors = {
  /** Page background. */
  surface: '#FFFFFF',
  /** Alternating section background. */
  surfaceSubtle: palette.sand[50],
  /** Inset panels and image placeholders. */
  surfaceMuted: palette.sand[100],
  /** Dark surface used for the footer and full-bleed feature bands. */
  surfaceInverse: palette.sand[950],
  /** Primary body and heading text. */
  ink: palette.sand[950],
  /** Secondary text, captions and metadata. */
  inkMuted: palette.sand[600],
  /** Text on dark surfaces. */
  inkInverse: '#FFFFFF',
  /** Hairlines and dividers. */
  border: palette.sand[200],
  /** Primary action background. */
  actionPrimary: palette.brand[800],
  actionPrimaryHover: palette.brand[900],
  /** Accent action background — pairs with ink text only. */
  actionAccent: palette.accent[500],
  actionAccentHover: palette.accent[600],
  /** Brand-coloured text and links on light surfaces. */
  brandText: palette.brand[700],
  /** Focus ring. */
  focus: palette.brand[700],
} as const;

/**
 * Text/background pairings this design system commits to.
 * Verified against WCAG 2.1 by `tests/unit/design-tokens.test.ts`.
 * `min` is the required contrast ratio: 4.5 for normal text, 3 for large text
 * (>=24px, or >=18.66px bold) and for non-text UI boundaries.
 */
export const contrastContract = [
  {
    name: 'body text on surface',
    fg: semanticColors.ink,
    bg: semanticColors.surface,
    min: 4.5,
  },
  {
    name: 'body text on subtle surface',
    fg: semanticColors.ink,
    bg: semanticColors.surfaceSubtle,
    min: 4.5,
  },
  {
    name: 'muted text on surface',
    fg: semanticColors.inkMuted,
    bg: semanticColors.surface,
    min: 4.5,
  },
  {
    name: 'muted text on subtle surface',
    fg: semanticColors.inkMuted,
    bg: semanticColors.surfaceSubtle,
    min: 4.5,
  },
  {
    name: 'brand text on surface',
    fg: semanticColors.brandText,
    bg: semanticColors.surface,
    min: 4.5,
  },
  {
    name: 'inverse text on dark surface',
    fg: semanticColors.inkInverse,
    bg: semanticColors.surfaceInverse,
    min: 4.5,
  },
  {
    name: 'primary button label',
    fg: semanticColors.inkInverse,
    bg: semanticColors.actionPrimary,
    min: 4.5,
  },
  {
    name: 'primary button label (hover)',
    fg: semanticColors.inkInverse,
    bg: semanticColors.actionPrimaryHover,
    min: 4.5,
  },
  {
    name: 'accent button label',
    fg: semanticColors.ink,
    bg: semanticColors.actionAccent,
    min: 4.5,
  },
  {
    name: 'accent button label (hover)',
    fg: semanticColors.ink,
    bg: semanticColors.actionAccentHover,
    min: 4.5,
  },
  {
    name: 'accent text on dark surface',
    fg: palette.accent[300],
    bg: semanticColors.surfaceInverse,
    min: 4.5,
  },
  {
    name: 'focus ring on surface',
    fg: semanticColors.focus,
    bg: semanticColors.surface,
    min: 3,
  },
  {
    name: 'border on surface',
    fg: semanticColors.border,
    bg: semanticColors.surface,
    min: 1.2,
  },
] as const;

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
} as const;

export const radii = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.875rem',
  xl: '1.5rem',
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
