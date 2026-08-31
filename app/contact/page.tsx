import type { Metadata } from 'next';
import { Hero } from '@/components/page';
import {
  ButtonLink,
  Card,
  CardBody,
  CardTitle,
  Section,
  SectionHeading,
} from '@/components/ui';
import { coverage } from '@/lib/content';
import { mailHref, routes, telHref, whatsAppHref } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Call or WhatsApp VRK Decor on +91 99940 72435, or email vrk.groups@gmail.com. Based at 301 M.S Road, Vettunimadam, Nagercoil, Tamil Nadu 629003.',
  path: '/contact',
});

/**
 * Contact — Requirements sections 2 and 12.
 *
 * WhatsApp click-to-chat is the primary direct communication path, with a phone
 * CTA alongside it. The enquiry form itself is the quote engine, implemented in
 * P6 with server-side validation and rate limiting; this page links to it
 * rather than shipping an unvalidated form.
 *
 * No opening hours are shown because none are approved in the requirements.
 */
export default function ContactPage() {
  const { address, email } = siteConfig.contact;
  const displayPhone = '+91 99940 72435';

  return (
    <>
      <Hero
        compact
        eyebrow="Contact"
        title="Talk to the VRK Decor team"
        lead="WhatsApp or call us about your celebration, or send a quote request with your date, venue and requirement."
        actions={
          <>
            <ButtonLink href={whatsAppHref} variant="primary" size="lg">
              WhatsApp us
            </ButtonLink>
            <ButtonLink href={telHref} variant="outline" size="lg">
              Call {displayPhone}
            </ButtonLink>
          </>
        }
      />

      <Section width="wide" aria-labelledby="contact-details">
        <SectionHeading
          id="contact-details"
          eyebrow="Details"
          title="How to reach us"
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardBody>
              <CardTitle as="h3">Phone &amp; WhatsApp</CardTitle>
              <a
                className="text-brand-700 inline-flex min-h-9 items-center underline underline-offset-4"
                href={telHref}
              >
                {displayPhone}
              </a>
              <a
                className="text-brand-700 inline-flex min-h-9 items-center underline underline-offset-4"
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message us on WhatsApp
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle as="h3">Email</CardTitle>
              <a
                className="text-brand-700 inline-flex min-h-9 items-center break-all underline underline-offset-4"
                href={mailHref}
              >
                {email}
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle as="h3">Studio</CardTitle>
              <address className="text-ink-muted text-sm not-italic">
                {address.street}
                <br />
                {address.city}, {address.state} {address.postalCode}
              </address>
            </CardBody>
          </Card>
        </div>

        <p className="text-ink-muted mt-8 text-sm">
          Serving {coverage.primaryAreas.join(', ')}. {coverage.wider}
        </p>
      </Section>

      <Section tone="subtle" width="wide" aria-labelledby="request-quote">
        <SectionHeading
          id="request-quote"
          eyebrow="Quotations"
          title="Request a quotation"
          lead="Send your date, venue, city and the services you need. If you include an email address you will receive a confirmation, and the team will follow up by phone or WhatsApp."
        />
        <div className="mt-8">
          <ButtonLink href={routes.quote} variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
