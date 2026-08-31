import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AspectRatio = 'square' | 'portrait' | 'landscape' | 'wide' | 'hero';

const ratios: Record<AspectRatio, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  hero: 'aspect-[4/5] sm:aspect-[16/9]',
};

/**
 * Photography frame for the portfolio. Fixes the aspect ratio so grids do not
 * shift while images load, and applies the system's imagery treatment: a warm
 * neutral placeholder, subtle rounding and a restrained zoom on hover that is
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
  rounded = true,
}: {
  children?: ReactNode;
  ratio?: AspectRatio;
  className?: string;
  zoomOnHover?: boolean;
  rounded?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-surface-muted relative isolate overflow-hidden',
        rounded && 'rounded-lg',
        ratios[ratio],
        className,
      )}
    >
      <div
        className={cn(
          'h-full w-full',
          zoomOnHover &&
            'motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.04]',
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
export function ImageScrim({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent',
        className,
      )}
    />
  );
}
