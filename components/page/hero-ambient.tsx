'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * The ambient light behind the home hero.
 *
 * Three brand-coloured blobs drift on their own (CSS keyframes), and the
 * whole layer leans a few pixels toward the pointer on a desktop, which gives
 * the dark surface a sense of depth without a single library. The pointer
 * effect is skipped for coarse pointers and under `prefers-reduced-motion`;
 * the drift itself is collapsed to a still frame by the global reduced-motion
 * rule in `app/globals.css`.
 */
export function HeroAmbient({ className }: { className?: string }) {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = layer.current;
    if (!node) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;

    const onMove = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = (event.clientX / innerWidth - 0.5) * 28;
      targetY = (event.clientY / innerHeight - 0.5) * 22;
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          node.style.setProperty('--ambient-x', `${targetX.toFixed(1)}px`);
          node.style.setProperty('--ambient-y', `${targetY.toFixed(1)}px`);
          frame = 0;
        });
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={layer}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden transition-transform duration-700 ease-out',
        className,
      )}
      style={{
        transform: 'translate3d(var(--ambient-x, 0px), var(--ambient-y, 0px), 0)',
      }}
    >
      <span className="ambient-blob bg-accent-500/45 -top-32 -right-24 size-[28rem] sm:size-[36rem]" />
      <span className="ambient-blob ambient-blob-slow bg-brand-500/50 -bottom-40 -left-32 size-[26rem] sm:size-[34rem]" />
      <span className="ambient-blob bg-accent-300/25 top-1/3 left-1/2 size-[18rem] [animation-delay:-9s] sm:size-[24rem]" />
    </div>
  );
}
