import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'brand' | 'accent' | 'neutral' | 'inverse' | 'glass' | 'lime' | 'deep';

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-800 border-brand-200',
  accent: 'bg-accent-100 text-accent-900 border-accent-300',
  neutral: 'bg-sand-100 text-sand-800 border-sand-200',
  inverse: 'bg-white/10 text-white border-white/25',
  /*
    The chip the reference design places on top of a photograph. It falls back
    to a near-opaque white pill where `backdrop-filter` is unsupported, so the
    label never ends up as dark text floating on a dark image.
  */
  glass: 'glass-surface-strong text-brand-800 border-transparent',
  /* Lime pill, for one highlighted label on a dark surface or a photograph. */
  lime: 'bg-accent-500 text-brand-950 border-transparent shadow-[0_6px_16px_-6px_rgb(142_200_64/0.8)]',
  /* Dark olive pill with a lime hairline, for the light ground. */
  deep: 'bg-brand-900 text-accent-200 border-accent-500/40',
};

/** Used for occasion, style and service tags on portfolio cards (P5). */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
