import Image from 'next/image';
import Link from 'next/link';
import { Badge, ImageFrame, ImageScrim } from '@/components/ui';
import { StarIcon } from '@/components/layout/icons';
import { cn } from '@/lib/cn';
import { designHref } from '../quote-link';
import { coverImage, type PortfolioDesign } from '../types';

/**
 * Portfolio card for a Design.
 *
 * Photography first, as in the approved reference design: a tall image, one
 * small occasion chip over it, and the name in a scrim across the foot. The
 * name stays visible rather than appearing on hover, because a card whose title
 * only exists on hover is unusable on a touch screen and invisible in a
 * screenshot.
 *
 * The whole card links to the parent Design's detail page. Related images are
 * never separate cards — they live inside the Design (Requirements section 9).
 */
export function DesignCard({
  design,
  priority = false,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw',
  showFeatured = true,
  className,
}: {
  design: PortfolioDesign;
  priority?: boolean;
  sizes?: string;
  /** Off inside the featured rail, where every card would carry the same chip. */
  showFeatured?: boolean;
  className?: string;
}) {
  const cover = coverImage(design);
  const meta = [design.location, design.styles[0]?.name].filter(Boolean).join(' · ');

  return (
    /*
      `relative` is required. The card title uses a stretched link
      (`after:inset-0`) to make the whole card clickable; without a positioned
      ancestor that pseudo-element expands to the nearest one and silently
      covers unrelated page content, swallowing clicks on the filters.
    */
    <article
      className={cn(
        'group press shadow-card hover:shadow-raised relative overflow-hidden rounded-2xl sm:rounded-3xl',
        'transition-[box-shadow,transform] duration-300',
        'motion-safe:focus-within:-translate-y-1 motion-safe:hover:-translate-y-1',
        className,
      )}
    >
      <ImageFrame ratio="card" radius="none" zoomOnHover>
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            sizes={sizes}
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="from-brand-200 to-accent-100 h-full w-full bg-gradient-to-br" />
        )}
      </ImageFrame>

      <ImageScrim strength="strong" />

      <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-1.5 p-2 sm:gap-2 sm:p-3">
        {design.occasion ? (
          <Badge tone="glass">{design.occasion.name}</Badge>
        ) : (
          <span />
        )}
        {/*
          At half width the word "Featured" pushed the occasion chip onto a
          second line, so on a phone it becomes the star it already means. The
          accessible name is unchanged.
        */}
        {showFeatured && design.featured ? (
          <>
            <Badge tone="glass" className="hidden sm:inline-flex">
              Featured
            </Badge>
            <span className="glass-surface-strong text-brand-800 inline-flex size-6 items-center justify-center rounded-full sm:hidden">
              <StarIcon className="size-3.5" />
              <span className="sr-only">Featured</span>
            </span>
          </>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3 sm:p-5">
        <h3 className="font-display text-[0.95rem] leading-snug font-medium text-balance text-white sm:text-xl">
          <Link
            href={designHref(design.slug)}
            className="rounded-sm after:absolute after:inset-0 hover:underline"
          >
            {design.name}
          </Link>
        </h3>
        {meta ? (
          <p className="text-[0.75rem] text-white/80 sm:text-sm">{meta}</p>
        ) : null}
      </div>
    </article>
  );
}
