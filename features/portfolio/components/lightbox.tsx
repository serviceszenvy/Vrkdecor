'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { ButtonLink } from '@/components/ui';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  SparkIcon,
} from '@/components/layout/icons';
import { cn } from '@/lib/cn';
import { designHref, designQuoteHref } from '../quote-link';
import type { PortfolioPhoto } from '../types';

/**
 * Photo lightbox.
 *
 * Every photograph carries its parent Design, so the lightbox always offers
 * "Get a Quote" for that design and a link to the parent — the photo-level
 * quote CTA required by Requirements sections 8 and 11. The customer never
 * re-selects the design: the quote link carries the design slug AND the
 * photograph id, so the quote page shows the very image they were looking at.
 *
 * Presentation: a deep olive stage with the photograph's own colours blurred
 * behind it, the photograph scaling in, a glass bar with the design's name, a
 * counter and the two actions. The whole thing animates in and each change of
 * photograph crossfades.
 *
 * Accessibility and interaction, unchanged in substance:
 *   - a modal dialog with a focus trap and Escape to close, returning focus to
 *     the thumbnail that opened it
 *   - Left/Right arrows move between photographs
 *   - horizontal swipe moves between photographs on touch devices
 *   - background scrolling is locked while open
 *   - rendered through a portal so no ancestor stacking context can trap it
 */
export function Lightbox({
  photos,
  openIndex,
  onClose,
  onNavigate,
}: {
  photos: readonly PortfolioPhoto[];
  openIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const isOpen = openIndex !== null;
  const photo = isOpen ? photos[openIndex] : undefined;

  const goTo = useCallback(
    (delta: number) => {
      if (openIndex === null || photos.length === 0) return;
      const next = (openIndex + delta + photos.length) % photos.length;
      onNavigate(next);
    },
    [openIndex, photos.length, onNavigate],
  );

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(-1);
        return;
      }
      if (event.key !== 'Tab' || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, goTo, onClose]);

  if (!isOpen || !photo) return null;

  const meta = [photo.design.occasion?.name, photo.design.location]
    .filter(Boolean)
    .join(' · ');

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="lightbox"
      ref={dialogRef}
      className="on-deep bg-brand-950/92 motion-safe:animate-fade-in fixed inset-0 z-50 flex flex-col text-white backdrop-blur-md"
      onTouchStart={(event) => {
        const touch = event.changedTouches[0];
        if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        const touch = event.changedTouches[0];
        touchStart.current = null;
        if (!start || !touch) return;

        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        // Horizontal intent only, so a vertical scroll never changes photo.
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        goTo(dx < 0 ? 1 : -1);
      }}
    >
      {/* The photograph's own colours, blurred, as the stage behind it. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          key={`glow-${photo.image.id}`}
          src={photo.image.url}
          alt=""
          fill
          sizes="40vw"
          className="scale-125 object-cover opacity-35 blur-3xl saturate-150"
        />
        <div className="from-brand-950/70 to-brand-950/90 absolute inset-0 bg-gradient-to-b via-transparent" />
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p
          className="glass-surface-deep inline-flex min-h-9 items-center rounded-full px-3 text-sm tabular-nums"
          aria-live="polite"
        >
          {openIndex + 1} of {photos.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          data-testid="lightbox-close"
          className="glass-surface-deep hover:border-accent-400/60 inline-flex size-11 items-center justify-center rounded-full transition-[border-color,transform] duration-300 motion-safe:hover:rotate-90"
        >
          <CloseIcon />
          <span className="sr-only">Close gallery</span>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-2 sm:px-16">
        <LightboxArrow direction="previous" onClick={() => goTo(-1)} />

        <figure className="relative h-full max-h-full w-full max-w-6xl">
          <Image
            key={photo.image.id}
            src={photo.image.url}
            alt={photo.image.alt}
            fill
            sizes="100vw"
            priority
            className="motion-safe:animate-scale-in object-contain drop-shadow-[0_30px_60px_rgb(0_0_0/0.5)]"
          />
        </figure>

        <LightboxArrow direction="next" onClick={() => goTo(1)} />
      </div>

      <div className="px-3 pb-3 sm:px-6 sm:pb-5">
        <div className="glass-surface-deep glass-edge motion-safe:animate-slide-down mx-auto flex max-w-6xl flex-col gap-3 rounded-3xl p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0 px-1">
            <p id={titleId} className="font-display truncate text-lg font-medium">
              {photo.design.name}
            </p>
            {meta ? <p className="text-ink-on-deep truncate text-sm">{meta}</p> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <ButtonLink
              href={designQuoteHref(photo.design.slug, photo.image.id)}
              variant="lime"
              size="md"
              data-testid="lightbox-quote-cta"
            >
              <SparkIcon className="size-4" />
              Get a Quote for this design
            </ButtonLink>
            <Link
              href={designHref(photo.design.slug)}
              className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-white/25 px-5 text-white transition-colors hover:border-white/60 hover:bg-white/10"
            >
              View design
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function LightboxArrow({
  direction,
  onClick,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
}) {
  const isNext = direction === 'next';
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`lightbox-${direction}`}
      className={cn(
        'glass-surface-deep hover:border-accent-400/60 absolute z-10 inline-flex size-11 items-center justify-center rounded-full transition-[border-color,transform] duration-300 sm:size-12',
        isNext
          ? 'right-2 motion-safe:hover:translate-x-0.5 sm:right-4'
          : 'left-2 motion-safe:hover:-translate-x-0.5 sm:left-4',
      )}
    >
      {isNext ? (
        <ArrowRightIcon className="size-5" />
      ) : (
        <ArrowLeftIcon className="size-5" />
      )}
      <span className="sr-only">
        {isNext ? 'Next photograph' : 'Previous photograph'}
      </span>
    </button>
  );
}
