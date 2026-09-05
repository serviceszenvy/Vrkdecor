'use client';

import { useEffect, useRef } from 'react';

/**
 * Reading progress, and the page's "has scrolled" state.
 *
 * Two jobs, one scroll listener, because a second listener on the same event
 * is a second chance to drop a frame on a phone:
 *
 *   1. it scales a 2px lime rail across the top of the document, which tells a
 *      visitor how much of a long portfolio page is left;
 *   2. it stamps `data-scrolled` on the document element, which is what
 *      condenses the floating header (`.header-shell` in `app/globals.css`).
 *
 * The rail is driven by `transform: scaleX`, so the browser composites it
 * without touching layout or paint, and the work is coalesced into one
 * animation frame per scroll burst. Under `prefers-reduced-motion` the rail is
 * not rendered at all — a bar that tracks the scroll is motion by definition —
 * while the header state, which is not movement, keeps working.
 */
export function ScrollProgress() {
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const max = root.scrollHeight - root.clientHeight;
      const y = window.scrollY;
      root.dataset.scrolled = y > 8 ? 'true' : 'false';
      const node = rail.current;
      if (node) {
        node.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      delete root.dataset.scrolled;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 motion-reduce:hidden"
      style={{ marginTop: 'var(--safe-top)' }}
    >
      <div
        ref={rail}
        className="progress-rail h-full w-full scale-x-0 rounded-r-full"
      />
    </div>
  );
}
