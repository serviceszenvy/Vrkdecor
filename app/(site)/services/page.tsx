import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand, Hero, celebrationIcon, serviceIcon } from '@/components/page';
import {
  Badge,
  ButtonLink,
  IconChip,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/ui';
import { ArrowRightIcon, ChevronRightIcon } from '@/components/layout/icons';
import {
  PARTNER_VENDOR_LABEL,
  celebrationGroups,
  positioning,
  serviceBlurbs,
  serviceGroups,
} from '@/lib/content';
import { getOccasions, getServices } from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Services and Occasions | Event Decoration',
  description:
    'Wedding, reception, birthday, baby shower, corporate and church decoration from VRK Decor, with stage and mandap, florals, entrance, furniture, LED and complete event management across Tamil Nadu.',
  path: '/services',
});

/**
 * Services — Requirements sections 5 and 6, on one page.
 *
 * The page is now the single place for both what VRK Decor does (the twelve
 * approved services, grouped) and what it does it for (the celebrations,
 * grouped the way a customer thinks about them). The separate Occasions page
 * was removed because the two overlapped; `/occasions` redirects here.
 *
 * Partner-vendor delivery is displayed rather than hidden, because
 * Requirements section 3 requires it to be represented accurately.
 *
 * Quote actions on this page: the header and the closing band, nothing else.
 */
