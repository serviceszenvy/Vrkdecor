import type { Metadata } from 'next';
import { CtaBand, Hero } from '@/components/page';
import {
  ButtonLink,
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  Section,
} from '@/components/ui';
import { getOccasions } from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Occasions We Decorate',
  description:
    'Weddings, receptions, engagement, seer varisai, puberty ceremony, ear-piercing, baby shower, house warming, birthdays, anniversaries and corporate events.',
  path: '/occasions',
});

/** Occasions — Requirements section 5, including the Tamil secondary terms. */
export default async function OccasionsPage() {
  const occasions = await getOccasions();

  return (
    <>
      <Hero
        compact
        eyebrow="Occasions"
        title="Every celebration, designed for the moment"
        lead="From weddings and receptions to family ceremonies, birthdays and corporate events."
        actions={
          <ButtonLink href={routes.quote} variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        }
      />

      <Section width="wide" aria-labelledby="occasion-list">
        <h2 id="occasion-list" className="sr-only">
          Occasions
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((occasion) => (
            <Card key={occasion.slug} as="li">
              <CardBody>
                <CardTitle as="h3">{occasion.name}</CardTitle>
                {occasion.secondaryTerm ? (
                  <p className="text-brand-700 text-sm">{occasion.secondaryTerm}</p>
                ) : null}
                {occasion.description ? (
                  <CardMeta>{occasion.description}</CardMeta>
                ) : null}
              </CardBody>
            </Card>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Planning one of these?"
        lead="Share your date, venue and requirement and the team will prepare a quotation."
      />
    </>
  );
}
