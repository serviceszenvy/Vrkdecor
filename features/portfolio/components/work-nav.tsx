import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/ui';
import { ArrowLeftIcon, ArrowRightIcon, GridIcon } from '@/components/layout/icons';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/navigation';
import { designHref } from '../quote-link';
import { coverImage, type PortfolioDesign } from '../types';

/**
 * Previous / Next navigation between designs.
 *
 * A visitor who opens one design should be able to keep browsing without
 * going back to Our Work. The order is the listing order (featured first,
 * then most recent), it wraps at both ends so there is always somewhere to
 * go, and the counter says where they are in the collection.
 *
 * Plain links to the existing `/our-work/<slug>` routes: nothing about the
 * URL structure changes, and the page transition in `app/(site)/template.tsx`
 * is what makes moving between projects feel continuous.
 */
export function WorkNav({
  designs,
  current,
}: {
  designs: readonly PortfolioDesign[];
  current: PortfolioDesign;
}) {
  const index = designs.findIndex((design) => design.slug === current.slug);
  if (index === -1 || designs.length < 2) return null;

  const previous = designs[(index - 1 + designs.length) % designs.length]!;
  const next = designs[(index + 1) % designs.length]!;
  const position = `${String(index + 1).padStart(2, '0')} / ${String(designs.length).padStart(2, '0')}`;

  return (
    <nav
      aria-label="Browse other designs"
      data-testid="work-nav"
      className="px-3 sm:px-5 lg:px-6"
    >
      <Reveal className="mx-auto grid w-full max-w-[86rem] gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        <WorkNavCard design={previous} direction="previous" />

        <div className="order-first flex items-center justify-center gap-3 sm:order-none sm:flex-col sm:px-2">
          <p
            className="text-ink-muted text-sm font-medium tabular-nums"
            aria-live="polite"
          >
            <span className="sr-only">Design </span>
            {position}
          </p>
          <Link
            href={routes.work}
            className="border-brand-200 text-brand-900 hover:border-brand-700 hover:bg-brand-50 inline-flex min-h-11 items-center gap-2 rounded-full border bg-white px-4 text-sm font-medium transition-colors"
          >
            <GridIcon className="size-4" />
            All designs
          </Link>
        </div>

        <WorkNavCard design={next} direction="next" />
      </Reveal>
    </nav>
  );
}

function WorkNavCard({
  design,
  direction,
}: {
  design: PortfolioDesign;
  direction: 'previous' | 'next';
}) {
  const cover = coverImage(design);
  const isNext = direction === 'next';

  return (
    <Link
      href={designHref(design.slug)}
      data-testid={`work-nav-${direction}`}
      className={cn(
        'group shine border-line-soft lift shadow-card relative flex min-h-24 items-center gap-4 overflow-hidden rounded-3xl border bg-white p-3 sm:p-4',
        isNext ? 'flex-row-reverse text-right' : '',
      )}
    >
      <span className="bg-surface-muted relative size-18 shrink-0 overflow-hidden rounded-2xl sm:size-20">
        {cover ? (
          <Image
            src={cover.url}
            alt=""
            fill
            sizes="96px"
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-110"
          />
        ) : null}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'text-brand-700 text-2xs inline-flex items-center gap-1.5 font-semibold tracking-[0.18em] uppercase',
            isNext ? 'justify-end' : '',
          )}
        >
          {isNext ? null : (
            <ArrowLeftIcon className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          )}
          {isNext ? 'Next work' : 'Previous work'}
          {isNext ? (
            <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          ) : null}
        </span>
        <span className="font-display text-ink truncate text-lg font-medium sm:text-xl">
          {design.name}
        </span>
        {design.occasion ? (
          <span className="text-ink-muted truncate text-sm">
            {design.occasion.name}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
