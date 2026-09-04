'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/layout/icons';
import { Reveal } from '@/components/ui';
import { DesignCard } from './design-card';
import type { PortfolioDesign } from '../types';

/**
 * The horizontal rail of featured designs used on the home page.
 *
 * It is a scroll container with snap points, not a carousel: no autoplay, no
 * timer, no hidden slides. Everything in it is in the document, in order, and
 * reachable by keyboard through ordinary tab navigation. The arrows are a
 * convenience for a mouse, so they are hidden from assistive technology users
 * only in the sense that they duplicate scrolling, and they are disabled at
 * each end rather than wrapping around, which would move content under
 * somebody's cursor unexpectedly.
 *
 * Scroll position is read on scroll to decide whether each arrow is still
 * useful. The listener is passive, so it never blocks the scroll itself.
 */
export function DesignRail({ designs }: { designs: readonly PortfolioDesign[] }) {
  const railRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 4);
    setAtEnd(rail.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    sync();
    const rail = railRef.current;
    if (!rail) return;

    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      rail.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const first = rail.querySelector('li');
    const step = first ? first.clientWidth + 16 : rail.clientWidth * 0.8;
    rail.scrollBy({
      left: step * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  };

  return (
    <div className="relative">
      <ul
        ref={railRef}
        data-testid="design-rail"
        className="rail -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      >
        {designs.map((design, index) => (
          <Reveal
            key={design.id}
            as="li"
            delay={Math.min(index * 70, 280)}
            className="rail-item w-[72vw] max-w-[19rem] shrink-0 sm:w-[46vw] lg:w-[calc((100%-3rem)/4)] lg:max-w-none"
          >
            <DesignCard
              design={design}
              priority={index < 2}
              showFeatured={false}
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 72vw"
            />
          </Reveal>
        ))}
      </ul>

      <RailButton
        direction="previous"
        onClick={() => scrollBy(-1)}
        disabled={atStart}
        className="left-0 -translate-x-1/2"
      />
      <RailButton
        direction="next"
        onClick={() => scrollBy(1)}
        disabled={atEnd}
        className="right-0 translate-x-1/2"
      />
    </div>
  );
}

function RailButton({
  direction,
  onClick,
  disabled,
  className,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
  disabled: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={`design-rail-${direction}`}
      className={cn(
        'glass-surface-strong text-ink absolute top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full transition-opacity sm:inline-flex',
        disabled ? 'pointer-events-none opacity-0' : 'opacity-100 hover:bg-white/10',
        className,
      )}
    >
      {direction === 'next' ? (
        <ArrowRightIcon className="size-5" />
      ) : (
        <ArrowLeftIcon className="size-5" />
      )}
      <span className="sr-only">
        {direction === 'next' ? 'Show more designs' : 'Show previous designs'}
      </span>
    </button>
  );
}
