import Link from 'next/link';
import { ChevronRightIcon } from '@/components/layout/icons';
import { occasions as approvedOccasions } from '@/lib/content';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/navigation';
import type { PortfolioFilters, PortfolioTag } from '../types';

/** Occasion chips shown before "More occasions" — the rest are one tap away. */
const VISIBLE_OCCASION_COUNT = 6;

/**
 * `listFilterOptions()` sorts occasions alphabetically, which is right for
 * the full "More occasions" list but wrong for choosing which ones lead —
 * alphabetical order buries "Wedding" (the approved occasion catalogue's own
 * first entry, `lib/content/catalog.ts`) near the end. Reorders to the
 * catalogue's own order first, so the front row is the occasions this
 * business actually leads with, not an accident of spelling.
 */
const OCCASION_RANK = new Map(approvedOccasions.map((o, index) => [o.slug, index]));

function byApprovedOrder(tags: readonly PortfolioTag[]): PortfolioTag[] {
  return [...tags].sort(
    (a, b) => (OCCASION_RANK.get(a.slug) ?? 99) - (OCCASION_RANK.get(b.slug) ?? 99),
  );
}

/**
 * Portfolio filters — Requirements section 8 (occasion, style and service).
 *
 * Implemented as links that set query parameters, not client-side state, so
 * filtering works without JavaScript, every filtered view is linkable and
 * shareable, and keyboard and screen-reader users get ordinary navigation.
 */
function buildHref(
  filters: PortfolioFilters,
  key: keyof PortfolioFilters,
  value?: string,
) {
  const next = { ...filters, [key]: value };
  const params = new URLSearchParams();
  for (const [name, entry] of Object.entries(next)) {
    if (entry) params.set(name, entry);
  }
  const query = params.toString();
  return query ? `${routes.work}?${query}` : routes.work;
}

function FilterRow({
  label,
  paramKey,
  options,
  filters,
  /** When set, options beyond this count collapse into a "More" accordion. */
  visibleCount,
}: {
  label: string;
  paramKey: keyof PortfolioFilters;
  options: readonly PortfolioTag[];
  filters: PortfolioFilters;
  visibleCount?: number;
}) {
  if (options.length === 0) return null;
  const active = filters[paramKey];

  const chip = (isActive: boolean) =>
    cn(
      'inline-flex min-h-10 items-center rounded-full border px-4 text-sm',
      'transition-[background-color,border-color,box-shadow,transform] duration-200',
      'motion-safe:active:scale-95',
      isActive
        ? 'border-brand-700 bg-brand-700 text-white shadow-glow-sm'
        : 'border-line-soft bg-surface text-ink hover:border-accent-300/60 hover:bg-white/5 hover:shadow-card',
    );

  const renderChip = (option: PortfolioTag) => {
    const isActive = active === option.slug;
    return (
      <li key={option.slug} className="rail-item shrink-0">
        <Link
          href={buildHref(filters, paramKey, isActive ? undefined : option.slug)}
          aria-current={isActive ? 'true' : undefined}
          className={chip(isActive)}
        >
          {option.name}
        </Link>
      </li>
    );
  };

  const visible =
    visibleCount === undefined ? options : options.slice(0, visibleCount);
  const hidden = visibleCount === undefined ? [] : options.slice(visibleCount);
  // A direct link (or a previous selection) can point at a collapsed option —
  // the accordion must default open then, or the active chip is invisible.
  const activeIsHidden = hidden.some((option) => option.slug === active);

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-ink-muted text-2xs font-semibold tracking-[0.18em] uppercase">
        {label}
      </h3>
      {/*
        A horizontal rail below `sm`. Three rows of wrapped chips push the
        designs themselves off a phone screen entirely, which is the wrong way
        round on a portfolio page.
      */}
      <ul className="rail -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <li className="rail-item shrink-0">
          <Link
            href={buildHref(filters, paramKey, undefined)}
            aria-current={active ? undefined : 'true'}
            className={chip(!active)}
          >
            All
          </Link>
        </li>
        {visible.map(renderChip)}
      </ul>

      {hidden.length > 0 ? (
        <details className="group" open={activeIsHidden || undefined}>
          {/*
            A native disclosure, not client state: filtering already works
            without JavaScript (it's plain links setting query parameters),
            and `<details>` keeps "More occasions" working the same way —
            no JS required to open it, a real toggle for keyboard and screen
            reader users, and CSS alone drives the open/close motion below.
          */}
          <summary
            className={cn(
              'border-line-soft bg-surface text-ink-muted hover:text-ink hover:border-accent-300/50',
              'inline-flex min-h-9 w-fit cursor-pointer list-none items-center gap-1.5 rounded-full border px-3.5 text-sm',
              'transition-colors duration-200 select-none [&::-webkit-details-marker]:hidden',
            )}
          >
            <span className="group-open:hidden">More {label.toLowerCase()}s</span>
            <span className="hidden group-open:inline">Fewer {label.toLowerCase()}s</span>
            <ChevronRightIcon className="size-3.5 rotate-90 transition-transform duration-200 group-open:-rotate-90" />
          </summary>

          <ul className="motion-safe:animate-fade-in-up mt-2.5 flex flex-wrap gap-2">
            {hidden.map(renderChip)}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

export function FilterBar({
  options,
  filters,
  resultCount,
}: {
  options: {
    occasions: PortfolioTag[];
    styles: PortfolioTag[];
    services: PortfolioTag[];
  };
  filters: PortfolioFilters;
  resultCount: number;
}) {
  const hasFilters = Boolean(filters.occasion || filters.style || filters.service);

  return (
    <section
      aria-labelledby="filters"
      className="border-line-soft bg-surface/70 shadow-card flex flex-col gap-5 rounded-3xl border p-5 sm:p-6"
    >
      <h2 id="filters" className="sr-only">
        Filter designs
      </h2>

      <FilterRow
        label="Occasion"
        paramKey="occasion"
        options={byApprovedOrder(options.occasions)}
        filters={filters}
        visibleCount={VISIBLE_OCCASION_COUNT}
      />
      <FilterRow
        label="Style"
        paramKey="style"
        options={options.styles}
        filters={filters}
      />
      <FilterRow
        label="Service"
        paramKey="service"
        options={options.services}
        filters={filters}
      />

      <p className="text-ink-muted text-sm" role="status">
        {resultCount} {resultCount === 1 ? 'design' : 'designs'}
        {hasFilters ? ' match your filters' : ''}
        {hasFilters ? (
          <>
            {' · '}
            <Link
              className="text-accent-300 underline underline-offset-4"
              href={routes.work}
            >
              Clear filters
            </Link>
          </>
        ) : null}
      </p>
    </section>
  );
}
