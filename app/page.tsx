import { ButtonLink, Section, SectionHeading } from '@/components/ui';
import { routes } from '@/lib/navigation';

/**
 * P2 shell placeholder.
 *
 * The real Home page — hero, featured occasions and designs, services overview,
 * how it works, testimonials and social showcase — is implemented in P4
 * (`05_PROMPTS/04-PUBLIC-WEBSITE.md`) on top of these design-system primitives.
 */
export default function HomePage() {
  return (
    <Section spacing="spacious" width="wide">
      <SectionHeading
        level={1}
        eyebrow="Premium event design"
        title="Complete celebration solutions across Tamil Nadu"
        lead="The design system and application shell are in place. Page content is implemented in the next approved build phase."
      />
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={routes.work} variant="primary" size="lg">
          Explore Our Work
        </ButtonLink>
        <ButtonLink href={routes.quote} variant="outline" size="lg">
          Get a Quote
        </ButtonLink>
      </div>
    </Section>
  );
}
