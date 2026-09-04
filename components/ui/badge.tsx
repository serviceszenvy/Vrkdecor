import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'brand' | 'accent' | 'neutral' | 'inverse' | 'glass';

const tones: Record<BadgeTone, string> = {
  brand: 'bg-accent-500/15 text-accent-300 border-accent-400/30',
  accent: 'bg-accent-500 text-ink-inverse border-transparent',
  neutral: 'bg-surface-muted text-ink-muted border-line-soft',
  inverse: 'bg-white/10 text-white border-white/25',
  /*
    The chip the reference design places on top of a photograph. Dark glass so
    the label never ends up as dark text lost against a dark image.
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
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
