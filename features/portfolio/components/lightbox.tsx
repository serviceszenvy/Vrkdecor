'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { ButtonLink } from '@/components/ui';
import { CloseIcon } from '@/components/layout/icons';
import { designHref, designQuoteHref } from '../quote-link';
import type { PortfolioPhoto } from '../types';

/**
 * Photo lightbox.
 *
 * Every photograph carries its parent Design, so the lightbox always offers
 * "Get Quote for This Design" and a link to the parent — the photo-level quote
 * CTA required by Requirements section 8 and 11. The customer never re-selects
 * the design.
 *
 * Accessibility and interaction:
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="lightbox"
      ref={dialogRef}
      className="bg-brand-950/96 motion-safe:animate-fade-in fixed inset-0 z-50 flex flex-col backdrop-blur-sm"
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
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-white">
        <p className="text-sm" aria-live="polite">
          {openIndex + 1} of {photos.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          data-testid="lightbox-close"
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 transition-[background-color,transform] duration-200 hover:bg-white/15 motion-safe:active:scale-90"
        >
          <CloseIcon />
          <span className="sr-only">Close gallery</span>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        <button
          type="button"
          onClick={() => goTo(-1)}
          data-testid="lightbox-previous"
          className="absolute left-2 z-10 inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-[background-color,transform] duration-200 hover:bg-white/25 motion-safe:hover:scale-105 motion-safe:active:scale-90"
        >
          <span aria-hidden="true">&#8249;</span>
          <span className="sr-only">Previous photograph</span>
        </button>

        <div className="relative h-full max-h-full w-full max-w-5xl">
          <Image
            key={photo.image.id}
            src={photo.image.url}
            alt={photo.image.alt}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>

        <button
          type="button"
          onClick={() => goTo(1)}
          data-testid="lightbox-next"
          className="absolute right-2 z-10 inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-[background-color,transform] duration-200 hover:bg-white/25 motion-safe:hover:scale-105 motion-safe:active:scale-90"
        >
          <span aria-hidden="true">&#8250;</span>
          <span className="sr-only">Next photograph</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-white">
          <p id={titleId} className="font-display text-lg font-medium">
            {photo.design.name}
          </p>
          <p className="text-sand-300 text-sm">
            {[photo.design.occasion?.name, photo.design.location]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ButtonLink
            href={designQuoteHref(photo.design.slug, photo.image.id)}
            variant="accent"
            size="md"
            data-testid="lightbox-quote-cta"
          >
            Get Quote for This Design
          </ButtonLink>
          <Link
            href={designHref(photo.design.slug)}
            className="inline-flex min-h-12 items-center rounded-full border border-white/30 px-5 text-white transition-colors hover:bg-white/10"
          >
            View design
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
