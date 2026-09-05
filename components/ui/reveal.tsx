'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type RevealEffect = 'rise' | 'scale' | 'left' | 'right' | 'mask';

/**
 * Scroll reveal.
 *
 * Marks its element `data-reveal` and flips it to `data-reveal="visible"` the
 * first time it enters the viewport. The visuals live in `app/globals.css`, so
 * this component owns exactly one thing: the observation.
 *
 * Nothing is ever hidden without a way back. The hidden state applies only
 * under `@media (scripting: enabled)`, so a page without JavaScript shows
 * everything at once; `prefers-reduced-motion` collapses the transition to an
 * instant; and an element already in view when the page loads is revealed on
 * the first observer callback, not on the first scroll.
 *
 * `delay` staggers siblings. Use it for the cards in one grid, never for
 * unrelated sections: a section should not wait for the one above it.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  effect = 'rise',
  delay = 0,
  className,
  style,
  once = true,
  id,
  'aria-labelledby': ariaLabelledBy,
}: {
  children: ReactNode;
  as?: 'div' | 'section' | 'li' | 'ul' | 'article' | 'figure' | 'span' | 'header';
  effect?: RevealEffect;
  /** Milliseconds; staggers siblings within one group. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
  id?: string;
  'aria-labelledby'?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      node.dataset.reveal = 'visible';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.dataset.reveal = 'visible';
            if (once) observer.unobserve(node);
          } else if (!once) {
            node.dataset.reveal = 'hidden';
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      // The element type is decided by the caller; the ref only needs an
      // HTMLElement to hand to the observer.
      ref={ref as never}
      id={id}
      aria-labelledby={ariaLabelledBy}
      data-reveal="hidden"
      data-reveal-effect={effect === 'rise' ? undefined : effect}
      className={cn(className)}
      style={
        delay ? ({ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties) : style
      }
    >
      {children}
    </Tag>
  );
}
