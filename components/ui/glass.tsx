import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Glassmorphism primitives.
 *
 * The approved reference design uses translucency to let photography stay
 * visible *through* the interface. It is not a finish applied to everything: a
 * page where every box is glass has no depth at all, because nothing is behind
 * anything. So these primitives exist in a small number of deliberate places —
 * the floating header, the hero feature panel, the statistics bar, chips over
 * photography, the mobile navigation sheet, the floating actions and the admin
 * sidebar — and ordinary opaque cards are used everywhere else.
 *
 * Accessibility and performance are built in rather than traded away:
 *   - the translucent values only apply where `backdrop-filter` is supported,
 *     so an unsupported browser gets a near-opaque panel instead of text on a
 *     photograph (see the `@supports` block in `app/globals.css`)
 *   - `tone="strong"` is used wherever text density is high
 *   - the blur radius is capped in the tokens, because `backdrop-filter`
 *     repaints on every scroll frame
 */

type GlassTone = 'default' | 'strong' | 'tint' | 'vivid';
type GlassRadius = 'lg' | 'xl' | '2xl' | '3xl' | 'pill';

const tones: Record<GlassTone, string> = {
  default: 'glass-surface',
  strong: 'glass-surface-strong',
  tint: 'glass-surface-tint',
  vivid: 'glass-surface-vivid',
};

const radii: Record<GlassRadius, string> = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  pill: 'rounded-full',
};

export function GlassPanel({
  children,
  tone = 'default',
  radius = '2xl',
  edge = true,
  className,
  as: Tag = 'div',
  id,
  'aria-labelledby': ariaLabelledBy,
}: {
  children: ReactNode;
  tone?: GlassTone;
  radius?: GlassRadius;
  /** The thin top highlight that makes the edge read as glass. */
  edge?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'aside' | 'header' | 'nav' | 'ul' | 'li';
  id?: string;
  'aria-labelledby'?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(tones[tone], radii[radius], edge && 'glass-edge', className)}
    >
      {children}
    </Tag>
  );
}

/**
 * The circular icon plate used beside every feature, statistic and value in the
 * reference design. Decorative by itself: the icon inside is `aria-hidden` and
 * the accessible text is the heading next to it.
 */
export function IconChip({
  children,
  tone = 'brand',
  size = 'md',
  className,
}: {
  children: ReactNode;
  tone?: 'brand' | 'tint' | 'glass' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200/70',
    tint: 'bg-white/70 text-brand-700 ring-1 ring-white/70',
    glass: 'glass-surface text-brand-700',
    solid: 'bg-brand-700 text-white',
  } as const;

  const sizes = {
    sm: 'size-10',
    md: 'size-12',
    lg: 'size-14',
  } as const;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        'transition-[transform,background-color,box-shadow] duration-300 ease-out',
        'motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-105',
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * The small leaf rule under a centred section heading in the reference design.
 * Purely decorative, so it is hidden from assistive technology.
 */
export function LeafRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex items-center justify-center gap-2', className)}
    >
      <span className="from-brand-300/0 to-brand-400 h-px w-10 bg-gradient-to-r" />
      <svg viewBox="0 0 24 24" className="text-brand-500 size-3.5" fill="currentColor">
        <path d="M12 3c3.6 2 5.4 4.3 5.4 7a5.4 5.4 0 0 1-10.8 0c0-2.7 1.8-5 5.4-7Z" />
      </svg>
      <span className="from-brand-400 to-brand-300/0 h-px w-10 bg-gradient-to-r" />
    </span>
  );
}
