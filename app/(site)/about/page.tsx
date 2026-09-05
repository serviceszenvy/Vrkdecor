import type { Metadata } from 'next';
import Image from 'next/image';
import {
  CtaBand,
  FounderPortrait,
  Hero,
  ServiceArea,
  StatBar,
  type Stat,
} from '@/components/page';
import { ButtonLink, IconChip, Reveal, Section, SectionHeading } from '@/components/ui';
import {
  ArrowRightIcon,
  CalendarIcon,
  FlowerIcon,
  LeafIcon,
  PinIcon,
  SparkIcon,
  StarIcon,
  TeamIcon,
} from '@/components/layout/icons';
import {
  coverage,
  credentials,
  founder,
  heroImage,
  howItWorks,
  positioning,
  whyChooseUs,
} from '@/lib/content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  description:
    'VRK Decor is an event design and coordination brand based in Nagercoil with 14+ years of experience, 600+ events delivered and a team of 35+, led by Founder and CEO V. Raja Kumerasen.',
  path: '/about',
});

const STAT_ICONS = [CalendarIcon, StarIcon, TeamIcon] as const;
const VALUE_ICONS = [FlowerIcon, TeamIcon, LeafIcon, SparkIcon] as const;

/**
 * About — Requirements sections 2, 3 and 18, rebuilt as an editorial page
 * (refinement brief, sections 13 to 16).
 *
 * Full-width hero, the approved figures, a story split, the philosophy, the
 * founder, a timeline of how the team works, where it works, and the closing
 * action. Every statement still restates an approved business fact or the
 * founder positioning supplied in the brief. No history, award, ranking or
 * client count is asserted, because none is approved.
 */
