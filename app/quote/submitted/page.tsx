import type { Metadata } from 'next';
import { Hero } from '@/components/page';
import { ButtonLink, Section } from '@/components/ui';
import { routes, telHref, whatsAppHref } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Quote request received',
  description: 'Your quote request has reached VRK Decor.',
  path: '/quote/submitted',
  // A confirmation page has no value in search results and should never be a
  // landing page: arriving here directly would imply a request that never
  // happened.
  index: false,
});

/**
 * Confirmation after a successful submission.
 *
 * A separate page rather than an in-place message, so refreshing or going back
 * cannot resubmit the form (Technical Development Specification section 23 —
 * duplicate quote submission). It carries no enquiry identifier: there is
 * nothing here for anyone to look up, guess or share.
 *
 * `repeat=1` marks a request the duplicate window absorbed — the same details
 * sent twice within a few minutes. The customer is told the truth, that we
 * already have it, rather than being shown a second confirmation for a lead
 * that was deliberately not duplicated.
 */
export default async function QuoteSubmittedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const repeat = params.repeat === '1';

  return (
    <>
      <Hero
        compact
        eyebrow="Thank you"
        title={repeat ? 'We already have your request' : 'Your request has reached us'}
        lead={
          repeat
            ? 'It looks like this request was sent twice, so we have kept the first one. There is nothing more you need to do.'
            : 'Thank you — the VRK Decor team has your enquiry and will be in touch by phone or WhatsApp.'
        }
        actions={
          <>
            <ButtonLink href={whatsAppHref} variant="primary" size="lg">
              WhatsApp us now
            </ButtonLink>
            <ButtonLink href={telHref} variant="outline" size="lg">
              Call us
            </ButtonLink>
          </>
        }
      />

      <Section width="default" aria-labelledby="what-happens-next">
        <h2 id="what-happens-next" className="font-display text-2xl font-medium">
          What happens next
        </h2>
        <ol
          className="text-ink-muted mt-6 flex list-decimal flex-col gap-3 pl-5"
          data-testid="quote-next-steps"
        >
          <li>Our team reviews your date, venue and requirement.</li>
          <li>We call or message you on WhatsApp to talk through the details.</li>
          <li>
            You receive a quotation prepared for your event. Nothing is priced
            automatically — every design is quoted by our team.
          </li>
        </ol>

        {/*
          P7 adds the automatic customer confirmation email and the line that
          tells the customer to expect it. Nothing here claims an email has been
          sent, because in P6 none has.
        */}
        <p className="text-ink-muted mt-6 text-sm">
          In a hurry? WhatsApp or call us and we will pick it up straight away.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={routes.work} variant="outline" size="md">
            Keep browsing our work
          </ButtonLink>
          <ButtonLink href={routes.home} variant="ghost" size="md">
            Back to the home page
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
