import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CtaBand,
  EmptyState,
  HomeHero,
  OccasionGrid,
  ServiceArea,
  StatBar,
  ValueBand,
  serviceIcon,
  type Stat,
} from '@/components/page';
import {
  Badge,
  ButtonLink,
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
import { SampleContentNotice, SignatureGrid } from '@/features/portfolio/components';
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
 * Sections: the viewport-fitted hero with Explore Our Work and Our Services,
 * the approved figures, four signature designs, why choose VRK Decor, the
 * occasion grid, the services overview, how it works, styles, testimonials,
 * where we create, and the closing call to action. The persistent WhatsApp
 * action is in the application shell.
 *
 * Quote actions on this page: the header and the closing band. Nothing else
 * asks for a quote, on purpose (refinement brief, section 11).
 *
 * Deliberately not present: before/after (no data yet) and the social showcase
 * (no approved account handle has been supplied). Both are recorded in the
 * checkpoint rather than filled with invented content.
 */
export default async function HomePage() {
  const [occasions, services, designs, testimonials] = await Promise.all([
    getOccasions(),
    getServices(),
    listFeaturedDesigns(4),
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
    <div className="flex flex-col gap-3 pb-3 sm:gap-6 sm:pb-6">
      <HomeHero
        actions={
          <>
            <ButtonLink href={routes.work} variant="lime" size="lg">
              Explore Our Work
              <ArrowRightIcon className="size-4" />
            </ButtonLink>
            <ButtonLink href={routes.services} variant="glass-deep" size="lg">
              Our Services
              <GridIcon className="size-4" />
            </ButtonLink>
          </>
        }
      />

      <StatBar stats={stats} />

      <Section tone="panel" width="wide" aria-labelledby="featured-designs">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 sm:gap-4">
          <SectionHeading
            id="featured-designs"
            eyebrow="Recent celebrations"
            title="Our"
            accent="Signature"
            tail="Work"
            lead="Four celebrations we have set up recently, from a wedding mandap to a birthday evening."
          />
          <ButtonLink href={routes.work} variant="outline" size="sm">
            View All Work
            <ArrowRightIcon className="size-4" />
          </ButtonLink>
        </Reveal>

        <div className="mt-6 sm:mt-10">
          {designs.length > 0 ? (
            <>
              {isShowingSampleContent() ? (
                <div className="mb-6">
                  <SampleContentNotice />
                </div>
              ) : null}
              <SignatureGrid designs={designs} />
            </>
          ) : (
            <EmptyState
              title="Our portfolio is on its way"
              body="We are putting the design gallery together. In the meantime, tell us about your celebration and we will share relevant work with you directly."
              action={
                <ButtonLink href={routes.contact} variant="primary" size="md">
                  Tell us about your celebration
                </ButtonLink>
              }
            />
          )}
        </div>
      </Section>

      <ValueBand />

      <Section tone="panel-bloom" width="wide" aria-labelledby="occasions">
        <Reveal>
          <SectionHeading
            id="occasions"
            align="center"
            rule
            tone="tint"
            eyebrow="Occasions"
            title="Perfect for"
            accent="every occasion"
            lead="Weddings and receptions through to family ceremonies, birthdays and corporate events."
          />
        </Reveal>
        <div className="mt-7 sm:mt-10">
          <OccasionGrid occasions={featuredOccasions} />
        </div>
        <Reveal className="mt-6 flex justify-center sm:mt-8">
          <ButtonLink href={`${routes.services}#occasions`} variant="deep" size="md">
            See every occasion we decorate
            <ArrowRightIcon className="size-4" />
          </ButtonLink>
        </Reveal>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="services">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 sm:gap-4">
          <SectionHeading
            id="services"
            eyebrow="Services"
            title="Complete celebration"
            accent="solutions"
            lead={positioning.brandRole}
          />
          <ButtonLink href={routes.services} variant="outline" size="sm">
            See all services
            <ArrowRightIcon className="size-4" />
          </ButtonLink>
        </Reveal>

        <ul className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {featuredServices.map((service, index) => {
            const ServiceIcon = serviceIcon(service.slug);
            return (
              <Reveal
                as="li"
                key={service.slug}
                delay={index * 90}
                className="group border-line-soft lift shine press shadow-card flex flex-row items-start gap-3.5 rounded-2xl border bg-white p-4 sm:flex-col sm:gap-3 sm:p-6"
              >
                <IconChip tone="deep" size="md">
                  <ServiceIcon className="size-6" />
                </IconChip>
                {/*
                  A row on a phone, a stack from `sm` up. Six stacked cards
                  each opening with a 48px plate on its own line is most of a
                  screen of plates before a visitor reads a service name.
                */}
                <div className="flex min-w-0 flex-col gap-1.5 sm:contents">
                  <h3 className="font-display text-lg font-medium sm:mt-1 sm:text-xl">
                    {service.name}
                  </h3>
                  {service.description ? (
                    <p className="text-ink-muted text-sm leading-relaxed">
                      {service.description}
                    </p>
                  ) : null}
                  {service.deliveryModel === 'partner_vendor' ? (
                    <div>
                      <Badge tone="neutral">{PARTNER_VENDOR_LABEL}</Badge>
                    </div>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section tone="panel-bloom" width="wide" aria-labelledby="how-it-works">
        <Reveal>
          <SectionHeading
            id="how-it-works"
            align="center"
            rule
            tone="tint"
            eyebrow="How it works"
            title="From first look to"
            accent="your celebration"
          />
        </Reveal>
        <ol className="mt-7 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {howItWorks.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 110}
              effect="scale"
              className="group border-brand-200/70 lift shine press shadow-card relative flex flex-col gap-2 overflow-hidden rounded-2xl border bg-white/85 p-4 sm:p-5"
            >
              <span
                aria-hidden="true"
                className="font-display text-brand-200/70 pointer-events-none absolute -top-3 -right-1 text-7xl font-medium select-none"
              >
                {index + 1}
              </span>
              <span className="bg-brand-900 text-accent-300 ring-accent-500/40 flex size-10 items-center justify-center rounded-full text-sm font-semibold ring-1">
                {index + 1}
              </span>
              <h3 className="font-display mt-1 text-lg font-medium">{step.title}</h3>
              <p className="text-ink-soft text-sm leading-relaxed">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="styles">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12">
          <Reveal effect="left">
            <SectionHeading
              id="styles"
              eyebrow="Browse by style"
              title="Find the look"
              accent="you have in mind"
              lead="Traditional, royal, floral, minimal or contemporary. Filter the portfolio by the style you want and see what it looks like in a real venue."
            />
          </Reveal>
          <ul className="flex flex-wrap gap-2.5">
            {styles.map((style, index) => (
              <Reveal as="li" key={style.slug} delay={index * 50} effect="scale">
                <Link
                  href={`${routes.work}?style=${encodeURIComponent(style.slug)}`}
                  className="border-brand-200 bg-brand-50 text-brand-900 hover:border-accent-500 hover:bg-brand-900 hover:text-accent-200 press inline-flex min-h-11 items-center rounded-full border px-4 text-[0.8rem] font-medium transition-[background-color,color,border-color,transform] duration-300 motion-safe:hover:-translate-y-0.5 sm:px-4.5 sm:text-sm"
                >
                  {style.name}
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="testimonials">
        <Reveal>
          <SectionHeading
            id="testimonials"
            align="center"
            rule
            eyebrow="Testimonials"
            title="What our"
            accent="customers say"
          />
        </Reveal>
        <div className="mt-7 sm:mt-10">
          {testimonials.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Reveal
                  as="li"
                  key={testimonial.id}
                  delay={index * 100}
                  className="surface-bloom border-brand-200/60 lift press shadow-card flex flex-col gap-2.5 rounded-2xl border p-4 sm:gap-3 sm:p-6"
                >
                  <IconChip tone="lime" size="sm">
                    <StarIcon className="size-4" />
                  </IconChip>
                  <blockquote className="text-ink mt-1 leading-relaxed">
                    {testimonial.body}
                  </blockquote>
                  <p className="text-ink-soft text-sm">
                    {testimonial.name}
                    {testimonial.eventType ? ` · ${testimonial.eventType}` : ''}
                  </p>
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

      <ServiceArea tone="bloom" action="about" />

      <CtaBand />
    </div>
  );
}
