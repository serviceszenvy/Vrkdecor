import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CtaBand,
  EmptyState,
  HomeHero,
  OccasionGrid,
  StatBar,
  ValueBand,
  serviceIcon,
  type Stat,
} from '@/components/page';
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
import {
  ArrowRightIcon,
  CalendarIcon,
  GridIcon,
  PinIcon,
  StarIcon,
  TeamIcon,
} from '@/components/layout/icons';
import {
  PARTNER_VENDOR_LABEL,
  coverage,
  credentials,
  howItWorks,
  positioning,
  styles,
} from '@/lib/content';
import { isShowingSampleContent, listFeaturedDesigns } from '@/features/portfolio';
import { DesignRail, SampleContentNotice } from '@/features/portfolio/components';
import { getOccasions, getServices, getTestimonials } from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'VRK Decor | Premium Event Design in Nagercoil and Tamil Nadu',
  absoluteTitle: true,
  description:
    'VRK Decor designs and sets up weddings, receptions and celebrations across Tamil Nadu. 14+ years, 600+ events. See our work and ask for a quote.',
  path: '/',
});

/** The approved figures, with an icon each for the band under the hero. */
const STAT_ICONS = [CalendarIcon, StarIcon, TeamIcon] as const;

/**
 * Home page — Requirements section 7.
 *
 * Sections implemented: photographic hero with Explore Our Work and Our
 * Services, the approved figures, featured designs, occasions, why choose VRK
 * Decor, services overview, how it works, testimonials and the closing CTA. The
 * persistent WhatsApp action is in the application shell.
 *
 * Deliberately not present: before/after (no data yet) and the social showcase
 * (no approved account handle has been supplied). Both are recorded in the
 * checkpoint rather than filled with invented content.
 */
