import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/layout/icons';
import { coverImage, designHref, type PortfolioDesign } from '..';

/**
 * "Previous Work / Next Work" — redesign brief section 4.
 *
 * Lets a visitor move from one project straight to another without a trip
 * back through the "Our Work" grid. Order follows the same listing order
 * `listDesigns()` already uses (featured first, then most recent), and wraps
 * around at each end so the pair always has somewhere to go — there is always
 * "more work to see" rather than a dead end at the first or last design.
 *
 * A project counter ("03 / 12"), a small preview image and the project title
 * are shown for each direction, as the brief's example lays out. Routing is
 * unchanged: this is a plain `<Link>` to the existing `/our-work/[slug]`
 * route, so it costs nothing beyond a normal navigation.
 */
export function PrevNextWork({
  designs,
  currentSlug,
}: {
  designs: readonly PortfolioDesign[];
  currentSlug: string;
}) {
  const index = designs.findIndex((design) => design.slug === currentSlug);
  if (index === -1 || designs.length < 2) return null;

  const previous = designs[(index - 1 + designs.length) % designs.length]!;
  const next = designs[(index + 1) % designs.length]!;
  const counter = `${String(index + 1).padStart(2, '0')} / ${String(designs.length).padStart(2, '0')}`;

  return (
    <nav
      aria-label="More work"
      className="grid gap-3 border-line-soft border-t pt-6 sm:grid-cols-2"
    >
      <PrevNextLink direction="previous" design={previous} counter={counter} />
      <PrevNextLink direction="next" design={next} counter={counter} />
    </nav>
  );
}

function PrevNextLink({
  direction,
  design,
  counter,
}: {
  direction: 'previous' | 'next';
  design: PortfolioDesign;
  counter: string;
}) {
  const cover = coverImage(design);
  const isNext = direction === 'next';

  return (
    <Link
      href={designHref(design.slug)}
      data-testid={`${direction}-work-link`}
      className={[
        'group border-line-soft hover:border-accent-400/40 bg-surface/60 flex items-center gap-4 rounded-2xl border p-3 transition-colors duration-300',
        isNext ? 'sm:flex-row-reverse sm:text-right' : '',
      ].join(' ')}
    >
      <div className="bg-surface-muted relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
        {cover ? (
          <Image
            src={cover.url}
            alt=""
            fill
            sizes="80px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-ink-muted flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] uppercase">
          {!isNext ? (
            <ArrowLeftIcon className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          ) : null}
          {isNext ? 'Next Work' : 'Previous Work'}
          {isNext ? (
            <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          ) : null}
        </span>
        <span className="font-display truncate text-base font-medium">
          {design.name}
        </span>
        <span className="text-ink-muted text-xs">{counter}</span>
      </div>
    </Link>
  );
}
