import type { Metadata } from 'next';
import { Hero } from '@/components/page';
import { ButtonLink, Section } from '@/components/ui';
import {
  CapturedDesign,
  LocalStoreNotice,
  QuoteForm,
  UnavailableDesignNotice,
} from '@/features/enquiries/components';
import { isUsingLocalEnquiryStore, resolveQuoteContext } from '@/features/enquiries';
import { telHref, whatsAppHref } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import {
  MAX_EVENT_YEARS_AHEAD,
  todayInBusinessTimezone,
} from '@/lib/validation/enquiry';

export const metadata: Metadata = pageMetadata({
  title: 'Get a Quote',
  description:
    'Request a quotation from VRK Decor. Tell us your event date, venue, city and the services you need, and the team will follow up by phone or WhatsApp.',
  path: '/quote',
});

/**
 * Quote request — Requirements section 11.
 *
 * The page is reached three ways, and all three are the same page:
 *   /quote                                  general enquiry
 *   /quote?design=<slug>                    from a Design's "Get Quote" button
 *   /quote?design=<slug>&photo=<image id>   from a photograph in the lightbox
 *
 * In the last two the parent Design is captured automatically. It is resolved
 * server-side, verified to be published, and shown to the customer read-only —
 * there is no control anywhere on this page that lets them select a Design, and
 * the same resolution runs again when the form is submitted.
 *
 * The route is dynamic because it reads query parameters, which is also why the
 * captured Design is always current: an unpublished Design stops being
 * attachable the moment it is unpublished.
 */
export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const context = await resolveQuoteContext({
    design: first(params.design),
    photo: first(params.photo),
  });

  const today = todayInBusinessTimezone();
  const maxEventDate = `${Number(today.slice(0, 4)) + MAX_EVENT_YEARS_AHEAD}${today.slice(4)}`;

  return (
    <>
      <Hero
        compact
        eyebrow="Get a Quote"
        title={
          context.design
            ? `Request a quote for ${context.design.name}`
            : 'Request a quotation'
        }
        lead="Tell us the date, the venue and what you need. We will come back to you by phone or WhatsApp — usually the same day."
        actions={
          <>
            <ButtonLink href={whatsAppHref} variant="outline" size="md">
              Prefer WhatsApp?
            </ButtonLink>
            <ButtonLink href={telHref} variant="ghost" size="md">
              Or call us
            </ButtonLink>
          </>
        }
      />

      <Section width="default" aria-labelledby="quote-form-heading">
        <h2 id="quote-form-heading" className="sr-only">
          Quote request form
        </h2>

        <div className="flex flex-col gap-6">
          {isUsingLocalEnquiryStore() ? <LocalStoreNotice /> : null}
          {context.requestedDesignUnavailable ? <UnavailableDesignNotice /> : null}
          {context.design ? (
            <CapturedDesign
              design={context.design}
              fromPhoto={context.photo !== null}
            />
          ) : null}

          <QuoteForm
            design={context.design}
            photo={context.photo}
            today={today}
            maxEventDate={maxEventDate}
          />
        </div>
      </Section>
    </>
  );
}

/** Query parameters can repeat; take the first value and ignore the rest. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