export default async function HomePage() {
  const [occasions, services, designs, testimonials] = await Promise.all([
    getOccasions(),
    getServices(),
    listFeaturedDesigns(8),
    getTestimonials(),
  ]);

  const stats: Stat[] = [
    ...credentials.map((credential, index) => ({
      value: credential.value,
      label: credential.label,
      icon: STAT_ICONS[index] ?? StarIcon,
    })),
    {
      value: String(coverage.primaryAreas.length),
      label: 'Primary coverage areas',
      icon: PinIcon,
    },
  ];

  const featuredOccasions = occasions.slice(0, 6);
  const featuredServices = services.slice(0, 6);

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <HomeHero
        actions={
          <>
            <ButtonLink href={routes.work} variant="primary" size="lg">
              Explore Our Work
              <ArrowRightIcon className="size-4" />
            </ButtonLink>
            <ButtonLink href={routes.services} variant="glass" size="lg">
              Our Services
              <GridIcon className="size-4" />
            </ButtonLink>
          </>
        }
      />

      <StatBar stats={stats} />

      <Section tone="panel" width="wide" aria-labelledby="featured-designs">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            id="featured-designs"
            title="Our"
            accent="Signature"
            tail="Work"
            lead="A few of the celebrations we have set up recently."
          />
          <ButtonLink href={routes.work} variant="glass" size="sm">
            View All Work
            <ArrowRightIcon className="size-4" />
          </ButtonLink>
        </div>

        <div className="mt-8">
          {designs.length > 0 ? (
            <>
              {isShowingSampleContent() ? (
                <div className="mb-6">
                  <SampleContentNotice />
                </div>
              ) : null}
              <DesignRail designs={designs} />
            </>
          ) : (
            <EmptyState
              title="Our portfolio is on its way"
              body="We are putting the design gallery together. In the meantime, tell us about your celebration and we will share relevant work with you directly."
              action={
                <ButtonLink href={routes.quote} variant="primary" size="md">
                  Get a Quote
                </ButtonLink>
              }
            />
          )}
        </div>
      </Section>

      <ValueBand />

      <Section tone="panel" width="wide" aria-labelledby="occasions">
        <SectionHeading
          id="occasions"
          align="center"
          rule
          title="Perfect for"
          accent="every occasion"
          lead="Weddings and receptions through to family ceremonies, birthdays and corporate events."
        />
        <div className="mt-10">
          <OccasionGrid occasions={featuredOccasions} />
        </div>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={routes.occasions} variant="outline" size="md">
            See all occasions
          </ButtonLink>
        </div>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="services">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            id="services"
            eyebrow="Services"
            title="Complete celebration"
            accent="solutions"
            lead={positioning.brandRole}
          />
          <ButtonLink href={routes.services} variant="glass" size="sm">
            See all services
            <ArrowRightIcon className="size-4" />
          </ButtonLink>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service, index) => {
            const ServiceIcon = serviceIcon(service.slug);
            return (
              <Reveal key={service.slug} as="li" delay={Math.min(index * 60, 240)}>
                <Card tone="surface" interactive className="h-full">
                  <CardBody>
                    <IconChip tone="brand" size="sm">
                      <ServiceIcon className="size-4" />
                    </IconChip>
                    <CardTitle as="h3" className="mt-1">
                      {service.name}
                    </CardTitle>
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
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="how-it-works">
        <SectionHeading
          id="how-it-works"
          align="center"
          rule
          eyebrow="How it works"
          title="From first look to"
          accent="your celebration"
        />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step, index) => (
            <Reveal key={step.title} as="li" delay={Math.min(index * 70, 240)}>
              <div className="border-line-soft bg-canvas/60 hover:border-accent-300/50 hover:shadow-card flex h-full flex-col gap-2 rounded-2xl border p-5 transition-[border-color,box-shadow] duration-300">
                <span className="bg-brand-700 flex size-9 items-center justify-center rounded-full text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="font-display mt-1 text-lg font-medium">{step.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="styles">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12">
          <SectionHeading
            id="styles"
            eyebrow="Browse by style"
            title="Find the look"
            accent="you have in mind"
            lead="Traditional, royal, floral, minimal or contemporary. Filter the portfolio by the style you want and see what it looks like in a real venue."
          />
          <ul className="flex flex-wrap gap-2">
            {styles.map((style) => (
              <li key={style.slug}>
                <Link
                  href={`${routes.work}?style=${encodeURIComponent(style.slug)}`}
                  className="border-line-soft bg-surface text-ink hover:border-accent-300/60 hover:bg-white/5 inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors"
                >
                  {style.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        tone="panel"
        width="wide"
        aria-labelledby="testimonials"
        panelClassName="from-accent-950/50 via-surface-tint to-brand-900 relative isolate bg-gradient-to-br"
      >
        {/*
          A colourful accent-tinted dark panel, not a plain repeat of `canvas`
          — this section's job in the page rhythm is to break up the run of
          same-toned panels (docs/ui-audit.md finding H1) while staying on
          theme now that the whole site is dark, not just three "bookend"
          sections.
        */}
        <div
          aria-hidden="true"
          className="ambient-blob bg-accent-300/25 motion-safe:animate-drift-slow -top-10 -left-16 size-72"
        />
        <div
          aria-hidden="true"
          className="ambient-blob bg-brand-300/20 motion-safe:animate-drift-slower -right-16 -bottom-14 size-80"
        />
        <SectionHeading
          id="testimonials"
          align="center"
          rule
          eyebrow="Testimonials"
          title="What our"
          accent="customers say"
        />
        <div className="mt-10">
          {testimonials.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Reveal key={testimonial.id} as="li" delay={Math.min(index * 70, 240)}>
                  <Card tone="surface" className="h-full">
                    <CardBody>
                      <IconChip tone="tint" size="sm">
                        <StarIcon className="size-4" />
                      </IconChip>
                      <blockquote className="text-ink mt-1 leading-relaxed">
                        {testimonial.body}
                      </blockquote>
                      <CardMeta className="text-ink-soft">
                        {testimonial.name}
                        {testimonial.eventType ? ` · ${testimonial.eventType}` : ''}
                      </CardMeta>
                    </CardBody>
                  </Card>
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Customer stories coming soon"
              body="Reviews from recent celebrations will appear here once they have been checked and approved."
            />
          )}
        </div>
      </Section>

      <CtaBand />

      <Section tone="canvas" spacing="compact" width="wide" aria-labelledby="coverage">
        <h2 id="coverage" className="sr-only">
          Areas we serve
        </h2>
        <p className="text-ink-muted text-sm">
          We work across {coverage.primaryAreas.join(', ')} and anywhere in Tamil Nadu
          depending on what your event needs.{' '}
          <Link
            className="text-accent-300 underline underline-offset-4"
            href={routes.about}
          >
            About VRK Decor
          </Link>
        </p>
      </Section>
    </div>
  );
}
