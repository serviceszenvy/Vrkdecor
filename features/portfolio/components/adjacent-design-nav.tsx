import Image from 'next/image';
import Link from 'next/link';
import { ImageFrame } from '@/components/ui';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/layout/icons';
import { designHref } from '../quote-link';
import { coverImage, type PortfolioDesign } from '../types';

/**
 * "Previous design" / "Next design" — lets a visitor keep browsing straight
 * from a design's own page, in the same order the portfolio listing shows
 * them, without a trip back to the grid.
 *
 * Plain links, not client-side state: like the rest of the portfolio, this
 * works with JavaScript disabled. Wraps at both ends (`getAdjacentDesigns`),
 * so there is always something to go to next.
 */
export function AdjacentDesignNav({
  previous,
  next,
  position,
  total,
}: {
  previous: PortfolioDesign | null;
  next: PortfolioDesign | null;
  /** 1-indexed position of the current design within the portfolio. */
  position?: number;
  total?: number;
}) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="More designs" className="flex flex-col gap-3">
      {position && total ? (
        <p className="text-ink-muted text-center text-2xs font-semibold tracking-[0.18em] uppercase">
          Design {position} of {total}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {previous ? <DesignNavCard direction="previous" design={previous} /> : <div />}
        {next ? <DesignNavCard direction="next" design={next} /> : <div />}
      </div>
    </nav>
  );
}

function DesignNavCard({
  direction,
  design,
}: {
  direction: 'previous' | 'next';
  design: PortfolioDesign;
}) {
  const cover = coverImage(design);
  const isNext = direction === 'next';

  return (
    <Link
      href={designHref(design.slug)}
      className={[
        'group border-line-soft bg-surface hover:border-accent-300/50 hover:shadow-glow',
        'flex items-center gap-4 overflow-hidden rounded-2xl border p-3 transition-[border-color,box-shadow,transform] duration-300 ease-out',
        'motion-safe:hover:-translate-y-0.5',
        isNext ? 'sm:flex-row-reverse sm:text-right' : '',
      ].join(' ')}
    >
      <div className="w-20 shrink-0 sm:w-24">
        <ImageFrame ratio="square" radius="xl" zoomOnHover>
          {cover ? (
            <Image
              src={cover.url}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="from-brand-700 to-accent-800 h-full w-full bg-gradient-to-br" />
          )}
        </ImageFrame>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={[
            'text-ink-muted group-hover:text-accent-300 inline-flex items-center gap-1.5 text-2xs font-semibold tracking-[0.16em] uppercase transition-colors',
            isNext ? 'sm:flex-row-reverse' : '',
          ].join(' ')}
        >
          {isNext ? (
            <ArrowRightIcon className="size-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5" />
          ) : (
            <ArrowLeftIcon className="size-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-x-0.5" />
          )}
          {isNext ? 'Next design' : 'Previous design'}
        </span>
        <span className="font-display truncate text-base font-medium">
          {design.name}
        </span>
      </div>
    </Link>
  );
}
