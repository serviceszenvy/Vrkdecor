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
  Section,
  SectionHeading,
} from '@/components/ui';
import { PARTNER_VENDOR_LABEL, positioning } from '@/lib/content';
import { getOccasions, getServices } from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import type { OccasionListItem } from '@/lib/db/public-content';

export const metadata: Metadata = pageMetadata({
  title: 'Services & Occasions',
  description:
    'Stage and mandap decoration, florals, entrance, furniture, LED and complete event management from VRK Decor — for weddings, personal celebrations and corporate events across Tamil Nadu.',
  path: '/services',
});

/**
 * Services — Requirements section 6, plus redesign brief sections 5 and 6.
 *
 * The brief asks for the separate Occasions page to be removed because it
 * overlapped heavily with Services, and for this page to become the primary
 * page for both. The occasion catalogue itself is unchanged (still the
 * approved list seeded into the database, `tests/unit/catalog-parity.test.ts`
 * still holds) — only its page moved, into a dedicated section here with its
 * own `#occasions` anchor, and the standalone route now redirects here
 * (`next.config.ts`).
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

  const occasionGroups = groupOccasions(occasions);

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Services & Occasions"
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
          eyebrow="Design & production"
          title="Designed and delivered"
          accent="by our own team"
          lead="These are the parts of your celebration we plan, build and set up ourselves."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inHouse.map((service, index) => {
            const ServiceIcon = serviceIcon(service.slug);
            return (
              <Card
                key={service.slug}
                as="li"
                interactive
                className={`animate-fade-up stagger-${Math.min((index % 4) + 1, 4)}`}
              >
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
            );
          })}
        </ul>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="partner">
        <SectionHeading
          id="partner"
          eyebrow="Specialist partners"
          title="Delivered with"
          accent="trusted partner vendors"
          lead="We arrange and coordinate these specialist services for you, so your celebration still has one point of contact."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partner.map((service, index) => {
            const ServiceIcon = serviceIcon(service.slug);
            return (
              <Card
                key={service.slug}
                as="li"
                tone="tint"
                className={`animate-fade-up stagger-${Math.min((index % 4) + 1, 4)}`}
              >
                <CardBody>
                  <IconChip tone="tint" size="md">
                    <ServiceIcon />
                  </IconChip>
                  <CardTitle as="h3" className="mt-1">
                    {service.name}
                  </CardTitle>
                  {service.description ? (
                    <CardMeta className="text-ink-soft">{service.description}</CardMeta>
                  ) : null}
                  <div>
                    <Badge tone="glass">{PARTNER_VENDOR_LABEL}</Badge>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </ul>
      </Section>

      {/*
        Occasions, folded in from the removed standalone page (brief section 6).
        Grouped rather than dumped as one long list, per the brief's explicit
        "do not simply dump all the old Occasions content" instruction.
      */}
      <Section tone="panel" width="wide" aria-labelledby="occasions-heading" id="occasions">
        <SectionHeading
          align="center"
          rule
          id="occasions-heading"
          eyebrow="Occasions"
          title="Every occasion"
          accent="we decorate"
          lead="Some of these are known by more than one name, so both are listed and you can find yours quickly. Pick one to see the work we have done for it."
        />

        <div className="mt-10 flex flex-col gap-10">
          {occasionGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <h3 className="text-ink text-lg font-semibold">{group.title}</h3>
              <OccasionGrid occasions={group.items} />
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Tell us what your celebration needs."
        lead="Send us the services and occasion you are looking for along with your date and venue, and we will prepare a quotation."
      />
    </div>
  );
}

type OccasionGroup = { title: string; items: OccasionListItem[] };

/**
 * Buckets the approved occasion catalogue into a handful of intelligible
 * groups for this page. Unknown/future slugs fall into "Other Celebrations"
 * rather than being dropped, so an occasion added later in the Admin Panel
 * still appears somewhere.
 */
function groupOccasions(occasions: OccasionListItem[]): OccasionGroup[] {
  const buckets: Record<string, string[]> = {
    'Weddings & Traditional Ceremonies': [
      'wedding',
      'reception',
      'engagement',
      'seer-varisai',
    ],
    'Personal & Family Celebrations': [
      'puberty-ceremony',
      'ear-piercing',
      'holy-communion',
      'baby-shower',
      'housewarming',
      'birthday',
      'anniversary',
    ],
    'Corporate & Institutional': ['corporate-events', 'college-events'],
  };

  const grouped: OccasionGroup[] = Object.entries(buckets)
    .map(([title, slugs]) => ({
      title,
      items: occasions.filter((occasion) => slugs.includes(occasion.slug)),
    }))
    .filter((group) => group.items.length > 0);

  const groupedSlugs = new Set(grouped.flatMap((group) => group.items.map((i) => i.slug)));
  const remaining = occasions.filter((occasion) => !groupedSlugs.has(occasion.slug));
  if (remaining.length > 0) {
    grouped.push({ title: 'Other Celebrations', items: remaining });
  }

  return grouped;
}
