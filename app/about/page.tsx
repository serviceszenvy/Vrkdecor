import type { Metadata } from 'next';
import { CtaBand, Hero, StatList } from '@/components/page';
import { ButtonLink, Section, SectionHeading } from '@/components/ui';
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
 * About — Requirements sections 2, 3 and 18.
 * Every statement on this page restates an approved business fact. No history,
 * founder story, award or superlative is asserted, because none is approved.
 */
export default function AboutPage() {
  const { address } = siteConfig.contact;

  return (
    <>
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

      <Section spacing="compact" width="wide" aria-labelledby="figures">
        <h2 id="figures" className="sr-only">
          VRK Decor at a glance
        </h2>
        <StatList stats={credentials} />
      </Section>

      <Section tone="subtle" width="wide" aria-labelledby="what-we-do">
        <SectionHeading
          id="what-we-do"
          eyebrow="What we do"
          title="One team for the whole celebration"
          lead="VRK Decor designs and coordinates events end to end — stage and mandap, florals, entrance, furniture and seating, return gifts and complete event management."
        />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {whyChooseUs.map((point) => (
            <li key={point.title} className="flex flex-col gap-1.5">
              <h3 className="font-display text-xl font-medium">{point.title}</h3>
              <p className="text-ink-muted">{point.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section width="wide" aria-labelledby="where-we-work">
        <SectionHeading
          id="where-we-work"
          eyebrow="Coverage"
          title="Where we work"
          lead={coverage.wider}
        />
        <ul className="text-ink mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {coverage.primaryAreas.map((area) => (
            <li key={area} className="text-lg">
              {area}
            </li>
          ))}
        </ul>
        <address className="text-ink-muted mt-8 text-sm not-italic">
          {siteConfig.name}
          <br />
          {address.street}
          <br />
          {address.city}, {address.state} {address.postalCode}
        </address>
      </Section>

      <CtaBand />
    </>
  );
}