export default function AboutPage() {
  const { address } = siteConfig.contact;

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

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        eyebrow="About VRK Decor"
        title={positioning.headline}
        lead={positioning.brandRole}
        actions={
          <>
            <ButtonLink href="#founder" variant="lime" size="lg">
              Meet the founder
              <ArrowRightIcon className="size-4" />
            </ButtonLink>
            <ButtonLink href={routes.work} variant="glass-deep" size="lg">
              Explore Our Work
            </ButtonLink>
          </>
        }
      />

      <StatBar stats={stats} />

      <Section tone="panel" width="wide" aria-labelledby="our-story">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
          <Reveal effect="mask" className="order-last lg:order-first">
            <div className="from-brand-700 via-brand-800 to-brand-950 shadow-deep relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-gradient-to-br sm:aspect-[5/4] lg:aspect-[4/5]">
              {heroImage.src ? (
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : null}
              <div
                aria-hidden="true"
                className="from-brand-950/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
              />
              <blockquote className="glass-surface-deep glass-edge absolute right-4 bottom-4 left-4 rounded-2xl p-4 text-white sm:right-auto sm:max-w-xs">
                <p className="font-display text-lg leading-snug">
                  Your celebration, exactly as you pictured it.
                </p>
                <footer className="text-accent-300 text-2xs mt-2 font-semibold tracking-[0.2em] uppercase">
                  What we work towards
                </footer>
              </blockquote>
            </div>
          </Reveal>

          <Reveal effect="right" className="flex flex-col gap-5">
            <SectionHeading
              id="our-story"
              eyebrow="Our story"
              title="One team for the"
              accent="whole celebration"
            />
            <p className="text-ink text-lg leading-relaxed">
              VRK Decor is an event design and coordination brand based in Nagercoil.
              For more than fourteen years we have designed and set up weddings,
              receptions, family ceremonies, birthdays and corporate events across Tamil
              Nadu, more than six hundred of them so far.
            </p>
            <p className="text-ink-muted leading-relaxed">
              The stage and mandap, the florals, the entrance, the furniture and
              seating, the return gifts and the running of the day are all handled by
              our own team of thirty five. Makeup, sound and lighting, photography and
              catering are arranged with trusted partner vendors and coordinated by us,
              so you still have one point of contact.
            </p>
            <p className="text-ink-muted leading-relaxed">
              We work from {address.street}, {address.city}, and we travel to wherever
              the celebration is.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="panel-bloom" width="wide" aria-labelledby="philosophy">
        <Reveal>
          <SectionHeading
            id="philosophy"
            align="center"
            rule
            tone="tint"
            eyebrow="How we think about a celebration"
            title="Designed around"
            accent="your day"
          />
        </Reveal>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((point, index) => {
            const PointIcon = VALUE_ICONS[index] ?? FlowerIcon;
            return (
              <Reveal
                as="li"
                key={point.title}
                delay={index * 100}
                effect="scale"
                className="group border-brand-200/70 lift shine shadow-card flex flex-col gap-3 rounded-2xl border bg-white/90 p-5 sm:p-6"
              >
                <IconChip tone="deep" size="lg">
                  <PointIcon className="size-6" />
                </IconChip>
                <h3 className="font-display mt-1 text-xl font-medium">{point.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{point.body}</p>
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <Section
        tone="panel-deep"
        width="wide"
        aria-labelledby="founder-heading"
        id="founder"
        panelClassName="pattern-dots"
      >
        <span
          aria-hidden="true"
          className="ambient-blob bg-accent-500/30 -top-32 right-[10%] size-[26rem]"
        />
        <span
          aria-hidden="true"
          className="ambient-blob ambient-blob-slow bg-brand-400/35 -bottom-40 -left-24 size-[24rem]"
        />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
          <Reveal effect="scale" className="pb-6">
            <FounderPortrait
              portrait={founder.portrait}
              name={founder.name}
              role={founder.role}
            />
          </Reveal>

          <Reveal effect="right" delay={120} className="flex flex-col gap-5">
            <p className="text-accent-300 text-2xs inline-flex items-center gap-2.5 font-semibold tracking-[0.24em] uppercase">
              <span className="bg-accent-400 inline-block size-2 rounded-full shadow-[0_0_0_4px_rgb(142_200_64/0.25)]" />
              {founder.role}
            </p>
            <h2 id="founder-heading" className="text-4xl font-medium sm:text-5xl">
              <span className="text-gradient-lime">{founder.name}</span>
            </h2>
            <p className="text-lg leading-relaxed text-white">{founder.intro}</p>
            <p className="text-ink-on-deep leading-relaxed">{founder.approach}</p>

            <ul className="mt-2 grid gap-3 sm:grid-cols-3">
              {founder.principles.map((principle, index) => (
                <Reveal
                  as="li"
                  key={principle.title}
                  delay={200 + index * 100}
                  className="glass-surface-deep glass-edge flex flex-col gap-1.5 rounded-2xl p-4"
                >
                  <span className="text-accent-300 text-2xs font-semibold tracking-[0.18em] uppercase">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-white">{principle.title}</span>
                  <span className="text-ink-on-deep text-sm leading-relaxed">
                    {principle.body}
                  </span>
                </Reveal>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="how-we-work">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <Reveal effect="left" className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              id="how-we-work"
              eyebrow="How we work with you"
              title="From first look to"
              accent="your celebration"
              lead="Four steps, the same every time, so you always know what happens next."
            />
          </Reveal>

          <ol className="relative flex flex-col gap-2">
            <span
              aria-hidden="true"
              className="from-accent-500 via-brand-400 to-brand-200 absolute top-4 bottom-4 left-5 w-px bg-gradient-to-b"
            />
            {howItWorks.map((step, index) => (
              <Reveal
                as="li"
                key={step.title}
                delay={index * 120}
                effect="left"
                className="group relative flex gap-5 py-3 pl-1"
              >
                <span className="bg-brand-900 text-accent-300 ring-accent-500/40 relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-offset-2 ring-offset-white transition-transform duration-500 group-hover:scale-110">
                  {index + 1}
                </span>
                <div className="border-line-soft lift shadow-card flex flex-1 flex-col gap-1.5 rounded-2xl border bg-white p-5">
                  <h3 className="font-display text-xl font-medium">{step.title}</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <ServiceArea tone="bloom" action="contact" />

      <CtaBand />
    </div>
  );
}
