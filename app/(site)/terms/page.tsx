import type { Metadata } from 'next';
import { DraftNotice, Hero } from '@/components/page';
import { Section } from '@/components/ui';
import { mailHref } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = pageMetadata({
  title: 'Terms & Conditions',
  description:
    'The terms that apply to using the VRK Decor website and sending a quote request.',
  path: '/terms',
});

/**
 * Terms & Conditions — required by Requirements section 21.
 *
 * Limited to how this website behaves: enquiries are requests rather than
 * bookings, quotations are prepared by people rather than calculated
 * automatically (Requirements section 16), and the site takes no payment
 * (Phase 2 / out of scope). Commercial terms are not asserted, because none are
 * approved. Marked as a draft pending review.
 */
export default function TermsPage() {
  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero compact eyebrow="Legal" title="Terms & Conditions" />

      <Section tone="panel" width="default" aria-labelledby="terms">
        <h2 id="terms" className="sr-only">
          Terms and Conditions
        </h2>

        <DraftNotice>
          These terms describe how this website works and must be reviewed and approved
          by {siteConfig.name} before launch. Commercial terms for a booking are agreed
          separately with the {siteConfig.name} team.
        </DraftNotice>

        <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed">
          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">Using this website</h3>
            <p className="text-ink-muted">
              This website presents {siteConfig.name}&rsquo;s work, services and
              occasions, and lets you request a quotation. Designs and photographs shown
              here are the property of {siteConfig.name} and may not be reproduced
              without permission.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">Quote requests</h3>
            <p className="text-ink-muted">
              Sending a quote request is an enquiry, not a booking, and does not reserve
              a date. Our team will contact you to discuss your requirement. Quotations
              are prepared by our team for your specific event; this website does not
              calculate a final price.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">Prices shown</h3>
            <p className="text-ink-muted">
              Where a package shows a &ldquo;starting from&rdquo; price, it is an
              indication for that package only. The final quotation depends on your
              date, venue, scale and the services you choose.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">Partner vendors</h3>
            <p className="text-ink-muted">
              {siteConfig.name} is the event design and coordination brand. Specialist
              services such as makeup and styling, sound and lighting, photography and
              videography, catering and LED or display solutions are delivered with
              trusted partner vendors, coordinated by {siteConfig.name}.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">Payments</h3>
            <p className="text-ink-muted">
              No payment is taken through this website. Any payment terms are agreed
              directly with the {siteConfig.name} team.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">Images you upload</h3>
            <p className="text-ink-muted">
              By attaching inspiration images to an enquiry you confirm you are entitled
              to share them with us. We store them privately and use them only to
              understand your requirement.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-medium">Contact</h3>
            <p className="text-ink-muted">
              Questions about these terms can be sent to{' '}
              <a
                className="text-brand-700 underline underline-offset-4"
                href={mailHref}
              >
                {siteConfig.contact.email}
              </a>
              .
            </p>
          </section>
        </div>
      </Section>
    </div>
  );
}
