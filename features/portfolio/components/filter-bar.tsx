'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/layout/icons';
import { cn } from '@/lib/cn';
import { occasions as approvedOccasions } from '@/lib/content';
import { routes } from '@/lib/navigation';
import type { PortfolioFilterOption, PortfolioFilters } from '../types';

/** How many occasions are shown before the rest fold into the accordion. */
const VISIBLE_OCCASIONS = 4;

/**
 * Portfolio filters — Requirements section 8 (occasion, style and service).
 *
 * Still links that set query parameters, not client-side state: filtering
 * works without JavaScript, every filtered view is linkable and shareable,
 * and keyboard and screen-reader users get ordinary navigation. The only
 * client behaviour is the accordion.
 *
 * What is visible at first is "All" and the handful of occasions with the
 * most published designs. "More occasions" reveals the remaining occasions
 * and the style and service rows. The selected filter is always visible:
 * an active occasion outside the popular set is promoted into it, and an
 * active style or service opens the accordion on load, so a visitor arriving
 * from a shared link can see what they are looking at.
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

function chipClass(isActive: boolean, deep = false) {
  return cn(
    'press inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[0.8rem] font-medium sm:px-4 sm:text-sm',
    'transition-[background-color,color,border-color,transform,box-shadow] duration-300 motion-safe:hover:-translate-y-0.5',
    isActive
      ? 'border-transparent bg-brand-900 text-accent-200 shadow-[0_10px_24px_-12px_rgb(36_44_28/0.8)]'
      : deep
        ? 'border-brand-200/70 bg-white/70 text-ink hover:border-brand-400 hover:bg-white'
        : 'border-brand-200 bg-white text-ink hover:border-brand-400 hover:bg-brand-50',
  );
}

function FilterChip({
  href,
  isActive,
  children,
  deep,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  deep?: boolean;
}) {
  return (
    <li className="rail-item shrink-0">
      <Link
        href={href}
        aria-current={isActive ? 'true' : undefined}
        className={chipClass(isActive, deep)}
      >
        {children}
      </Link>
    </li>
  );
}

function FilterRow({
  label,
  paramKey,
  options,
  filters,
  deep,
}: {
  label: string;
  paramKey: keyof PortfolioFilters;
  options: readonly PortfolioFilterOption[];
  filters: PortfolioFilters;
  deep?: boolean;
}) {
  if (options.length === 0) return null;
  const active = filters[paramKey];

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-brand-800 text-2xs font-semibold tracking-[0.18em] uppercase">
        {label}
      </h3>
      {/*
        A horizontal rail on a phone, so ten style chips do not push the
        designs off the screen; wrapped from `sm` up.
      */}
      {/*
        The rail fades at both edges on a phone, so it is visible that there
        are more chips past the one at the screen edge. The mask is dropped
        from `sm` up, where the row wraps instead of scrolling.
      */}
      <ul className="rail rail-fade -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <FilterChip
          href={buildHref(filters, paramKey, undefined)}
          isActive={!active}
          deep={deep}
        >
          All
        </FilterChip>
        {options.map((option) => {
          const isActive = active === option.slug;
          return (
            <FilterChip
              key={option.slug}
              href={buildHref(filters, paramKey, isActive ? undefined : option.slug)}
              isActive={isActive}
              deep={deep}
            >
              {option.name}
            </FilterChip>
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
    occasions: PortfolioFilterOption[];
    styles: PortfolioFilterOption[];
    services: PortfolioFilterOption[];
  };
  filters: PortfolioFilters;
  resultCount: number;
}) {
  const hasFilters = Boolean(filters.occasion || filters.style || filters.service);
  const hasHiddenActive = Boolean(filters.style || filters.service);
  const [open, setOpen] = useState(hasHiddenActive);
  const panelId = useId();

  // The most popular occasions lead; ties are broken by the approved
  // catalogue order, which puts weddings and receptions first. The active one
  // is always among them.
  const catalogueIndex = (slug: string) => {
    const index = approvedOccasions.findIndex((occasion) => occasion.slug === slug);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  const byPopularity = [...options.occasions].sort(
    (a, b) => b.count - a.count || catalogueIndex(a.slug) - catalogueIndex(b.slug),
  );
  const popular = byPopularity.slice(0, VISIBLE_OCCASIONS);
  if (filters.occasion && !popular.some((option) => option.slug === filters.occasion)) {
    const active = options.occasions.find((option) => option.slug === filters.occasion);
    if (active) popular.splice(VISIBLE_OCCASIONS - 1, 1, active);
  }
  const popularSlugs = new Set(popular.map((option) => option.slug));
  const remaining = options.occasions.filter(
    (option) => !popularSlugs.has(option.slug),
  );

  const hiddenCount =
    remaining.length +
    (options.styles.length > 0 ? 1 : 0) +
    (options.services.length > 0 ? 1 : 0);
  const showToggle = hiddenCount > 0;

  return (
    <section
      aria-labelledby="filters"
      data-testid="filter-bar"
      className="surface-bloom border-brand-200/60 shadow-card flex flex-col gap-3.5 rounded-2xl border p-3.5 sm:gap-4 sm:rounded-3xl sm:p-5"
    >
      <h2 id="filters" className="sr-only">
        Filter designs
      </h2>

      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-brand-800 text-2xs font-semibold tracking-[0.18em] uppercase">
            Occasion
          </h3>
          <p className="text-ink-soft text-sm" role="status">
            {resultCount} {resultCount === 1 ? 'design' : 'designs'}
            {hasFilters
              ? resultCount === 1
                ? ' matches your filters'
                : ' match your filters'
              : ''}
            {hasFilters ? (
              <>
                {' · '}
                <Link
                  className="text-brand-800 font-medium underline underline-offset-4"
                  href={routes.work}
                >
                  Clear
                </Link>
              </>
            ) : null}
          </p>
        </div>

        <ul className="flex flex-wrap gap-2">
          <FilterChip
            href={buildHref(filters, 'occasion', undefined)}
            isActive={!filters.occasion}
          >
            All
          </FilterChip>
          {popular.map((option) => {
            const isActive = filters.occasion === option.slug;
            return (
              <FilterChip
                key={option.slug}
                href={buildHref(
                  filters,
                  'occasion',
                  isActive ? undefined : option.slug,
                )}
                isActive={isActive}
              >
                {option.name}
              </FilterChip>
            );
          })}
          {showToggle ? (
            <li className="shrink-0">
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls={panelId}
                data-testid="filter-more"
                className={cn(
                  'press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-dashed px-3.5 text-[0.8rem] font-medium transition-[background-color,color,border-color] duration-300 sm:px-4 sm:text-sm',
                  open
                    ? 'border-brand-700 bg-brand-900 text-accent-200'
                    : 'border-brand-400 text-brand-900 hover:border-brand-700 hover:bg-white',
                )}
              >
                {open ? 'Fewer options' : 'More occasions'}
                {!open && remaining.length > 0 ? (
                  <span className="bg-accent-500 text-brand-950 rounded-full px-1.5 text-xs font-semibold tabular-nums">
                    +{remaining.length}
                  </span>
                ) : null}
                <ChevronRightIcon
                  className={cn(
                    'size-4 transition-transform duration-500',
                    open ? '-rotate-90' : 'rotate-90',
                  )}
                />
              </button>
            </li>
          ) : null}
        </ul>
      </div>

      {showToggle ? (
        <div
          id={panelId}
          className="accordion"
          data-open={open}
          data-testid="filter-panel"
        >
          <div>
            <div
              className="accordion-content border-brand-200/70 flex flex-col gap-5 border-t pt-4"
              inert={!open}
            >
              {remaining.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-brand-800 text-2xs font-semibold tracking-[0.18em] uppercase">
                    More occasions
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {remaining.map((option) => {
                      const isActive = filters.occasion === option.slug;
                      return (
                        <FilterChip
                          key={option.slug}
                          href={buildHref(
                            filters,
                            'occasion',
                            isActive ? undefined : option.slug,
                          )}
                          isActive={isActive}
                          deep
                        >
                          {option.name}
                        </FilterChip>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              <FilterRow
                label="Style"
                paramKey="style"
                options={options.styles}
                filters={filters}
                deep
              />
              <FilterRow
                label="Service"
                paramKey="service"
                options={options.services}
                filters={filters}
                deep
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
