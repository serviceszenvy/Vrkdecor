import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand, EmptyState, Hero, StatList } from '@/components/page';
import {
  Badge,
  ButtonLink,
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  ImageFrame,
  Section,
  SectionHeading,
} from '@/components/ui';
import {
  PARTNER_VENDOR_LABEL,
  credentials,
  howItWorks,
  positioning,
  styles,
  whyChooseUs,
} from '@/lib/content';
import {
  getOccasions,
  getPublishedDesigns,
  getServices,
  getTestimonials,
} from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = pageMetadata({
  title: 'VRK Decor — Premium Event Design, Nagercoil & Tamil Nadu',
  absoluteTitle: true,
  description:
    'VRK Decor designs weddings, receptions and celebrations across Tamil Nadu. 14+ years, 600+ events. Explore our work and request a quote.',
  path: '/',
});

/**
 * Home page — Requirements section 7.
 *
 * Sections implemented: hero with Explore Our Work and Get a Quote, credentials,
 * featured occasions, featured designs, browse by style, services overview,
 * Why Choose VRK Decor, How It Works, testimonials and the final CTA. The
 * persistent WhatsApp action is in the application shell (P2).
 *
 * Deliberately not present: before/after (no data yet — P5) and the
 * social/Instagram showcase (no approved account handle supplied). Both are
 * recorded in the checkpoint rather than filled with invented content.
 */
