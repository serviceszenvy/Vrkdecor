import Link from 'next/link';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/navigation';
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

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-ink-muted text-2xs font-semibold tracking-[0.16em] uppercase">
        {label}
      </h3>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href={buildHref(filters, paramKey, undefined)}
            aria-current={active ? undefined : 'true'}
            className={cn(
              'inline-flex min-h-9 items-center rounded-full border px-3 text-sm',
              active
                ? 'border-line text-ink-muted hover:bg-sand-50'
                : 'border-brand-800 bg-brand-800 text-white',
            )}
          >
            All
          </Link>
        </li>
        {options.map((option) => {
          const isActive = active === option.slug;
          return (
            <li key={option.slug}>
              <Link
                href={buildHref(filters, paramKey, isActive ? undefined : option.slug)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'inline-flex min-h-9 items-center rounded-full border px-3 text-sm',
                  isActive
                    ? 'border-brand-800 bg-brand-800 text-white'
                    : 'border-line text-ink hover:bg-sand-50',
                )}
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
    <section aria-labelledby="filters" className="flex flex-col gap-5">
      <h2 id="filters" className="sr-only">
        Filter designs
      </h2>

      <FilterRow
        label="Occasion"
        paramKey="occasion"
        options={options.occasions}
        filters={filters}
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
              className="text-brand-700 underline underline-offset-4"
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
