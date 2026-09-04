import Link from 'next/link';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/navigation';
import { OccasionFilterAccordion } from './occasion-filter-accordion';
import type { PortfolioFilters, PortfolioTag } from '../types';

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
}: {
  label: string;
  paramKey: keyof PortfolioFilters;
  options: readonly PortfolioTag[];
  filters: PortfolioFilters;
}) {
  if (options.length === 0) return null;
  const active = filters[paramKey];

  const chip = (isActive: boolean) =>
    cn(
      'inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors',
      isActive
        ? 'border-accent-500 bg-accent-500 text-ink-inverse font-medium'
        : 'border-line-soft bg-surface text-ink hover:border-accent-400/50 hover:bg-accent-500/10',
    );

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
        {options.map((option) => {
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
        })}
      </ul>
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
      className="border-line-soft bg-surface/70 flex flex-col gap-5 rounded-3xl border p-5 sm:p-6"
    >
      <h2 id="filters" className="sr-only">
        Filter designs
      </h2>

      <OccasionFilterAccordion options={options.occasions} filters={filters} />
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