export default async function HomePage() {
  const [occasions, services, designs, testimonials] = await Promise.all([
    getOccasions(),
    getServices(),
    getPublishedDesigns(6),
    getTestimonials(),
  ]);

  const featuredOccasions = occasions.slice(0, 8);
  const featuredServices = services.slice(0, 6);

  return (
    <>
      <Hero
        eyebrow={positioning.headline}
        title="Celebrations designed with care, across Tamil Nadu"
        lead={`${siteConfig.name} designs and coordinates weddings, receptions and family celebrations — from stage and mandap to florals, entrance and complete event management.`}
        actions={
          <>
            <ButtonLink href={routes.work} variant="primary" size="lg">
              Explore Our Work
            </ButtonLink>
            <ButtonLink href={routes.quote} variant="outline" size="lg">
              Get a Quote
            </ButtonLink>
          </>
        }
        media={
          /*
            Requirements section 7 calls for a premium hero image or video. No
            approved photography has been supplied, so this is a deliberate
            brand panel rather than an empty image placeholder. Replace the
            inner element with the approved hero photograph or video when it is
            available; the frame and layout accept it unchanged.
          */
          <ImageFrame
            ratio="hero"
            // Hidden below `lg`: as a decorative panel it would push the page
            // content down on mobile for no informational gain. Show it at all
            // sizes once the approved hero photograph replaces it.
            className="hidden w-full lg:ml-auto lg:block lg:max-w-lg"
          >
            <div className="from-brand-700 via-brand-800 to-brand-950 relative h-full w-full bg-gradient-to-br">
              <div
                aria-hidden="true"
                className="bg-accent-500/20 absolute -top-16 -right-16 size-56 rounded-full blur-3xl"
              />
            </div>
          </ImageFrame>
        }
      />

      <Section spacing="compact" width="wide" aria-labelledby="credentials">
        <h2 id="credentials" className="sr-only">
          VRK Decor at a glance
        </h2>
        <StatList stats={credentials} />
      </Section>

      <Section tone="subtle" width="wide" aria-labelledby="occasions">
        <SectionHeading
          id="occasions"
          eyebrow="Occasions"
          title="Every celebration, designed for the moment"
          lead="Weddings and receptions through to house warmings, baby showers and corporate events."
        />
        <ul className="mt-8 flex flex-wrap gap-2">
          {featuredOccasions.map((occasion) => (
            <li key={occasion.slug}>
              <Badge tone="brand">
                {occasion.name}
                {occasion.secondaryTerm ? ` · ${occasion.secondaryTerm}` : ''}
              </Badge>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ButtonLink href={routes.occasions} variant="outline" size="md">
            See all occasions
          </ButtonLink>
        </div>
      </Section>

      <Section width="wide" aria-labelledby="featured-designs">
        <SectionHeading
          id="featured-designs"
          eyebrow="Our work"
          title="Featured designs"
          lead="Browse recent celebrations and request a quote for the design you like."
        />
        <div className="mt-8">
          {designs.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((design) => (
                <Card key={design.id} as="li" interactive className="group">
                  <ImageFrame ratio="landscape" rounded={false} zoomOnHover>
                    <div className="from-brand-100 to-accent-100 h-full w-full bg-gradient-to-br" />
                  </ImageFrame>
                  <CardBody>
                    <CardTitle>{design.name}</CardTitle>
                    {design.location ? <CardMeta>{design.location}</CardMeta> : null}
                  </CardBody>
                </Card>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Our portfolio is on its way"
              body="VRK Decor is preparing the design gallery. In the meantime, tell us about your celebration and the team will share relevant work directly."
              action={
                <ButtonLink href={routes.quote} variant="primary" size="md">
                  Get a Quote
                </ButtonLink>
              }
            />
          )}
        </div>
      </Section>

      <Section tone="subtle" width="wide" aria-labelledby="styles">
        <SectionHeading
          id="styles"
          eyebrow="Browse by style"
          title="Find the look you have in mind"
          lead="Traditional, royal, floral, minimal or contemporary — filter the portfolio by the style you want."
        />
        <ul className="mt-8 flex flex-wrap gap-2">
          {styles.map((style) => (
            <li key={style.slug}>
              <Badge tone="neutral">{style.name}</Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Section width="wide" aria-labelledby="services">
        <SectionHeading
          id="services"
          eyebrow="Services"
          title="Complete celebration solutions"
          lead={positioning.brandRole}
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <Card key={service.slug} as="li">
              <CardBody>
                <CardTitle as="h3">{service.name}</CardTitle>
                {service.description ? (
                  <CardMeta>{service.description}</CardMeta>
                ) : null}
                {service.deliveryModel === 'partner_vendor' ? (
                  <div>
                    <Badge tone="neutral">{PARTNER_VENDOR_LABEL}</Badge>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          ))}
        </ul>
        <div className="mt-8">
          <ButtonLink href={routes.services} variant="outline" size="md">
            See all services
          </ButtonLink>
        </div>
      </Section>

      <Section tone="subtle" width="wide" aria-labelledby="why-vrk">
        <SectionHeading
          id="why-vrk"
          eyebrow="Why VRK Decor"
          title="Experience you can plan around"
        />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {whyChooseUs.map((reason) => (
            <li key={reason.title} className="flex flex-col gap-1.5">
              <h3 className="font-display text-xl font-medium">{reason.title}</h3>
              <p className="text-ink-muted">{reason.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section width="wide" aria-labelledby="how-it-works">
        <SectionHeading
          id="how-it-works"
          eyebrow="How it works"
          title="From first look to your celebration"
        />
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2">
              <span className="bg-brand-800 flex size-9 items-center justify-center rounded-full text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="font-display text-lg font-medium">{step.title}</h3>
              <p className="text-ink-muted text-sm">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="subtle" width="wide" aria-labelledby="testimonials">
        <SectionHeading
          id="testimonials"
          eyebrow="Testimonials"
          title="What our customers say"
        />
        <div className="mt-8">
          {testimonials.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} as="li">
                  <CardBody>
                    <blockquote className="text-ink">{testimonial.body}</blockquote>
                    <CardMeta>
                      {testimonial.name}
                      {testimonial.eventType ? ` · ${testimonial.eventType}` : ''}
                    </CardMeta>
                  </CardBody>
                </Card>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Customer stories coming soon"
              body="Approved testimonials from recent celebrations will appear here."
            />
          )}
        </div>
      </Section>

      <CtaBand />

      <Section spacing="compact" width="wide" aria-labelledby="coverage">
        <h2 id="coverage" className="sr-only">
          Areas we serve
        </h2>
        <p className="text-ink-muted text-sm">
          Serving {siteConfig.coverage.join(', ')} and anywhere in Tamil Nadu based on
          requirement.{' '}
          <Link
            className="text-brand-700 underline underline-offset-4"
            href={routes.about}
          >
            About VRK Decor
          </Link>
        </p>
      </Section>
    </>
  );
}
