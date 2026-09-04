'use client';

import { createElement, type CSSProperties, type ReactNode } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { cn } from '@/lib/cn';

const VARIANT_CLASS = {
  /** Fade and rise — section content, cards, list items. */
  rise: 'reveal',
  /** Settle from a slight zoom — photography (docs/ui-audit.md finding MO4). */
  image: 'image-reveal',
} as const;

/**
 * Reveals its children as they scroll into view — a soft fade-and-rise by
 * default, or a settling zoom for photography (`variant="image"`).
 *
 * Content is never hidden from a visitor without JavaScript or with
 * `prefers-reduced-motion` set: the base styles for both variants only apply
 * inside `@media (scripting: enabled)` (see `app/globals.css`), and the
 * global reduced-motion rule zeroes every transition duration, so those
 * visitors see the final state immediately rather than a stuck, invisible or
 * permanently-zoomed element.
 *
 * `delay` staggers a grid of siblings — pass `index * 60` capped by the
 * caller, so the whole grid finishes settling well under a second.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  variant = 'rise',
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: 'div' | 'li' | 'article' | 'dl' | 'ul' | 'section';
  variant?: keyof typeof VARIANT_CLASS;
  /** Stagger delay in milliseconds. */
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>();

  return createElement(
    Tag,
    {
      ref,
      className: cn(VARIANT_CLASS[variant], inView && 'is-visible', className),
      style: delay
        ? ({ transitionDelay: `${delay}ms` } satisfies CSSProperties)
        : undefined,
    },
    children,
  );
}
