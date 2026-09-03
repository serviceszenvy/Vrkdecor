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
}: {
  photos: readonly PortfolioPhoto[];
  columns?: 2 | 3 | 4;
  showDesignName?: boolean;
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

  return (
    <>
      <ul className={gridClass} data-testid="photo-gallery">
        {photos.map((photo, index) => (
          <li key={photo.image.id}>
            <button
              type="button"
              ref={(node) => {
                triggers.current[index] = node;
              }}
              onClick={() => setOpenIndex(index)}
              data-testid="gallery-thumb"
              className="group block w-full cursor-zoom-in rounded-2xl text-left"
            >
              <ImageFrame ratio="landscape" radius="xl" zoomOnHover>
                <Image
                  src={photo.image.url}
                  alt={photo.image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </ImageFrame>
              {showDesignName ? (
                <span className="text-ink-muted group-hover:text-brand-800 mt-2 block text-sm transition-colors">
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
