import type { Metadata } from 'next';
import { Hero } from '@/components/page';
import {
  ButtonLink,
  Container,
  IconChip,
  Section,
  SectionHeading,
} from '@/components/ui';
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/layout/icons';
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
 * Contact — Requirements sections 2 and 12; redesign brief section 12.
 *
 * The brief flags "Quotations" and "Let us plan it together" as redundant —
 * this page previously carried both a dedicated quote section AND a closing
 * CtaBand, each with their own "Get a Quote" button. They are combined here
 * into a single closing section with exactly one quote CTA, so the page reads
 * as one clear enquiry experience rather than three separate ones stacked on
 * top of each other.
 *
 * No opening hours are shown because none are approved in the requirements.
 */
export default function ContactPage() {
  const { address, email } = siteConfig.contact;
  const displayPhone = '+91 99940 72435';

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Contact"
        title="Let's plan your"
        accent="celebration"
        lead="Message us on WhatsApp, give us a call, or send a short enquiry with your date and what you have in mind."
        actions={
          <>
            <ButtonLink href={whatsAppHref} variant="primary" size="lg">
              <WhatsAppIcon className="size-4" />
              WhatsApp us
            </ButtonLink>
            <ButtonLink href={telHref} variant="glass" size="lg">
              <PhoneIcon className="size-4" />
              Call {displayPhone}
            </ButtonLink>
          </>
        }
      />

      <section className="px-3 sm:px-5 lg:px-6" aria-labelledby="contact-details">
        <div className="from-surface-tint via-canvas-deep to-accent-500/10 border-accent-400/20 mx-auto w-full max-w-[86rem] rounded-3xl border bg-gradient-to-br">
          <Container width="wide">
            <div className="py-12 sm:py-16">
              <SectionHeading
                id="contact-details"
                align="center"
                rule
                tone="tint"
                title="How to"
                accent="reach us"
              />

              <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <li className="bg-surface/70 border-line-soft motion-safe:hover:-translate-y-1 flex flex-col gap-2 rounded-2xl border p-5 transition-transform duration-300">
                  <IconChip tone="brand" size="md">
                    <PhoneIcon />
                  </IconChip>
                  <h3 className="font-display mt-1 text-lg font-medium">Phone</h3>
                  <a
                    className="text-accent-300 inline-flex min-h-9 items-center text-sm underline underline-offset-4"
                    href={telHref}
                  >
                    {displayPhone}
                  </a>
                </li>

                <li className="bg-surface/70 border-line-soft motion-safe:hover:-translate-y-1 flex flex-col gap-2 rounded-2xl border p-5 transition-transform duration-300">
                  <IconChip tone="brand" size="md">
                    <WhatsAppIcon />
                  </IconChip>
                  <h3 className="font-display mt-1 text-lg font-medium">WhatsApp</h3>
                  <a
                    className="text-accent-300 inline-flex min-h-9 items-center text-sm underline underline-offset-4"
                    href={whatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Message us on WhatsApp
                  </a>
                </li>

                <li className="bg-surface/70 border-line-soft motion-safe:hover:-translate-y-1 flex flex-col gap-2 rounded-2xl border p-5 transition-transform duration-300">
                  <IconChip tone="brand" size="md">
                    <MailIcon />
                  </IconChip>
                  <h3 className="font-display mt-1 text-lg font-medium">Email</h3>
                  <a
                    className="text-accent-300 inline-flex min-h-9 items-center text-sm break-all underline underline-offset-4"
                    href={mailHref}
                  >
                    {email}
                  </a>
                </li>

                <li className="bg-surface/70 border-line-soft motion-safe:hover:-translate-y-1 flex flex-col gap-2 rounded-2xl border p-5 transition-transform duration-300">
                  <IconChip tone="brand" size="md">
                    <PinIcon />
                  </IconChip>
                  <h3 className="font-display mt-1 text-lg font-medium">Studio</h3>
                  <address className="text-ink-soft text-sm not-italic">
                    {address.street}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                  </address>
                </li>
              </ul>

              <p className="text-ink-soft mt-8 text-sm">
                We work across {coverage.primaryAreas.join(', ')}. {coverage.wider}
              </p>
            </div>
          </Container>
        </div>
      </section>

      <Section tone="panel" width="wide" spacing="spacious" aria-labelledby="request-quote">
        <SectionHeading
          align="center"
          rule
          id="request-quote"
          eyebrow="Ready when you are"
          title="Send us your date and"
          accent="what you have in mind"
          lead="One short form — your event date, venue and city — and we will follow up on the phone or on WhatsApp. If you add an email address you will get a confirmation straight away."
        />
        <div className="mt-8 flex justify-center">
          <ButtonLink href={routes.quote} variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        </div>
      </Section>
    </div>
  );
}
