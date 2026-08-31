import type { Metadata } from 'next';
import { CtaBand, Hero } from '@/components/page';
import {
  Badge,
  ButtonLink,
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  Section,
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
    <>
      <Hero
        compact
        eyebrow="Services"
        title="Complete celebration solutions"
        lead={positioning.brandRole}
        actions={
          <ButtonLink href={routes.quote} variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        }
      />

      <Section width="wide" aria-labelledby="in-house">
        <h2 id="in-house" className="font-display text-3xl font-medium">
          Designed and delivered by VRK Decor
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inHouse.map((service) => (
            <Card key={service.slug} as="li">
              <CardBody>
                <CardTitle as="h3">{service.name}</CardTitle>
                {service.description ? (
                  <CardMeta>{service.description}</CardMeta>
                ) : null}
              </CardBody>
            </Card>
          ))}
        </ul>
      </Section>

      <Section tone="subtle" width="wide" aria-labelledby="partner">
        <h2 id="partner" className="font-display text-3xl font-medium">
          Delivered with trusted partner vendors
        </h2>
        <p className="text-ink-muted mt-3 max-w-2xl">
          VRK Decor coordinates these specialist services with partner vendors, so your
          celebration stays under one point of contact.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partner.map((service) => (
            <Card key={service.slug} as="li">
              <CardBody>
                <CardTitle as="h3">{service.name}</CardTitle>
                {service.description ? (
                  <CardMeta>{service.description}</CardMeta>
                ) : null}
                <div>
                  <Badge tone="neutral">{PARTNER_VENDOR_LABEL}</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Tell us what your celebration needs"
        lead="Share the services you are looking for and the team will prepare a quotation."
      />
    </>
  );
}
