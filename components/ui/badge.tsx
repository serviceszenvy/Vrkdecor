import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'brand' | 'accent' | 'neutral' | 'inverse' | 'glass';

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
        'transition-colors duration-200',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
