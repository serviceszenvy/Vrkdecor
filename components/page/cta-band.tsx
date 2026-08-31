import { ButtonLink, Section, SectionHeading } from '@/components/ui';
import { routes, telHref, whatsAppHref } from '@/lib/navigation';

/**
 * Closing call to action. Requirements section 7 requires a final CTA on the
 * Home page; the same band closes the other public pages so the primary action
 * is always reachable.
 */
export function CtaBand({
  title = 'Planning a celebration?',
  lead = 'Tell us your date, venue and requirement. The VRK Decor team will get back to you by phone or WhatsApp.',
}: {
  title?: string;
  lead?: string;
}) {
  return (
    <Section tone="inverse" spacing="default" width="wide" aria-labelledby="final-cta">
      <SectionHeading
        id="final-cta"
        tone="inverse"
        eyebrow="Get in touch"
        title={title}
        lead={lead}
      />
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={routes.quote} variant="accent" size="lg">
          Get a Quote
        </ButtonLink>
        <ButtonLink href={whatsAppHref} variant="inverse" size="lg">
          WhatsApp us
        </ButtonLink>
        <ButtonLink href={telHref} variant="inverse" size="lg">
          Call us
        </ButtonLink>
      </div>
    </Section>
  );
}
