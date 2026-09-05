import { ButtonLink, Reveal } from '@/components/ui';
import {
  ArrowRightIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '@/components/layout/icons';
import { cn } from '@/lib/cn';
import { telHref } from '@/lib/navigation';

/** Grouped for readability, as it appears beside the dial action. */
const DISPLAY_PHONE = '+91 99940 72435';

/**
 * The three ways to reach VRK Decor, side by side.
 *
 * They are alternatives, and the layout says so: three equal cards under one
 * line, "choose whichever works best for you". WhatsApp leads because it is
 * the approved primary channel and the fastest; Call is for people who want
 * to talk now; the form is for people who prefer to write it down. Nobody is
 * asked to do more than one.
 *
 * `whatsAppHref` is built by the caller so it can carry the selected design's
 * name and page URL (see `designEnquiryMessage`). `Call Us` is a `tel:` link,
 * which opens the dialer on a phone and the default calling app on a desktop.
 */
export function EnquiryOptions({
  whatsAppHref,
  formHref = '#enquiry-form',
  heading = 'Three ways to reach us',
  lead = 'Choose whichever works best for you. Any one of them reaches the same team.',
  headingId = 'enquiry-options',
}: {
  whatsAppHref: string;
  formHref?: string;
  heading?: string;
  lead?: string;
  headingId?: string;
}) {
  const options = [
    {
      key: 'whatsapp',
      step: 'Option 1',
      title: 'WhatsApp',
      body: 'The fastest way to enquire. Your message is already written for you.',
      icon: WhatsAppIcon,
      action: (
        <ButtonLink
          href={whatsAppHref}
          variant="lime"
          size="md"
          fullWidth
          data-testid="quote-whatsapp-continuation"
        >
          <WhatsAppIcon className="size-4" />
          Chat on WhatsApp
        </ButtonLink>
      ),
      deep: true,
    },
    {
      key: 'call',
      step: 'Option 2',
      title: 'Call',
      body: `Would rather talk it through? Call ${DISPLAY_PHONE} and speak to the team directly.`,
      icon: PhoneIcon,
      action: (
        <ButtonLink
          href={telHref}
          variant="deep"
          size="md"
          fullWidth
          data-testid="quote-call"
        >
          <PhoneIcon className="size-4" />
          Call Us
        </ButtonLink>
      ),
      deep: false,
    },
    {
      key: 'form',
      step: 'Option 3',
      title: 'Send an enquiry',
      body: 'Prefer to write it down? Six quick questions and we will call you back.',
      icon: MailIcon,
      action: (
        <ButtonLink href={formHref} variant="outline" size="md" fullWidth>
          Send an Enquiry
          <ArrowRightIcon className="size-4" />
        </ButtonLink>
      ),
      deep: false,
    },
  ] as const;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-6">
      <Reveal className="flex flex-col gap-2">
        <h2 id={headingId} className="font-display text-3xl font-medium">
          {heading}
        </h2>
        <p className="text-ink-muted">{lead}</p>
      </Reveal>

      <ul className="grid gap-4 md:grid-cols-3" data-testid="enquiry-options">
        {options.map((option, index) => {
          const OptionIcon = option.icon;
          return (
            <Reveal
              as="li"
              key={option.key}
              delay={index * 110}
              effect="scale"
              className={cn(
                'group lift shine flex flex-col gap-4 rounded-3xl border p-5 sm:p-6',
                option.deep
                  ? 'surface-aurora on-deep shadow-deep border-white/10 text-white'
                  : 'border-brand-200/70 shadow-card bg-white',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    'inline-flex size-12 items-center justify-center rounded-full',
                    option.deep
                      ? 'bg-[#25D366] text-white shadow-[0_10px_24px_-8px_rgb(37_211_102/0.8)]'
                      : 'icon-deep',
                  )}
                >
                  <OptionIcon className="size-6" />
                </span>
                <span
                  className={cn(
                    'text-2xs font-semibold tracking-[0.18em] uppercase',
                    option.deep ? 'text-accent-300' : 'text-brand-700',
                  )}
                >
                  {option.step}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <h3 className="font-display text-xl font-medium">{option.title}</h3>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    option.deep ? 'text-ink-on-deep' : 'text-ink-muted',
                  )}
                >
                  {option.body}
                </p>
              </div>
              {option.action}
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
