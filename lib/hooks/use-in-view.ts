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
  // Always false initially, on both the server and the client's first paint.
  // `typeof IntersectionObserver` is genuinely `undefined` during SSR (no DOM
  // in Node), so resolving the "unsupported" fallback in a `useState`
  // initializer — which runs during that same server render — makes the
  // server and the client's first client-side render disagree and React logs
  // a hydration mismatch on every page that uses `Reveal`. This effect never
  // runs during SSR, so the check is safe here and was never the problem.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    if (typeof IntersectionObserver === 'undefined') {
      // A one-time, guarded (returns above once `inView`) client-only
      // feature-detection fallback for a browser that cannot run the real
      // observer below — not the render-cascade pattern this rule targets.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInView(true);
      return;
    }

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
