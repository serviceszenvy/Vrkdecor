import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardTone = 'surface' | 'glass' | 'tint' | 'plain';

const tones: Record<CardTone, string> = {
  surface: 'bg-surface border border-line-soft',
  glass: 'glass-surface glass-edge',
  tint: 'bg-surface-tint border border-accent-300/20',
  plain: 'border border-transparent',
};

/**
 * A subtle accent-coloured glow on hover, not a flat border-colour swap — it
 * reads as a glass reflection catching the light, per the dark-theme brief.
 */
const interactiveBorders: Record<CardTone, string> = {
  surface: 'hover:border-accent-300/50 focus-within:border-accent-300/50',
  glass: '',
  tint: 'hover:border-accent-300/60 focus-within:border-accent-300/60',
  plain: '',
};

/**
 * Surface container for portfolio designs, services, packages and testimonials.
 *
 * `interactive` adds the lift used when the whole card is a link target. The
 * transform is `motion-safe`, so a visitor who has asked for reduced motion
 * still gets the shadow change and no movement.
 */
export function Card({
  children,
  className,
  interactive = false,
  tone = 'surface',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  tone?: CardTone;
  as?: 'div' | 'article' | 'li';
}) {
  return (
    <Tag
      className={cn(
        'overflow-hidden rounded-2xl',
        tones[tone],
        interactive &&
          cn(
            'group transition-[box-shadow,transform,border-color] duration-300 ease-out',
            // `.glass-surface` already sets its own box-shadow in a CSS layer
            // that a `hover:shadow-*` Tailwind utility would silently
            // override rather than blend with — see the comment on
            // `.glass-hover-glow` in app/globals.css (finding M3/C1).
            tone === 'glass'
              ? 'glass-hover-glow'
              : 'shadow-card hover:shadow-glow focus-within:shadow-glow',
            interactiveBorders[tone],
            'motion-safe:focus-within:-translate-y-1 motion-safe:hover:-translate-y-1',
          ),
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2 p-5 sm:p-6', className)}>{children}</div>
  );
}

export function CardTitle({
  children,
  className,
  as: Tag = 'h3',
}: {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}) {
  return (
    <Tag className={cn('font-display text-xl font-medium', className)}>{children}</Tag>
  );
}

export function CardMeta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-ink-muted text-sm leading-relaxed', className)}>
      {children}
    </p>
  );
}
