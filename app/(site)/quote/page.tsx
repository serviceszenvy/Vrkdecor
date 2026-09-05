import type { Metadata } from 'next';
import { Hero } from '@/components/page';
import { Reveal, Section } from '@/components/ui';
import {
  CapturedDesign,
  EnquiryOptions,
  LocalStoreNotice,
  QuoteForm,
  UnavailableDesignNotice,
} from '@/features/enquiries/components';
import { isUsingLocalEnquiryStore, resolveQuoteContext } from '@/features/enquiries';
import {
  absoluteDesignUrl,
  designEnquiryMessage,
  whatsAppHrefWithMessage,
} from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import {
  MAX_EVENT_YEARS_AHEAD,
  todayInBusinessTimezone,
} from '@/lib/validation/enquiry';

export const metadata: Metadata = pageMetadata({
  title: 'Get a Quote',
  description:
    'Request a quotation from VRK Decor on WhatsApp, by phone or with a short enquiry form. Tell us your occasion, date and location and the team will follow up.',
  path: '/quote',
});

/**
 * Get a Quote — Requirements section 11, simplified by the refinement brief
 * (sections 8, 9 and 10).
 *
 * The page is reached three ways, and all three are the same page:
 *   /quote                                  general enquiry
 *   /quote?design=<slug>                    from a Design's "Get Quote" button
 *   /quote?design=<slug>&photo=<image id>   from a photograph in the lightbox
 *
 * In the last two the parent Design is captured automatically. It is resolved
 * server-side, verified to be published, and shown to the customer read-only
 * with the very photograph they clicked — there is no control anywhere on this
 * page that lets them select a Design, and the same resolution runs again when
 * the form is submitted.
 *
 * Below the captured design are the three ways to enquire, as alternatives:
 * WhatsApp (with the design's name and page URL already in the message), a
 * phone call, or the short form further down.
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

  const whatsAppHref = whatsAppHrefWithMessage(
    designEnquiryMessage(
      context.design?.name,
      context.design ? absoluteDesignUrl(context.design.slug) : null,
    ),
  );

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
        lead={
          context.design
            ? 'The design you picked is attached below. Message us, call us or send the short form, whichever suits you.'
            : 'Tell us the occasion, the date and where it is. Message us, call us or send the short form, whichever suits you.'
        }
      />

      <Section tone="panel" width="default" aria-labelledby="enquiry-options">
        <div className="flex flex-col gap-8">
          {isUsingLocalEnquiryStore() ? <LocalStoreNotice /> : null}
          {context.requestedDesignUnavailable ? <UnavailableDesignNotice /> : null}
          {context.design ? (
            <Reveal effect="scale">
              <CapturedDesign
                design={context.design}
                fromPhoto={context.photo !== null}
              />
            </Reveal>
          ) : null}

          <EnquiryOptions whatsAppHref={whatsAppHref} formHref="#enquiry-form" />
        </div>
      </Section>

      <Section
        tone="panel-bloom"
        width="default"
        aria-labelledby="quote-form-heading"
        id="enquiry-form"
      >
        <Reveal>
          <QuoteForm
            design={context.design}
            photo={context.photo}
            today={today}
            maxEventDate={maxEventDate}
          />
        </Reveal>
      </Section>
    </div>
  );
}

/** Query parameters can repeat; take the first value and ignore the rest. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
