import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'brand' | 'accent' | 'neutral' | 'inverse' | 'glass';

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-800/70 text-accent-300 border-brand-600/50',
  accent: 'bg-accent-900/60 text-accent-300 border-accent-700/60',
  neutral: 'bg-white/8 text-ink-muted border-white/12',
  inverse: 'bg-white/10 text-white border-white/25',
  /*
    The chip the reference design places on top of a photograph. It falls back
    to a near-opaque dark pill where `backdrop-filter` is unsupported, so the
    label never ends up as low-contrast text floating on a busy image.
  */
  glass: 'glass-surface-strong text-ink border-transparent',
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
