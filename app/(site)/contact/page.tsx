import type { Metadata } from 'next';
import { CtaBand, Hero } from '@/components/page';
import {
  ButtonLink,
  Container,
  IconChip,
  Reveal,
  Section,
  SectionHeading,
} from '@/components/ui';
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/layout/icons';
import { coverage } from '@/lib/content';
import { mailHref, telHref, whatsAppHref } from '@/lib/navigation';
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
 * The approved reference design shows a set of hours; until VRK Decor confirms
 * them they would be an invented business fact, so the row is absent rather
 * than guessed.
 */
export default function ContactPage() {
  const { address, email } = siteConfig.contact;
  const displayPhone = '+91 99940 72435';

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Contact"
        title="Talk to the"
        accent="VRK Decor team"
        lead="Message us on WhatsApp or give us a call about your celebration, or send a quote request with your date, your venue and what you need."
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
        <div className="from-brand-800 via-surface-tint to-brand-950 border-accent-300/15 mx-auto w-full max-w-[86rem] rounded-3xl border bg-gradient-to-br">
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
                {[
                  {
                    icon: <PhoneIcon />,
                    title: 'Phone',
                    content: (
                      <a
                        className="text-accent-300 inline-flex min-h-9 items-center text-sm underline underline-offset-4"
                        href={telHref}
                      >
                        {displayPhone}
                      </a>
                    ),
                  },
                  {
                    icon: <WhatsAppIcon />,
                    title: 'WhatsApp',
                    content: (
                      <a
                        className="text-accent-300 inline-flex min-h-9 items-center text-sm underline underline-offset-4"
                        href={whatsAppHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Message us on WhatsApp
                      </a>
                    ),
                  },
                  {
                    icon: <MailIcon />,
                    title: 'Email',
                    content: (
                      <a
                        className="text-accent-300 inline-flex min-h-9 items-center text-sm break-all underline underline-offset-4"
                        href={mailHref}
                      >
                        {email}
                      </a>
                    ),
                  },
                  {
                    icon: <PinIcon />,
                    title: 'Studio',
                    content: (
                      <address className="text-ink-soft text-sm not-italic">
                        {address.street}
                        <br />
                        {address.city}, {address.state} {address.postalCode}
                      </address>
                    ),
                  },
                ].map((item, index) => (
                  <Reveal key={item.title} as="li" delay={Math.min(index * 70, 240)}>
                    <div className="bg-surface/80 border-accent-300/15 hover:border-accent-300/50 hover:shadow-card group flex h-full flex-col gap-2 rounded-2xl border p-5 transition-[border-color,box-shadow] duration-300">
                      <IconChip tone="brand" size="md">
                        {item.icon}
                      </IconChip>
                      <h3 className="font-display mt-1 text-lg font-medium">
                        {item.title}
                      </h3>
                      {item.content}
                    </div>
                  </Reveal>
                ))}
              </ul>

              <p className="text-ink-soft mt-8 text-sm">
                We work across {coverage.primaryAreas.join(', ')}. {coverage.wider}
              </p>
            </div>
          </Container>
        </div>
      </section>

      <Section tone="panel" width="wide" aria-labelledby="request-quote">
        <SectionHeading
          id="request-quote"
          eyebrow="Quotations"
          title="Ready to"
          accent="ask for a quote?"
          lead="Send us your date, your venue, your city and the services you need. If you add an email address you will get a confirmation straight away, and we will follow up on the phone or on WhatsApp."
        />
        <div className="mt-8">
          <ButtonLink href="/quote" variant="primary" size="lg">
            Get a Quote
          </ButtonLink>
        </div>
      </Section>

      <CtaBand />
    </div>
  );
}
