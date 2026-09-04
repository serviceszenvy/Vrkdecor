import Link from 'next/link';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/navigation';
import type { PortfolioFilters, PortfolioTag } from '../types';

/**
 * Occasion filter — redesign brief section 3.
 *
 * The occasion row used to be a full rail of every occasion at once, which
 * takes a lot of vertical space before a visitor ever sees a design. This
 * shows "All" plus a handful of the most-asked-about occasions up front, and
 * tucks the rest behind a "More occasions" disclosure.
 *
 * Built on native `<details>`/`<summary>` rather than client state: it works
 * with JavaScript disabled (every filter link is a plain, crawlable href, in
 * keeping with the rest of the filter bar), it is keyboard- and
 * screen-reader-accessible for free, and the open/close transition is done in
 * CSS with the `grid-template-rows: 0fr -> 1fr` technique, which animates
 * smoothly in every evergreen browser and simply snaps open in anything that
 * does not support it — never a broken or half-hidden state either way.
 *
 * If the active occasion is one of the "more" ones, the details element opens
 * by default so the current selection is never hidden from view.
 */
const VISIBLE_COUNT = 6;

function buildHref(filters: PortfolioFilters, value?: string) {
  const next = { ...filters, occasion: value };
  const params = new URLSearchParams();
  for (const [name, entry] of Object.entries(next)) {
    if (entry) params.set(name, entry);
  }
  const query = params.toString();
  return query ? `${routes.work}?${query}` : routes.work;
}

function chipClasses(isActive: boolean) {
  return cn(
    'inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors motion-safe:hover:-translate-y-0.5 duration-200',
    isActive
      ? 'border-accent-500 bg-accent-500 text-ink-inverse font-medium'
      : 'border-line-soft bg-surface text-ink hover:border-accent-400/50 hover:bg-accent-500/10',
  );
}

export function OccasionFilterAccordion({
  options,
  filters,
}: {
  options: readonly PortfolioTag[];
  filters: PortfolioFilters;
}) {
  if (options.length === 0) return null;

  const active = filters.occasion;
  const visible = options.slice(0, VISIBLE_COUNT);
  const more = options.slice(VISIBLE_COUNT);
  const activeInMore = Boolean(active) && more.some((option) => option.slug === active);

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-ink-muted text-2xs font-semibold tracking-[0.18em] uppercase">
        Occasion
      </h3>

      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href={buildHref(filters, undefined)}
            aria-current={active ? undefined : 'true'}
            className={chipClasses(!active)}
          >
            All
          </Link>
        </li>
        {visible.map((option) => {
          const isActive = active === option.slug;
          return (
            <li key={option.slug}>
              <Link
                href={buildHref(filters, isActive ? undefined : option.slug)}
                aria-current={isActive ? 'true' : undefined}
                className={chipClasses(isActive)}
              >
                {option.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {more.length > 0 ? (
        <details className="group" open={activeInMore}>
          <summary
            className={cn(
              'text-accent-300 hover:text-accent-200 inline-flex min-h-9 w-fit cursor-pointer list-none items-center gap-1.5 text-sm font-semibold transition-colors',
              '[&::-webkit-details-marker]:hidden',
            )}
          >
            <span className="group-open:hidden">
              More occasions ({more.length})
            </span>
            <span className="hidden group-open:inline">Fewer occasions</span>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="size-4 transition-transform duration-300 group-open:rotate-180"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </summary>
          <div
            className="accordion-rows grid transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: '0fr' }}
          >
            {/*
              The inline style above is the closed state; `details[open]` in
              globals.css switches it to 1fr so the transition has something to
              animate between. `overflow-hidden` on the inner wrapper is what
              actually clips the content while collapsed.
            */}
            <ul className="occasion-more-list flex flex-wrap gap-2 overflow-hidden pt-2.5">
              {more.map((option) => {
                const isActive = active === option.slug;
                return (
                  <li key={option.slug}>
                    <Link
                      href={buildHref(filters, isActive ? undefined : option.slug)}
                      aria-current={isActive ? 'true' : undefined}
                      className={chipClasses(isActive)}
                    >
                      {option.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </details>
      ) : null}
    </div>
  );
}
