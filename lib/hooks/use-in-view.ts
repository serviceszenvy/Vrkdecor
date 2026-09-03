'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tracks whether an element has scrolled into view, once.
 *
 * Used to drive scroll-reveal motion (`components/ui/reveal.tsx`). Fires
 * slightly before the element fully enters the viewport so the reveal is
 * complete by the time it is comfortably readable, and never re-hides once
 * triggered — a section should not flicker if a visitor scrolls back past it.
 */
export function useInView<T extends Element>({
  rootMargin = '0px 0px -10% 0px',
}: {
  rootMargin?: string;
} = {}) {
  const ref = useRef<T | null>(null);
  // Browsers without IntersectionObserver start already "in view", so content
  // is never stuck hidden — resolved once at init, never via a setState call
  // inside the effect body.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
