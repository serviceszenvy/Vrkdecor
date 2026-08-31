import type { Metadata } from 'next';
import { CtaBand, EmptyState, Hero } from '@/components/page';
import {
  ButtonLink,
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  Section,
} from '@/components/ui';
import { pricingNote } from '@/lib/content';
import { getPackages } from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Decoration Packages',
  description:
    'Celebration packages from VRK Decor. Every event is quoted individually — share your date, venue and requirement for a quotation.',
  path: '/packages',
});

/**
 * Packages — Requirements section 16.
 *
 * Packages may show an approved "starting from" price; individual designs
 * default to a custom quote. No customer budget range is displayed and the site
 * never calculates a final quotation. Prices come only from admin-entered rows,
 * so nothing is invented here.
 */
function formatStartingPrice(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <>
      <Hero
        compact
        eyebrow="Packages"
        title="Celebration packages"
        lead={pricingNote}
        actions={
          <ButtonLink href={routes.quote} variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        }
      />

      <Section width="wide" aria-labelledby="package-list">
        <h2 id="package-list" className="sr-only">
          Packages
        </h2>
        {packages.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} as="li">
                <CardBody>
                  <CardTitle as="h3">{pkg.name}</CardTitle>
                  {pkg.description ? <CardMeta>{pkg.description}</CardMeta> : null}
                  <p className="text-brand-700 font-medium">
                    {pkg.pricingMode === 'starting_from' && pkg.startingPrice !== null
                      ? `Starting from ${formatStartingPrice(pkg.startingPrice)}`
                      : 'Custom quote'}
                  </p>
                  <div className="mt-2">
                    <ButtonLink href={routes.quote} variant="outline" size="sm">
                      Enquire
                    </ButtonLink>
                  </div>
                </CardBody>
              </Card>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Packages are being finalised"
            body="VRK Decor is preparing its published packages. Every celebration is quoted individually in the meantime — tell us what you need and the team will prepare a quotation."
            action={
              <ButtonLink href={routes.quote} variant="primary" size="md">
                Get a Quote
              </ButtonLink>
            }
          />
        )}
      </Section>

      <CtaBand />
    </>
  );
}
