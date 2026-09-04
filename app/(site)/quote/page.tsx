import type { Metadata } from 'next';
import { Hero } from '@/components/page';
import { GlassPanel, IconChip, Section } from '@/components/ui';
import { PhoneIcon, SendIcon, WhatsAppIcon } from '@/components/layout/icons';
import {
  CapturedDesign,
  LocalStoreNotice,
  QuoteForm,
  UnavailableDesignNotice,
} from '@/features/enquiries/components';
import { isUsingLocalEnquiryStore, resolveQuoteContext } from '@/features/enquiries';
import {
  designEnquiryMessage,
  telHref,
  whatsAppHrefWithMessage,
} from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';
import { pageMetadata } from '@/lib/seo';
import {
  MAX_EVENT_YEARS_AHEAD,
  todayInBusinessTimezone,
} from '@/lib/validation/enquiry';

export const metadata: Metadata = pageMetadata({
  title: 'Get a Quote',
  description:
    'Request a quotation from VRK Decor on WhatsApp, by phone, or with a short form. Tell us your event date, venue and what you need, and the team will follow up.',
  path: '/quote',
});

/**
 * Quote request — Requirements section 11; redesign brief section 9.
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
 * REDESIGN — three equal, alternative ways to reach VRK Decor, not three steps
 * of one flow: WhatsApp and Call are immediate off-site actions; "Send an
 * Enquiry" scrolls to the same form that always lived on this page, now framed
 * as one option among three rather than the only path. Nothing about the form
 * itself, its validation or its Server Action changed — only how the page
 * introduces it.
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
  const whatsAppQuoteHref = whatsAppHrefWithMessage(
    designEnquiryMessage(context.design?.name, context.design?.slug),
  );

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Get a Quote"
        title={
          context.design
            ? `Request a quote for ${context.design.name}`
            : 'Three ways to reach'
        }
        accent={context.design ? undefined : 'VRK Decor'}
        lead="Choose whichever works best for you — WhatsApp, a call, or a short form. We never calculate a final price automatically; every celebration is priced by our team."
      />

      <Section tone="panel" width="wide" aria-labelledby="quote-options">
        <h2 id="quote-options" className="sr-only">
          Ways to request a quote
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <OptionCard
            icon={<WhatsAppIcon className="size-6" />}
            title="Chat on WhatsApp"
            body="The fastest way to reach us. We reply personally, usually within the day."
            href={whatsAppQuoteHref}
            cta="Chat on WhatsApp"
            external
            testId="quote-option-whatsapp"
          />
          <OptionCard
            icon={<PhoneIcon className="size-6" />}
            title="Call Us"
            body={`Prefer to talk it through? Call ${siteConfig.contact.phone}.`}
            href={telHref}
            cta="Call Us"
            testId="quote-option-call"
          />
          <OptionCard
            icon={<SendIcon className="size-6" />}
            title="Send an Enquiry"
            body="Tell us the details in a short form and we will follow up by phone or WhatsApp."
            href="#quote-form"
            cta="Fill the Form"
            testId="quote-option-form"
          />
        </div>
      </Section>

      <Section tone="panel" width="default" aria-labelledby="quote-form-heading">
        <h2
          id="quote-form-heading"
          className="font-display mb-6 text-2xl font-medium sm:text-3xl"
        >
          Tell us about your celebration
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
    </div>
  );
}

/**
 * One of the three equal-weight contact options.
 *
 * A `GlassPanel` rather than an opaque `Card`, on purpose: this is the first
 * decision a visitor makes on the page, so it should feel like it is floating
 * above the dark ground rather than one more solid block among many.
 */
function OptionCard({
  icon,
  title,
  body,
  href,
  cta,
  external = false,
  testId,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  cta: string;
  external?: boolean;
  testId?: string;
}) {
  const isHttp = href.startsWith('http') || href.startsWith('tel:');
  return (
    <GlassPanel
      tone="default"
      radius="2xl"
      as="div"
      className="motion-safe:hover:-translate-y-1 flex flex-col gap-3 p-5 transition-transform duration-300 sm:p-6"
    >
      <IconChip tone="brand" size="lg">
        {icon}
      </IconChip>
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <p className="text-ink-soft flex-1 text-sm leading-relaxed">{body}</p>
      <a
        href={href}
        data-testid={testId}
        {...(external || isHttp
          ? { target: href.startsWith('http') ? '_blank' : undefined, rel: 'noopener noreferrer' }
          : {})}
        className="bg-accent-500 text-ink-inverse hover:bg-accent-600 mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-medium transition-colors"
      >
        {cta}
      </a>
    </GlassPanel>
  );
}

/** Query parameters can repeat; take the first value and ignore the rest. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
