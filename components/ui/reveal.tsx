'use client';

import { createElement, type CSSProperties, type ReactNode } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { cn } from '@/lib/cn';

/**
 * Reveals its children with a soft fade-and-rise as they scroll into view.
 *
 * Content is never hidden from a visitor without JavaScript or with
 * `prefers-reduced-motion` set: the `.reveal` base styles only apply inside
 * `@media (scripting: enabled)` (see `app/globals.css`), and the global
 * reduced-motion rule zeroes every transition duration, so those visitors see
 * the final state immediately rather than a stuck, invisible section.
 *
 * `delay` staggers a grid of siblings — pass `index * 60` capped by the
 * caller, so the whole grid finishes settling well under a second.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: 'div' | 'li' | 'article' | 'dl' | 'ul' | 'section';
  /** Stagger delay in milliseconds. */
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>();

  return createElement(
    Tag,
    {
      ref,
      className: cn('reveal', inView && 'is-visible', className),
      style: delay
        ? ({ transitionDelay: `${delay}ms` } satisfies CSSProperties)
        : undefined,
    },
    children,
  );
}
