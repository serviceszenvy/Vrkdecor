import { ButtonLink, Section, SectionHeading } from '@/components/ui';
import { routes } from '@/lib/navigation';

export default function NotFound() {
  return (
    <Section spacing="spacious" width="wide">
      <SectionHeading
        level={1}
        eyebrow="404"
        title="Page not found"
        lead="The page you are looking for does not exist or is no longer available."
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
  );
}
