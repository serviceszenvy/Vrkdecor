import { SiteChrome } from '@/components/layout';
import { ButtonLink, Section, SectionHeading } from '@/components/ui';
import { routes } from '@/lib/navigation';

/**
 * The global 404.
 *
 * Next.js renders this directly inside the ROOT layout for an unmatched URL, so
 * it cannot inherit `app/(site)/layout.tsx` and renders the public chrome
 * itself. A visitor who mistypes a URL still gets the header, the footer and a
 * way back.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <Section tone="canvas" spacing="spacious" width="wide" className="pt-32">
        <SectionHeading
          level={1}
          eyebrow="404"
          title="Page not found"
          lead="This page does not exist or is no longer available. Head back to the home page, or tell us what you were looking for."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={routes.home} variant="primary" size="md">
            Return home
          </ButtonLink>
          <ButtonLink href={routes.contact} variant="outline" size="md">
            Contact us
          </ButtonLink>
        </div>
      </Section>
    </SiteChrome>
  );
}
