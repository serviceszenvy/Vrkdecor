import type { Metadata } from 'next';
import { Hero } from '@/components/page';
import { ButtonLink, Section } from '@/components/ui';
import {
  CapturedDesign,
  LocalStoreNotice,
  QuoteForm,
  UnavailableDesignNotice,
} from '@/features/enquiries/components';
import { designHref } from '@/features/portfolio';
import { isUsingLocalEnquiryStore, resolveQuoteContext } from '@/features/enquiries';
import {
  designEnquiryMessage,
  telHref,
  whatsAppHrefWithMessage,
} from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
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
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Get a Quote"
        title={
          context.design
            ? `Request a quote for ${context.design.name}`
            : 'Request a quotation'
        }
        lead="Tell us the date, the venue and what you have in mind. We will come back to you on the phone or on WhatsApp."
        actions={
          <>
            <ButtonLink
              href={whatsAppHrefWithMessage(
                designEnquiryMessage(
                  context.design?.name,
                  context.design ? `${siteConfig.url}${designHref(context.design.slug)}` : null,
                ),
              )}
              variant="outline"
              size="md"
              data-testid="quote-whatsapp-continuation"
            >
              Prefer WhatsApp?
            </ButtonLink>
            <ButtonLink href={telHref} variant="ghost" size="md">
              Or call us
            </ButtonLink>
          </>
        }
      />

      <Section tone="panel" width="default" aria-labelledby="quote-form-heading">
        <h2 id="quote-form-heading" className="font-display text-2xl font-medium sm:text-3xl">
          Tell us about your celebration
        </h2>

        <div className="mt-8 flex flex-col gap-6">
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
    </div>
  );
}

/** Query parameters can repeat; take the first value and ignore the rest. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
