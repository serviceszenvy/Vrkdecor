'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A figure that counts up the first time it is seen.
 *
 * The approved figures are strings ("14+", "600+", "35+"), and they must be
 * rendered exactly as approved. So this does not parse them into a number and
 * reformat: it animates the leading digits and prints the rest of the string
 * back untouched, landing on the approved string exactly. A value with no
 * leading digits is printed as it is and never animated.
 *
 * What the animation must not do is change what the figure *says*. Two things
 * guarantee that:
 *
 *   - the approved string is what renders on the server, so a crawler, a
 *     printed page and a visitor without JavaScript all get the real figure
 *     and the animation is purely a client-side embellishment;
 *   - `role="img"` with `aria-label` fixes the accessible name to the approved
 *     string, so assistive technology announces "600+" whatever number happens
 *     to be on screen at that instant. Children of `role="img"` are
 *     presentational, which is exactly the relationship wanted here: the
 *     ticking digits are a picture of the figure, not the figure itself.
 *
 * It also stays a single text node, rather than a visible copy plus a
 * screen-reader copy, so the page never contains the same figure twice.
 */
export function CountUp({
  value,
  duration = 1100,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  const target = match ? Number(match[1]) : null;
  const suffix = match ? (match[2] ?? '') : '';

  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || target === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      // The same easing family as every other movement on the site.
      const eased = 1 - Math.pow(1 - progress, 3);
      // The last frame is written from `target`, never from the easing, so the
      // figure always finishes on the approved value.
      setDisplay(progress === 1 ? null : `${Math.round(eased * target)}${suffix}`);
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(node);
          frame = window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [target, suffix, duration]);

  if (target === null) return <span className={className}>{value}</span>;

  return (
    <span ref={ref} role="img" aria-label={value} className={className}>
      {display ?? value}
    </span>
  );
}
