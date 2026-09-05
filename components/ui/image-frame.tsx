import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AspectRatio =
  | 'square'
  | 'portrait'
  | 'tall'
  | 'landscape'
  | 'wide'
  | 'hero'
  | 'card';

const ratios: Record<AspectRatio, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  tall: 'aspect-[4/5]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  hero: 'aspect-[4/5] sm:aspect-[16/10]',
  /** The portfolio card proportion used in the approved reference design. */
  card: 'aspect-[5/6]',
};

const radii = {
  none: '',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-3xl',
} as const;

/**
 * Photography frame for the portfolio. Fixes the aspect ratio so grids do not
 * shift while images load, and applies the system's imagery treatment: a warm
 * neutral placeholder, generous rounding and a restrained zoom on hover that is
 * disabled under `prefers-reduced-motion`.
 *
 * The image element itself is supplied by the consuming feature (P5), so this
 * primitive stays free of data and layout assumptions.
 */
export function ImageFrame({
  children,
  ratio = 'landscape',
  className,
  zoomOnHover = false,
  radius = 'xl',
}: {
  children?: ReactNode;
  ratio?: AspectRatio;
  className?: string;
  zoomOnHover?: boolean;
  radius?: keyof typeof radii;
}) {
  return (
    <div
      className={cn(
        'bg-surface-muted relative isolate overflow-hidden',
        radii[radius],
        ratios[ratio],
        className,
      )}
    >
      {/*
        `relative` is required, not cosmetic: a `next/image` with `fill` inside
        this wrapper is absolutely positioned, and without a positioned wrapper
        it resolves against whatever ancestor happens to be positioned. Next
        warns about exactly this.
      */}
      <div
        className={cn(
          'relative h-full w-full',
          zoomOnHover &&
            'motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.06]',
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Gradient scrim for text placed over photography. Keeps overlaid captions
 * legible regardless of the underlying image.
 */
export function ImageScrim({
  className,
  strength = 'default',
}: {
  className?: string;
  strength?: 'default' | 'soft' | 'strong';
}) {
  const strengths = {
    soft: 'from-black/50 via-black/10 to-transparent',
    default: 'from-black/70 via-black/20 to-transparent',
    strong: 'from-black/85 via-black/40 to-black/5',
  } as const;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 bg-gradient-to-t',
        strengths[strength],
        className,
      )}
    />
  );
}