export default async function ServicesPage() {
  const [services, occasions] = await Promise.all([getServices(), getOccasions()]);
  const bySlug = new Map(services.map((service) => [service.slug, service]));

  return (
    <div className="flex flex-col gap-3 pb-3 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Services and occasions"
        title="Complete celebration"
        accent="solutions"
        lead={positioning.brandRole}
        actions={
          <>
            <ButtonLink href="#occasions" variant="lime" size="lg">
              Occasions we decorate
              <ArrowRightIcon className="size-4" />
            </ButtonLink>
            <ButtonLink href={routes.work} variant="glass-deep" size="lg">
              Browse our work
            </ButtonLink>
          </>
        }
      />

      <Section tone="panel" width="wide" aria-labelledby="what-we-do">
        <Reveal>
          <SectionHeading
            id="what-we-do"
            eyebrow="What we do"
            title="Every part of the setting,"
            accent="looked after"
            lead="Twelve services, grouped by who delivers them. The first two groups are our own team. The third is arranged with trusted partner vendors and coordinated by us."
          />
        </Reveal>

        <div className="mt-7 flex flex-col gap-9 sm:mt-12 sm:gap-14">
          {serviceGroups.map((group, groupIndex) => {
            const entries = group.serviceSlugs
              .map((slug) => bySlug.get(slug))
              .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
            if (entries.length === 0) return null;

            return (
              <div
                key={group.id}
                className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-10"
              >
                <Reveal
                  effect="left"
                  className="flex flex-col gap-2.5 sm:gap-3 lg:sticky lg:top-28 lg:self-start"
                >
                  <span className="text-accent-700 text-2xs inline-flex items-center gap-2 font-semibold tracking-[0.22em] uppercase">
                    <span className="bg-brand-900 text-accent-300 inline-flex size-7 items-center justify-center rounded-full text-xs tabular-nums">
                      {String(groupIndex + 1).padStart(2, '0')}
                    </span>
                    {group.eyebrow}
                  </span>
                  <h3 className="font-display text-2xl font-medium sm:text-3xl">
                    {group.title}{' '}
                    <span className="text-gradient-sage">{group.accent}</span>
                  </h3>
                  <p className="text-ink-muted text-[0.95rem] leading-relaxed sm:text-base">
                    {group.lead}
                  </p>
                </Reveal>

                <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {entries.map((service, index) => {
                    const ServiceIcon = serviceIcon(service.slug);
                    const partner = service.deliveryModel === 'partner_vendor';
                    return (
                      <Reveal
                        as="li"
                        key={service.slug}
                        delay={index * 90}
                        effect="scale"
                        className={
                          partner
                            ? 'group surface-bloom border-brand-200/60 lift shine press shadow-card flex flex-row items-start gap-3.5 rounded-2xl border p-4 sm:flex-col sm:gap-3 sm:p-6'
                            : 'group border-line-soft lift shine press shadow-card flex flex-row items-start gap-3.5 rounded-2xl border bg-white p-4 sm:flex-col sm:gap-3 sm:p-6'
                        }
                      >
                        <IconChip tone="deep" size="md" className="sm:size-14">
                          <ServiceIcon className="size-6" />
                        </IconChip>
                        {/* A row on a phone, a stack from `sm` up. */}
                        <div className="flex min-w-0 flex-col gap-1.5 sm:contents">
                          <h4 className="font-display text-lg font-medium sm:mt-1 sm:text-xl">
                            {service.name}
                          </h4>
                          <p className="text-ink-soft text-sm leading-relaxed">
                            {service.description ?? serviceBlurbs[service.slug]}
                          </p>
                          {partner ? (
                            <div className="pt-0.5 sm:mt-auto sm:pt-1">
                              <Badge tone="deep">{PARTNER_VENDOR_LABEL}</Badge>
                            </div>
                          ) : null}
                        </div>
                      </Reveal>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        tone="panel-bloom"
        width="wide"
        aria-labelledby="occasions-heading"
        id="occasions"
      >
        <Reveal>
          <SectionHeading
            id="occasions-heading"
            align="center"
            rule
            tone="tint"
            eyebrow="Occasions we decorate"
            title="Perfect for"
            accent="every occasion"
            lead="Weddings, family ceremonies, corporate events and church celebrations, each decorated for what the day means. Choose one to see how we have set it up before."
          />
        </Reveal>

        <div className="mt-8 flex flex-col gap-9 sm:mt-12 sm:gap-14">
          {celebrationGroups.map((group) => (
            <div
              key={group.id}
              className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-10"
            >
              <Reveal
                effect="left"
                className="flex flex-col gap-2.5 sm:gap-3 lg:sticky lg:top-28 lg:self-start"
              >
                <h3 className="font-display text-2xl font-medium sm:text-3xl">
                  {group.title} <span className="text-brand-800">{group.accent}</span>
                </h3>
                <p className="text-ink-soft text-[0.95rem] leading-relaxed sm:text-base">
                  {group.lead}
                </p>
              </Reveal>

              <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                {group.items.map((item, index) => {
                  const ItemIcon = celebrationIcon(item.icon);
                  return (
                    <Reveal as="li" key={item.name} delay={index * 80} effect="scale">
                      <Link
                        href={`${routes.work}?occasion=${encodeURIComponent(item.occasionSlug)}`}
                        className="group border-brand-200/70 hover:border-accent-500/70 lift shine press shadow-card flex h-full gap-3.5 rounded-2xl border bg-white/90 p-3.5 transition-colors sm:gap-4 sm:p-5"
                      >
                        <IconChip tone="deep" size="md">
                          <ItemIcon className="size-6" />
                        </IconChip>
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="font-display text-ink text-lg leading-snug font-medium">
                            {item.name}
                          </span>
                          {item.secondaryTerm ? (
                            <span className="text-brand-800 text-xs font-medium">
                              {item.secondaryTerm}
                            </span>
                          ) : null}
                          <span className="text-ink-soft text-sm leading-relaxed">
                            {item.blurb}
                          </span>
                          <span className="text-brand-800 mt-1 inline-flex items-center gap-1 text-xs font-semibold tracking-[0.16em] uppercase">
                            See our work
                            <ChevronRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </span>
                      </Link>
                    </Reveal>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <Reveal className="border-brand-200/70 mt-9 flex flex-col gap-4 border-t pt-7 sm:mt-14 sm:pt-8">
          <h3
            id="occasion-filters"
            className="text-brand-800 text-2xs font-semibold tracking-[0.22em] uppercase"
          >
            Browse the portfolio by occasion
          </h3>
          <ul className="flex flex-wrap gap-2" aria-labelledby="occasion-filters">
            {occasions.map((occasion) => (
              <li key={occasion.slug}>
                <Link
                  href={`${routes.work}?occasion=${encodeURIComponent(occasion.slug)}`}
                  className="border-brand-200 hover:border-accent-500 hover:bg-brand-900 hover:text-accent-200 press inline-flex min-h-11 items-center gap-1.5 rounded-full border bg-white px-3.5 text-[0.8rem] font-medium transition-[background-color,color,border-color,transform] duration-300 motion-safe:hover:-translate-y-0.5 sm:px-4 sm:text-sm"
                >
                  {occasion.name}
                  {occasion.secondaryTerm ? (
                    <span className="text-ink-muted group-hover:text-accent-200/80 text-xs">
                      {occasion.secondaryTerm}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <CtaBand
        eyebrow="Planning one of these?"
        title="Tell us what your celebration needs."
        accent="We will put a quotation together."
        lead="Send us the occasion, your date and your venue, and we will come back to you on the phone or on WhatsApp."
      />
    </div>
  );
}
