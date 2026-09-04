'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { ImageFrame } from '@/components/ui';
import { Lightbox } from './lightbox';
import type { PortfolioPhoto } from '../types';

/**
 * Photo grid that opens the lightbox.
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
  showDesignName = false,
  variant = 'grid',
}: {
  photos: readonly PortfolioPhoto[];
  columns?: 2 | 3 | 4;
  showDesignName?: boolean;
  /**
   * `masonry` — redesign brief section 7's "primarily a visual experience":
   * CSS columns with each image at its own natural aspect ratio, so the
   * gallery reads as a varied, premium portfolio wall rather than a uniform
   * grid of identically cropped tiles. Used on the Gallery page; the
   * uniform `grid` stays the default for design-detail and other listings
   * that benefit from an even, predictable layout.
   */
  variant?: 'grid' | 'masonry';
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    const index = openIndex;
    setOpenIndex(null);
    if (index !== null) triggers.current[index]?.focus();
  }, [openIndex]);

  const gridClass =
    columns === 4
      ? 'grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : columns === 2
        ? 'grid gap-4 grid-cols-1 sm:grid-cols-2'
        : 'grid gap-4 grid-cols-2 lg:grid-cols-3';

  const masonryClass =
    'columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 [column-fill:balance]';

  return (
    <>
      <ul
        className={variant === 'masonry' ? masonryClass : gridClass}
        data-testid="photo-gallery"
      >
        {photos.map((photo, index) => (
          <li
            key={photo.image.id}
            className={variant === 'masonry' ? 'mb-3 break-inside-avoid sm:mb-4' : ''}
          >
            <button
              type="button"
              ref={(node) => {
                triggers.current[index] = node;
              }}
              onClick={() => setOpenIndex(index)}
              data-testid="gallery-thumb"
              className="group animate-fade-in block w-full cursor-zoom-in rounded-2xl text-left"
            >
              {variant === 'masonry' ? (
                <div className="bg-surface-muted relative isolate overflow-hidden rounded-2xl">
                  <Image
                    src={photo.image.url}
                    alt={photo.image.alt}
                    width={photo.image.width ?? 1200}
                    height={photo.image.height ?? 900}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="h-auto w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
                  />
                  <div className="from-canvas-deep/50 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ) : (
                <ImageFrame ratio="landscape" radius="xl" zoomOnHover>
                  <Image
                    src={photo.image.url}
                    alt={photo.image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </ImageFrame>
              )}
              {showDesignName ? (
                <span className="text-ink-muted group-hover:text-accent-300 mt-2 block text-sm transition-colors">
                  {photo.design.name}
                </span>
              ) : null}
              <span className="sr-only">
                Open {photo.image.alt} from {photo.design.name}
              </span>
            </button>
          </li>
        ))}
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
