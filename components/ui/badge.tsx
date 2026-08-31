import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'brand' | 'accent' | 'neutral' | 'inverse';

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  accent: 'bg-accent-100 text-accent-900 border-accent-300',
  neutral: 'bg-sand-100 text-sand-800 border-sand-200',
  inverse: 'bg-white/10 text-white border-white/25',
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
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
