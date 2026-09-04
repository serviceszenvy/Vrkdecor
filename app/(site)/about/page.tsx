import type { Metadata } from 'next';
import { CtaBand, Hero, StatList } from '@/components/page';
import { ButtonLink, IconChip, Reveal, Section, SectionHeading } from '@/components/ui';
import { PinIcon } from '@/components/layout/icons';
import { coverage, credentials, positioning, whyChooseUs } from '@/lib/content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  description:
    'VRK Decor is an event design and coordination brand based in Nagercoil with 14+ years of experience, 600+ events delivered and a team of 35+.',
  path: '/about',
});

/**
 * Founder content, client-supplied for this page (not in the approved
 * `01_REQUIREMENTS` figures, so it lives here rather than in
 * `lib/content/business.ts`, which `tests/unit/content.test.ts` checks
 * verbatim against those figures). The bio is deliberately general — vision
 * and approach, not a claimed history, award or number — per the same "do not
 * invent business facts" rule the rest of this page follows.
 *
 * No photograph has been supplied. Rather than use a stock photo of a real
 * person to stand in for a specific named individual, the portrait slot below
 * is a monogram placeholder — swap in a real photo by replacing that one
 * element when one is available.
 */
const founder = {
  name: 'V. Raja Kumerasen',
  title: 'Founder & CEO',
  bio: 'Every VRK Decor celebration starts from the same idea: the setting should feel like it was made for this family, on this day, not assembled from a catalogue. That attention — to colour, to proportion, to the small details a guest notices without knowing why — shapes how the team designs and builds every event we take on, from the first sketch to the last light switched on.',
};

/**
 * About — Requirements sections 2, 3 and 18, plus a Founder section (client-
 * supplied name and generic, non-factual bio) and a polished coverage section
 * reusing the same approved `coverage` figures already used elsewhere.
 * Every statement on this page restates an approved business fact or the
 * founder content above. No history, award or unsupported claim is asserted.
 */
export default function AboutPage() {
  const { address } = siteConfig.contact;

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="About us"
        title={positioning.headline}
        lead={positioning.brandRole}
        actions={
          <ButtonLink href={routes.work} variant="primary" size="lg">
            Explore Our Work
          </ButtonLink>
        }
      />

      <Section tone="panel" spacing="compact" width="wide" aria-labelledby="figures">
        <h2 id="figures" className="sr-only">
          VRK Decor at a glance
        </h2>
        <StatList stats={credentials} />
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="what-we-do">
        <SectionHeading
          id="what-we-do"
          eyebrow="What we do"
          title="One team for the"
          accent="whole celebration"
          lead="We design and run events from end to end. Stage and mandap, florals, entrance, furniture and seating, return gifts and full event management, all handled by the same people."
        />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {whyChooseUs.map((point, index) => (
            <Reveal
              key={point.title}
              as="li"
              delay={Math.min(index * 70, 240)}
              className="flex flex-col gap-1.5"
            >
              <h3 className="font-display text-xl font-medium">{point.title}</h3>
              <p className="text-ink-muted">{point.body}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="founder">
        <SectionHeading
          id="founder"
          eyebrow="Leadership"
          title="Led by"
          accent="design, not guesswork"
        />
        <Reveal
          as="div"
          className="border-accent-300/15 from-brand-800 to-surface-tint mt-10 grid gap-8 rounded-3xl border bg-gradient-to-br p-6 sm:p-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-12"
        >
          {/*
            Monogram placeholder — see the comment on `founder` above for why
            this is not a stock photo. Swap this one element for a real
            portrait (`next/image`) when one is supplied.
          */}
          <div
            aria-hidden="true"
            className="from-brand-600 to-accent-700 ring-accent-300/30 font-display mx-auto flex size-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-medium tracking-tight text-white ring-2 sm:size-40 sm:text-4xl"
          >
            VRK
          </div>
          <div className="flex flex-col gap-3 text-center lg:text-left">
            <div>
              <p className="font-display text-2xl font-medium">{founder.name}</p>
              <p className="text-accent-300 text-sm font-semibold tracking-[0.14em] uppercase">
                {founder.title}
              </p>
            </div>
            <p className="text-ink-muted leading-relaxed">{founder.bio}</p>
          </div>
        </Reveal>
      </Section>

      <Section
        tone="panel"
        width="wide"
        aria-labelledby="where-we-work"
        panelClassName="relative isolate"
      >
        <div
          aria-hidden="true"
          className="ambient-blob bg-accent-400/15 motion-safe:animate-drift-slow -top-16 -right-16 size-72"
        />
        <SectionHeading
          id="where-we-work"
          align="center"
          rule
          eyebrow="Coverage"
          title="Serving across"
          accent="Tamil Nadu"
          lead={coverage.wider}
        />
        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {coverage.primaryAreas.map((area, index) => (
            <Reveal key={area} as="li" delay={Math.min(index * 60, 240)}>
              <span className="border-accent-300/20 bg-surface hover:border-accent-300/50 hover:shadow-glow-sm inline-flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm transition-[border-color,box-shadow] duration-300">
                <IconChip tone="brand" size="sm">
                  <PinIcon className="size-3.5" />
                </IconChip>
                {area}
              </span>
            </Reveal>
          ))}
        </ul>
        <address className="text-ink-muted mx-auto mt-10 max-w-sm text-center text-sm leading-relaxed not-italic">
          {siteConfig.name}
          <br />
          {address.street}
          <br />
          {address.city}, {address.state} {address.postalCode}
        </address>
      </Section>

      <CtaBand />
    </div>
  );
}
