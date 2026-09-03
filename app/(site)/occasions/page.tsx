import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand, Hero } from '@/components/page';
import {
  ButtonLink,
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  Reveal,
  Section,
  SectionHeading,
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
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Occasions"
        title="Perfect for"
        accent="every occasion"
        lead="From weddings and receptions to family ceremonies, birthdays and corporate events, each one styled for what the day means."
        actions={
          <ButtonLink href={routes.quote} variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        }
      />

      <Section tone="panel" width="wide" aria-labelledby="occasion-list">
        <SectionHeading
          id="occasion-list"
          align="center"
          rule
          title="Every occasion"
          accent="we decorate"
          lead="Some of these are known by more than one name, so both are listed and you can find yours quickly. Pick one to see the work we have done for it."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((occasion, index) => (
            <Reveal key={occasion.slug} as="li" delay={Math.min(index * 50, 240)}>
              <Card interactive className="h-full">
                <CardBody>
                  <CardTitle as="h3">
                    <Link
                      href={`${routes.work}?occasion=${encodeURIComponent(occasion.slug)}`}
                      className="hover:text-brand-800 transition-colors"
                    >
                      {occasion.name}
                    </Link>
                  </CardTitle>
                  {occasion.secondaryTerm ? (
                    <p className="text-brand-700 text-sm">{occasion.secondaryTerm}</p>
                  ) : null}
                  {occasion.description ? (
                    <CardMeta>{occasion.description}</CardMeta>
                  ) : null}
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Planning one of these?"
        accent="We would love to help."
        lead="Send us your date, your venue and what you have in mind, and we will put a quotation together."
      />
    </div>
  );
}
