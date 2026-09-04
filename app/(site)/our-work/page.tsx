import type { Metadata } from 'next';
import { CtaBand, EmptyState, Hero } from '@/components/page';
import { ButtonLink, Section } from '@/components/ui';
import {
  DesignGrid,
  FilterBar,
  SampleContentNotice,
} from '@/features/portfolio/components';
import {
  isShowingSampleContent,
  listDesigns,
  listFilterOptions,
} from '@/features/portfolio';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Our Work | Decoration Portfolio',
  description:
    'Browse VRK Decor’s portfolio of weddings, receptions and celebrations across Tamil Nadu. Filter by occasion, style and service, and request a quote for any design.',
  path: '/our-work',
});

/**
 * Our Work — the portfolio listing (Requirements section 8).
 *
 * Filters are query parameters, so each filtered view is linkable and works
 * without JavaScript. Only published Designs are ever listed; Row Level
 * Security is the boundary and the query filter is defence in depth.
 */
export default async function OurWorkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const single = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const filters = {
    occasion: single(params.occasion),
    style: single(params.style),
    service: single(params.service),
  };

  const [designs, options] = await Promise.all([
    listDesigns(filters),
    listFilterOptions(),
  ]);

  const hasFilters = Boolean(filters.occasion || filters.style || filters.service);

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Our work"
        title="Celebrations we have"
        accent="designed and set up"
        lead="Browse by occasion, style or service. When you find a setting you like, ask for a quote and the design comes with your request."
        actions={
          <ButtonLink href={routes.quote} variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        }
      />

      <Section tone="panel" width="wide" aria-labelledby="designs">
        <h2 id="designs" className="sr-only">
          Designs
        </h2>

        {isShowingSampleContent() ? (
          <div className="mb-8">
            <SampleContentNotice />
          </div>
        ) : null}

        <FilterBar options={options} filters={filters} resultCount={designs.length} />

        <div className="mt-8">
          {designs.length > 0 ? (
            <DesignGrid designs={designs} />
          ) : hasFilters ? (
            <EmptyState
              title="No designs match those filters"
              body="Try a different occasion, style or service, or clear the filters to see everything."
              action={
                <ButtonLink href={routes.work} variant="outline" size="md">
                  Clear filters
                </ButtonLink>
              }
            />
          ) : (
            <EmptyState
              title="The portfolio is being prepared"
              body="We are adding our designs and photographs. Tell us about your celebration and we will share relevant work with you directly."
              action={
                <ButtonLink href={routes.quote} variant="primary" size="md">
                  Get a Quote
                </ButtonLink>
              }
            />
          )}
        </div>
      </Section>

      <CtaBand />
    </div>
  );
}
