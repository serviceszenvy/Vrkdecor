import type { Metadata } from 'next';
import { Hero, ServiceArea } from '@/components/page';
import { Reveal, Section } from '@/components/ui';
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/layout/icons';
import {
  EnquiryOptions,
  LocalStoreNotice,
  QuoteForm,
} from '@/features/enquiries/components';
import { isUsingLocalEnquiryStore } from '@/features/enquiries';
import {
  designEnquiryMessage,
  mailHref,
  telHref,
  whatsAppHref,
  whatsAppHrefWithMessage,
} from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import {
  MAX_EVENT_YEARS_AHEAD,
  todayInBusinessTimezone,
} from '@/lib/validation/enquiry';

/**
 * Rendered per request, like `/quote`: the form's date bounds are computed
 * from today in the business timezone, and a page built once at deploy time
 * would carry a stale "today" until the next deployment.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Call or WhatsApp VRK Decor on +91 99940 72435, email vrk.groups@gmail.com or send a short enquiry. Based at 301 M.S Road, Vettunimadam, Nagercoil, Tamil Nadu 629003.',
  path: '/contact',
});

/**
 * Contact — Requirements sections 2 and 12, simplified by the refinement brief
 * (section 12).
 *
 * One enquiry experience rather than two: "Let's plan your celebration", the
 * three ways to reach the team (WhatsApp, a call, the short form), the studio
 * details, and where we work. The form on this page is the same quote engine
 * as `/quote`, with the same server-side validation and rate limiting, so a
 * general enquiry from here lands in the same Admin Panel inbox.
 *
 * No opening hours are shown because none are approved in the requirements.
 */
export default function ContactPage() {
  const { address, email } = siteConfig.contact;
  const displayPhone = '+91 99940 72435';
  const today = todayInBusinessTimezone();
  const maxEventDate = `${Number(today.slice(0, 4)) + MAX_EVENT_YEARS_AHEAD}${today.slice(4)}`;

  return (
    <div className="flex flex-col gap-3 pb-3 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Contact"
        title="Let's plan"
        accent="your celebration"
        lead="Tell us the occasion, the date and where it is, and we will take it from there. Message us, call us or send the short enquiry below."
      />

      <Section tone="panel" width="wide" aria-labelledby="enquiry-options">
        <div className="flex flex-col gap-6 sm:gap-8">
          {isUsingLocalEnquiryStore() ? <LocalStoreNotice /> : null}
          <EnquiryOptions
            whatsAppHref={whatsAppHrefWithMessage(designEnquiryMessage())}
            formHref="#enquiry-form"
            heading="Three ways to reach us"
            lead="Choose whichever works best for you. Any one of them reaches the same team, and nobody is asked to do all three."
          />
        </div>
      </Section>

      <Section tone="panel-bloom" width="wide" aria-labelledby="contact-details">
        <Reveal>
          <h2
            id="contact-details"
            className="text-brand-800 text-2xs font-semibold tracking-[0.22em] uppercase"
          >
            The studio
          </h2>
        </Reveal>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              key: 'phone',
              title: 'Phone',
              icon: PhoneIcon,
              content: (
                <a
                  className="text-brand-900 hover:text-brand-700 inline-flex min-h-11 items-center text-sm font-medium"
                  href={telHref}
                >
                  {displayPhone}
                </a>
              ),
            },
            {
              key: 'whatsapp',
              title: 'WhatsApp',
              icon: WhatsAppIcon,
              content: (
                <a
                  className="text-brand-900 hover:text-brand-700 inline-flex min-h-11 items-center text-sm font-medium"
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message us on WhatsApp
                </a>
              ),
            },
            {
              key: 'email',
              title: 'Email',
              icon: MailIcon,
              content: (
                <a
                  className="text-brand-900 hover:text-brand-700 inline-flex min-h-11 items-center text-sm font-medium break-all"
                  href={mailHref}
                >
                  {email}
                </a>
              ),
            },
            {
              key: 'studio',
              title: 'Visit us',
              icon: PinIcon,
              content: (
                <address className="text-ink-soft text-sm not-italic">
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </address>
              ),
            },
          ].map((item, index) => {
            const ItemIcon = item.icon;
            return (
              <Reveal
                as="li"
                key={item.key}
                delay={index * 90}
                effect="scale"
                className="group border-brand-200/70 lift shine press shadow-card flex gap-3.5 rounded-2xl border bg-white/90 p-4 sm:gap-4 sm:p-5"
              >
                <span className="icon-deep size-12 shrink-0">
                  <ItemIcon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-lg font-medium">{item.title}</span>
                  {item.content}
                </span>
              </Reveal>
            );
          })}
        </ul>
      </Section>

      <ServiceArea tone="deep" action="about" id="where-we-create" />

      <Section
        tone="panel"
        width="default"
        aria-labelledby="quote-form-heading"
        id="enquiry-form"
      >
        <Reveal>
          <QuoteForm
            design={null}
            photo={null}
            today={today}
            maxEventDate={maxEventDate}
            heading="Tell us about your celebration"
          />
        </Reveal>
      </Section>
    </div>
  );
}
