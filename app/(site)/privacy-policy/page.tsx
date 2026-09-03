import type { Metadata } from 'next';
import { DraftNotice, Hero } from '@/components/page';
import { Section } from '@/components/ui';
import { mailHref } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How VRK Decor collects, uses and protects the information you provide through this website.',
  path: '/privacy-policy',
});

/**
 * Privacy Policy — required by Requirements section 21.
 *
 * Every statement describes what this application actually does, as built in
 * P3: what the enquiry form stores, that reference images are private, and who
 * can access them. Nothing is asserted about practices outside the website.
 *
 * Items that are still open decisions — notably the retention period — say so
 * rather than stating an invented figure. The page is marked as a draft because
 * legal wording must be reviewed and approved by VRK Decor before launch.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero compact eyebrow="Legal" title="Privacy Policy" />

      <Section tone="panel" width="default" aria-labelledby="privacy">
        <h2 id="privacy" className="sr-only">
          Privacy Policy
        </h2>

        <DraftNotice>
          This policy has been drafted from the website&rsquo;s actual data handling and
          must be reviewed and approved by {siteConfig.name} before launch.
        </DraftNotice>

        <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed">
          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">What we collect</h3>
            <p className="text-ink-muted">
              When you send a quote request we collect the details you enter: your name,
              phone number, event type, city and consent, plus any optional details you
              choose to add such as your email address, event date, venue, guest count,
              budget note, required services and other notes. If you attach inspiration
              images, we store those too.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">How we use it</h3>
            <p className="text-ink-muted">
              We use your details only to respond to your enquiry and to plan and
              deliver your celebration. If you provide an email address you will receive
              an automatic confirmation that we have received your request. Our team
              then follows up by phone or WhatsApp.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">
              Your inspiration images
            </h3>
            <p className="text-ink-muted">
              Images you attach to an enquiry are stored privately. They are never
              published on this website, never shown in our portfolio and are not
              publicly accessible. Only authorised {siteConfig.name} staff can view
              them, through short-lived private links.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">
              Who can see your details
            </h3>
            <p className="text-ink-muted">
              Enquiries are visible only to authorised {siteConfig.name} staff signed in
              to our internal admin area. We do not sell your details, and we do not
              share them for advertising. Where a specialist service is delivered with a
              partner vendor, we share only what that vendor needs to fulfil your
              booking.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">How long we keep it</h3>
            <p className="text-ink-muted">
              We keep enquiry details and attached images for as long as we need them to
              respond to you and to deliver your event. A specific retention period is
              being confirmed and will be stated here before launch.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">Analytics</h3>
            <p className="text-ink-muted">
              We use website analytics to understand which pages and designs people find
              useful. Details of the analytics provider and any cookie notice will be
              confirmed here before launch.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">Contact us</h3>
            <p className="text-ink-muted">
              To ask about your details, or to ask us to delete them, email{' '}
              <a
                className="text-brand-700 underline underline-offset-4"
                href={mailHref}
              >
                {siteConfig.contact.email}
              </a>{' '}
              or write to us at {siteConfig.contact.address.street},{' '}
              {siteConfig.contact.address.city}, {siteConfig.contact.address.state}{' '}
              {siteConfig.contact.address.postalCode}.
            </p>
          </section>
        </div>
      </Section>
    </div>
  );
}
