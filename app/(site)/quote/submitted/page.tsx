import type { Metadata } from 'next';
import { Hero } from '@/components/page';
import { ButtonLink, Section } from '@/components/ui';
import { resolveQuoteContext } from '@/features/enquiries';
import {
  enquiryContinuationMessage,
  routes,
  telHref,
  whatsAppHrefWithMessage,
} from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

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
 * duplicate quote submission).
 *
 * It carries no enquiry identifier and no customer detail. Everything it reads
 * from the URL is either a flag or a PUBLISHED design slug, which is public
 * content, so there is nothing here to look up, guess, share or leak:
 *
 *   repeat=1        the duplicate window absorbed this request
 *   design=<slug>   the design the enquiry was about, used to write the
 *                   customer's WhatsApp message for them
 *   email=sent      the confirmation email was accepted by the provider
 *   images=partial  the enquiry arrived but an attachment did not
 *
 * The email line is shown ONLY when a message was actually accepted. A page
 * that promises an email nobody sent is worse than a page that promises
 * nothing, so a failed or unconfigured send says nothing at all and the
 * customer is still called and messaged on WhatsApp exactly as before.
 */
export default async function QuoteSubmittedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const repeat = first(params.repeat) === '1';
  const emailSent = first(params.email) === 'sent';
  const imagesIncomplete = first(params.images) === 'partial';

  // Resolved through the same published-only reader the quote page uses, so an
  // invented or unpublished slug simply yields no design name.
  const context = await resolveQuoteContext({ design: first(params.design) });
  const designName = context.design?.name ?? null;

  const whatsAppContinue = whatsAppHrefWithMessage(
    enquiryContinuationMessage(designName),
  );

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Thank you"
        title={repeat ? 'We already have your request' : 'Your request has reached us'}
        lead={
          repeat
            ? 'It looks like this request was sent twice, so we have kept the first one. There is nothing more you need to do.'
            : 'Thank you. We have your enquiry and will be in touch on the phone or on WhatsApp.'
        }
        actions={
          <>
            <ButtonLink
              href={whatsAppContinue}
              variant="primary"
              size="lg"
              data-testid="continue-whatsapp"
            >
              Continue on WhatsApp
            </ButtonLink>
            <ButtonLink
              href={telHref}
              variant="outline"
              size="lg"
              data-testid="continue-call"
            >
              Call {siteConfig.contact.phone}
            </ButtonLink>
          </>
        }
      />

      <Section tone="panel" width="default" aria-labelledby="what-happens-next">
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
            automatically, every design is quoted by our team.
          </li>
        </ol>

        {emailSent ? (
          <p
            className="text-ink-muted mt-6 text-sm"
            data-testid="confirmation-email-sent"
          >
            We have emailed you a copy of this request. If it is not in your inbox in a
            few minutes, please check your spam folder.
          </p>
        ) : null}

        {imagesIncomplete ? (
          <p
            className="mt-6 text-sm text-red-800"
            data-testid="reference-images-partial"
          >
            Your enquiry reached us, but one or more of your inspiration images did not
            upload. There is no need to send the form again. Send the pictures to us on
            WhatsApp instead and we will add them to your enquiry.
          </p>
        ) : null}

        {designName ? (
          <p className="text-ink-muted mt-6 text-sm" data-testid="continuation-design">
            Your request is for <strong className="font-medium">{designName}</strong>,
            so you never have to describe it again.
          </p>
        ) : null}

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
    </div>
  );
}

/** Query parameters can repeat; take the first value and ignore the rest. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
