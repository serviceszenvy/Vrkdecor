import type { Metadata } from 'next';
import { CtaBand, Hero, serviceIcon } from '@/components/page';
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
import { getServices } from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Event Decoration Services',
  description:
    'Stage and mandap decoration, florals, entrance, furniture, LED and complete event management from VRK Decor, with trusted partner vendors for specialist services.',
  path: '/services',
});

/**
 * Services — Requirements section 6.
 *
 * Partner-vendor delivery is displayed rather than hidden, because Requirements
 * section 3 requires it to be represented accurately.
 */
export default async function ServicesPage() {
  const services = await getServices();

  const inHouse = services.filter((service) => service.deliveryModel === 'in_house');
  const partner = services.filter(
    (service) => service.deliveryModel === 'partner_vendor',
  );

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
          {inHouse.map((service) => {
            const ServiceIcon = serviceIcon(service.slug);
            return (
              <Card key={service.slug} as="li" interactive>
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
          title="Delivered with"
          accent="trusted partner vendors"
          lead="We arrange and coordinate these specialist services for you, so your celebration still has one point of contact."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partner.map((service) => {
            const ServiceIcon = serviceIcon(service.slug);
            return (
              <Card key={service.slug} as="li" tone="tint">
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

      <CtaBand
        title="Tell us what your celebration needs."
        lead="Send us the services you are looking for along with your date and venue, and we will prepare a quotation."
      />
    </div>
  );
}
