import type { Metadata } from 'next';
import {
  CtaBand,
  FounderSection,
  Hero,
  ServiceAreaBand,
  StatList,
} from '@/components/page';
import { ButtonLink, Section, SectionHeading } from '@/components/ui';
import { credentials, positioning, whyChooseUs } from '@/lib/content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  description:
    'VRK Decor is an event design and coordination brand based in Nagercoil with 14+ years of experience, 600+ events delivered and a team of 35+, led by Founder & CEO V. Raja Kumerasen.',
  path: '/about',
});

/**
 * About — Requirements sections 2, 3 and 18; redesign brief sections 13–16.
 *
 * Every business fact restated here (years, events, team size, coverage) is
 * the same approved figure `lib/content/business.ts` has always used — this
 * page's editorial layout changed, not its facts. The Founder & CEO section
 * and its copy come from `lib/content/founder.ts`, which the redesign brief
 * itself supplied verbatim; nothing there is invented. Service-area content,
 * previously one quiet line at the foot of the Home page, is now its own
 * section here (`ServiceAreaBand`).
 */
export default function AboutPage() {
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

      <Section tone="panel" width="wide" aria-labelledby="founder">
        <SectionHeading
          id="founder"
          eyebrow="Leadership"
          title="A vision behind"
          accent="every celebration"
        />
        <div className="mt-10">
          <FounderSection />
        </div>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="what-we-do">
        <SectionHeading
          id="what-we-do"
          eyebrow="Our approach"
          title="One team for the"
          accent="whole celebration"
          lead="We design and run events from end to end. Stage and mandap, florals, entrance, furniture and seating, return gifts and full event management, all handled by the same people."
        />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {whyChooseUs.map((point, index) => (
            <li
              key={point.title}
              className={`border-line-soft bg-surface/60 motion-safe:hover:-translate-y-1 animate-fade-up stagger-${Math.min((index % 4) + 1, 4)} flex flex-col gap-1.5 rounded-2xl border p-5 transition-transform duration-300`}
            >
              <h3 className="font-display text-xl font-medium">{point.title}</h3>
              <p className="text-ink-muted">{point.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <ServiceAreaBand />

      <CtaBand />
    </div>
  );
}
