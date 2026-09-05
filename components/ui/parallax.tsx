'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Scroll parallax.
 *
 * Moves its child a few pixels against the scroll, which is what gives a
 * layered composition its depth. Everything about it is deliberately cheap:
 *
 *   - only `transform` is written, so the browser composites and never
 *     re-lays-out;
 *   - the scroll handler does nothing but request one animation frame, so a
 *     burst of scroll events costs one write;
 *   - an `IntersectionObserver` stops the work entirely while the element is
 *     off screen, which is most of a long portfolio page;
 *   - `prefers-reduced-motion` skips the whole effect, and the element simply
 *     sits where the layout put it.
 *
 * `strength` is the total travel in pixels across a full viewport of scroll.
 * Keep it small — this should be felt rather than noticed.
 */
export function Parallax({
  children,
  strength = 28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let visible = false;

    const apply = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // -1 when the element is just below the fold, 1 when it has just left
      // the top; 0 when it is centred.
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      const offset = Math.max(-1, Math.min(1, progress)) * strength;
      node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (visible && !frame) frame = window.requestAnimationFrame(apply);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) onScroll();
      },
      { rootMargin: '20% 0px' },
    );
    observer.observe(node);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}
