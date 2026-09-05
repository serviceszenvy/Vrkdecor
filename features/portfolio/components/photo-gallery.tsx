'use client';

import { useCallback, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { ImageFrame, Reveal } from '@/components/ui';
import { SparkIcon } from '@/components/layout/icons';
import { cn } from '@/lib/cn';
import { Lightbox } from './lightbox';
import type { PortfolioPhoto } from '../types';

/**
 * Photo grid that opens the lightbox.
 *
 * Two layouts:
 *   - `grid`: fixed landscape frames, used on a design page where the
 *     photographs belong to one design and should read as a set
 *   - `masonry`: the gallery page. Every photograph keeps its own proportion
 *     and the columns pack around them, so the page reads as a wall of
 *     pictures rather than a database of thumbnails. No caption is printed
 *     under an image; the design's name appears on a glass chip on hover and
 *     in the lightbox, and is always available to assistive technology.
 *
 * Each thumbnail is a real button, so the grid is keyboard operable, and focus
 * returns to the thumbnail that opened the lightbox when it closes.
 *
 * Every photo carries its parent Design, so opening any photograph gives the
 * visitor a direct route to that Design and to a quote for it.
 */
export function PhotoGallery({
  photos,
  columns = 3,
  layout = 'grid',
}: {
  photos: readonly PortfolioPhoto[];
  columns?: 2 | 3 | 4;
  layout?: 'grid' | 'masonry';
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    const index = openIndex;
    setOpenIndex(null);
    if (index !== null) triggers.current[index]?.focus();
  }, [openIndex]);

  const gridClass =
    layout === 'masonry'
      ? 'masonry'
      : columns === 4
        ? 'grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        : columns === 2
          ? 'grid gap-4 grid-cols-1 sm:grid-cols-2'
          : 'grid gap-4 grid-cols-2 lg:grid-cols-3';

  return (
    <>
      <ul className={gridClass} data-testid="photo-gallery">
        {photos.map((photo, index) => {
          const ratio =
            photo.image.width && photo.image.height
              ? `${photo.image.width} / ${photo.image.height}`
              : '4 / 3';

          const button = (
            <button
              type="button"
              ref={(node) => {
                triggers.current[index] = node;
              }}
              onClick={() => setOpenIndex(index)}
              data-testid="gallery-thumb"
              className="group press shadow-card hover:shadow-deep relative block w-full cursor-zoom-in overflow-hidden rounded-xl text-left transition-shadow duration-500 sm:rounded-2xl"
            >
              {layout === 'masonry' ? (
                <span
                  className="bg-surface-muted relative block w-full overflow-hidden"
                  style={{ aspectRatio: ratio } as CSSProperties}
                >
                  <Image
                    src={photo.image.url}
                    alt={photo.image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover motion-safe:transition-transform motion-safe:duration-[1100ms] motion-safe:ease-[var(--ease-out-soft)] motion-safe:group-hover:scale-[1.07]"
                  />
                </span>
              ) : (
                <ImageFrame ratio="landscape" radius="none" zoomOnHover>
                  <Image
                    src={photo.image.url}
                    alt={photo.image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </ImageFrame>
              )}

              {/* Glass overlay: appears on hover and focus, never printed below. */}
              <span
                aria-hidden="true"
                className={cn(
                  'from-brand-950/70 pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t via-transparent to-transparent p-3 opacity-0 transition-opacity duration-500',
                  'group-hover:opacity-100 group-focus-visible:opacity-100',
                )}
              >
                <span className="glass-surface-deep inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white">
                  <SparkIcon className="text-accent-300 size-3.5 shrink-0" />
                  <span className="truncate">{photo.design.name}</span>
                </span>
              </span>

              <span className="sr-only">
                Open {photo.image.alt} from {photo.design.name}
              </span>
            </button>
          );

          return layout === 'masonry' ? (
            <Reveal
              as="li"
              key={photo.image.id}
              delay={(index % 4) * 80}
              effect="scale"
            >
              {button}
            </Reveal>
          ) : (
            <Reveal as="li" key={photo.image.id} delay={(index % 3) * 90}>
              {button}
            </Reveal>
          );
        })}
      </ul>

      <Lightbox
        photos={photos}
        openIndex={openIndex}
        onClose={close}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
