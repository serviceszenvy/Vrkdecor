'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { ImageFrame, Reveal, type AspectRatio } from '@/components/ui';
import { Lightbox } from './lightbox';
import type { PortfolioPhoto } from '../types';

/**
 * A short, repeating rhythm of aspect ratios rather than one uniform shape —
 * enough variety to read as a considered, image-led layout instead of a flat
 * grid, without the layout cost of a true JS-measured masonry (every frame
 * stays a fixed ratio, so nothing shifts as images load).
 */
const MASONRY_RATIOS: readonly AspectRatio[] = [
  'portrait',
  'square',
  'tall',
  'landscape',
  'square',
  'portrait',
];

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
  masonry = false,
}: {
  photos: readonly PortfolioPhoto[];
  columns?: 2 | 3 | 4;
  showDesignName?: boolean;
  /**
   * A varied-ratio CSS-columns layout instead of a uniform grid — the
   * image-led treatment the standalone Gallery page uses so photography
   * carries the page rather than a title under every frame.
   */
  masonry?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    const index = openIndex;
    setOpenIndex(null);
    if (index !== null) triggers.current[index]?.focus();
  }, [openIndex]);

  const gridClass = masonry
    ? 'columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:balance]'
    : columns === 4
      ? 'grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : columns === 2
        ? 'grid gap-4 grid-cols-1 sm:grid-cols-2'
        : 'grid gap-4 grid-cols-2 lg:grid-cols-3';

  return (
    <>
      <ul className={gridClass} data-testid="photo-gallery">
        {photos.map((photo, index) => (
          <Reveal
            key={photo.image.id}
            as="li"
            variant={masonry ? 'image' : 'rise'}
            delay={Math.min((index % 6) * 60, 240)}
            className={masonry ? 'mb-3 break-inside-avoid' : undefined}
          >
            <button
              type="button"
              ref={(node) => {
                triggers.current[index] = node;
              }}
              onClick={() => setOpenIndex(index)}
              data-testid="gallery-thumb"
              className="group hover:shadow-glow block w-full cursor-zoom-in rounded-2xl text-left transition-shadow duration-300"
            >
              <ImageFrame
                ratio={masonry ? (MASONRY_RATIOS[index % MASONRY_RATIOS.length] ?? 'square') : 'landscape'}
                radius="xl"
                zoomOnHover
              >
                <Image
                  src={photo.image.url}
                  alt={photo.image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </ImageFrame>
              {showDesignName ? (
                <span className="text-ink-muted group-hover:text-accent-300 mt-2 block text-sm transition-colors">
                  {photo.design.name}
                </span>
              ) : null}
              <span className="sr-only">
                Open {photo.image.alt} from {photo.design.name}
              </span>
            </button>
          </Reveal>
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
