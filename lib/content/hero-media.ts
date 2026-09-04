/**
 * The photograph behind the home page hero.
 *
 * Requirements section 7 asks for a premium hero image or video, and no
 * approved photography has been supplied yet
 * (09_DECISIONS/DECISIONS.md — "Approved hero photography or video").
 *
 * THIS IS THE SINGLE REPLACEMENT POINT. When the approved photograph arrives:
 *
 *   1. put the file in `public/brand/` (not `public/samples/`, which is deleted
 *      before the production build),
 *   2. change `src`, `width` and `height` here,
 *   3. set `isPlaceholder` to false.
 *
 * Nothing else in the application needs to change. The hero renders the brand
 * gradient underneath the image, so if the file is missing — which is what
 * happens once `public/samples/` is deleted and before a real photograph is
 * supplied — the section still reads as finished rather than broken.
 *
 * `alt` is deliberately empty. The image is decorative: the headline beside it
 * carries the meaning, and a synthetic placeholder must not describe itself as
 * a photograph of VRK Decor's work.
 */
export const heroImage = {
  src: '/samples/hero-celebration.webp',
  width: 2000,
  height: 1250,
  alt: '',
  /** True while this is the generated placeholder rather than real photography. */
  isPlaceholder: true,
} as const;

export type HeroImage = typeof heroImage;
