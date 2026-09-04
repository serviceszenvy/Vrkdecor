import type { Metadata } from 'next';
import { CtaBand, Hero, OccasionGrid, serviceIcon } from '@/components/page';
import {
  Badge,
  ButtonLink,
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  IconChip,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/ui';
import { PARTNER_VENDOR_LABEL, positioning } from '@/lib/content';
import { getOccasions, getServices } from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Event Decoration Services',
  description:
    'Stage and mandap decoration, florals, entrance, furniture, LED and complete event management from VRK Decor, styled for weddings, family ceremonies, birthdays and corporate events, with trusted partner vendors for specialist services.',
  path: '/services',
});

/**
 * Groups the approved occasions (Requirements section 5) into the kind of
 * occasion-led categories a visitor thinks in, so the page reads as "what we
 * decorate for" rather than a flat alphabetised list. Every slug here is an
 * approved occasion already seeded in the database — this only changes how
 * they're grouped, not what exists.
 */
const OCCASION_CATEGORIES: readonly { title: string; slugs: readonly string[] }[] = [
  {
    title: 'Weddings & engagements',
    slugs: ['wedding', 'reception', 'engagement', 'seer-varisai'],
  },
  {
    title: 'Family ceremonies',
    slugs: ['puberty-ceremony', 'ear-piercing', 'holy-communion', 'baby-shower', 'housewarming'],
  },
  {
    title: 'Birthdays & anniversaries',
    slugs: ['birthday', 'anniversary'],
  },
  {
    title: 'Corporate & community',
    slugs: ['corporate-events', 'college-events', 'other-celebrations'],
  },
];

/**
 * Services — Requirements section 6, with occasion content folded in
 * (Requirements section 5) now that a standalone Occasions page has been
 * retired in favour of one page that answers both "what do you do" and
 * "what is it for".
 *
 * Partner-vendor delivery is displayed rather than hidden, because Requirements
 * section 3 requires it to be represented accurately.
 */
export default async function ServicesPage() {
  const [services, occasions] = await Promise.all([getServices(), getOccasions()]);

  const inHouse = services.filter((service) => service.deliveryModel === 'in_house');
  const partner = services.filter(
    (service) => service.deliveryModel === 'partner_vendor',
  );

  const occasionsBySlug = new Map(occasions.map((occasion) => [occasion.slug, occasion]));
  const categorisedOccasions = OCCASION_CATEGORIES.map((category) => ({
    title: category.title,
    occasions: category.slugs
      .map((slug) => occasionsBySlug.get(slug))
      .filter((occasion): occasion is NonNullable<typeof occasion> => Boolean(occasion)),
  })).filter((category) => category.occasions.length > 0);

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Services"
        title="Complete celebration"
        accent="solutions"
        lead={positioning.brandRole}
        actions={
          <ButtonLink href={routes.quote} variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        }
      />

      <Section tone="panel" width="wide" aria-labelledby="in-house">
        <SectionHeading
          id="in-house"
          title="Designed and delivered"
          accent="by our own team"
          lead="These are the parts of your celebration we plan, build and set up ourselves."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inHouse.map((service, index) => {
            const ServiceIcon = serviceIcon(service.slug);
            return (
              <Reveal key={service.slug} as="li" delay={Math.min(index * 60, 240)}>
                <Card interactive tone="glass" className="h-full">
                  <CardBody>
                    <IconChip tone="brand" size="md">
                      <ServiceIcon />
                    </IconChip>
                    <CardTitle as="h3" className="mt-1">
                      {service.name}
                    </CardTitle>
                    {service.description ? (
                      <CardMeta>{service.description}</CardMeta>
                    ) : null}
                  </CardBody>
                </Card>
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="partner">
        <SectionHeading
          id="partner"
          title="Delivered with"
          accent="trusted partner vendors"
          lead="We arrange and coordinate these specialist services for you, so your celebration still has one point of contact."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partner.map((service, index) => {
            const ServiceIcon = serviceIcon(service.slug);
            return (
              <Reveal key={service.slug} as="li" delay={Math.min(index * 60, 240)}>
                <Card tone="tint" className="h-full">
                  <CardBody>
                    <IconChip tone="tint" size="md">
                      <ServiceIcon />
                    </IconChip>
                    <CardTitle as="h3" className="mt-1">
                      {service.name}
                    </CardTitle>
                    {service.description ? (
                      <CardMeta className="text-ink-soft">
                        {service.description}
                      </CardMeta>
                    ) : null}
                    <div>
                      <Badge tone="glass">{PARTNER_VENDOR_LABEL}</Badge>
                    </div>
                  </CardBody>
                </Card>
              </Reveal>
            );
          })}
        </ul>
      </Section>

      {categorisedOccasions.length > 0 ? (
        <Section tone="panel" width="wide" aria-labelledby="occasions">
          <SectionHeading
            id="occasions"
            align="center"
            rule
            title="Styled for"
            accent="every occasion"
            lead="Some of these are known by more than one name, so both are listed and you can find yours quickly. Pick one to see the work we have done for it."
          />
          <div className="mt-10 flex flex-col gap-9">
            {categorisedOccasions.map((category) => (
              <div key={category.title} className="flex flex-col gap-4">
                <h3 className="text-accent-300 text-2xs font-semibold tracking-[0.2em] uppercase">
                  {category.title}
                </h3>
                <OccasionGrid occasions={category.occasions} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <CtaBand
        title="Tell us what your celebration needs."
        lead="Send us the services you are looking for along with your date and venue, and we will prepare a quotation."
      />
    </div>
  );
}
