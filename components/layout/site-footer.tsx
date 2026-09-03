import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui';
import {
  legalNav,
  mailHref,
  primaryNav,
  routes,
  telHref,
  whatsAppHref,
} from '@/lib/navigation';
import { credentials, services } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import logoSrc from '@/public/brand/vrk-decor-logo.png';
import {
  ChevronRightIcon,
  HeartSolidIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from './icons';

/** The six services listed in the footer, in the approved catalogue order. */
const FOOTER_SERVICES = services.slice(0, 6);

/**
 * Site footer.
 *
 * Light rather than the previous dark slab, for two reasons: the supplied logo
 * is drawn for light backgrounds and had to sit on a white plate to be legible
 * on the dark surface, and the approved reference design closes on a calm light
 * footer rather than a heavy one.
 *
 * Every fact here comes from `lib/site-config.ts`, which is the approved
 * business record. No opening hours are shown, because none are approved.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const { address } = siteConfig.contact;

  return (
    <footer className="border-line-soft bg-surface mt-4 border-t sm:mt-6">
      <Container width="wide">
        <div className="grid gap-10 py-14 sm:py-16 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-5 lg:col-span-4">
            <Image
              src={logoSrc}
              alt={siteConfig.name}
              sizes="180px"
              className="h-12 w-auto self-start"
            />
            <p className="text-ink-muted max-w-sm text-sm leading-relaxed">
              We design and set up weddings, receptions and family celebrations across
              Tamil Nadu, and we look after every part of the setting so the day feels
              the way you pictured it.
            </p>

            <dl className="border-line-soft grid grid-cols-3 gap-4 border-t pt-5">
              {credentials.map((credential) => (
                <div key={credential.label} className="flex flex-col-reverse">
                  <dt className="text-ink-muted text-xs">{credential.label}</dt>
                  <dd className="font-display text-brand-700 text-2xl font-medium">
                    {credential.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/*
              No social row. Requirements approve no Instagram, Facebook or
              YouTube account, and none has been supplied
              (09_DECISIONS/DECISIONS.md). A link to a profile that does not
              exist is worse than no link, so the contact column below carries
              the channels VRK Decor actually answers on.
            */}
          </div>

          <nav
            aria-labelledby="footer-explore"
            className="flex flex-col gap-3 lg:col-span-2"
          >
            <h2
              id="footer-explore"
              className="text-brand-800 text-2xs font-semibold tracking-[0.22em] uppercase"
            >
              Explore
            </h2>
            <ul className="flex flex-col">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink-muted hover:text-brand-800 group inline-flex min-h-9 items-center gap-1.5 text-sm transition-colors"
                  >
                    {item.label}
                    <ChevronRightIcon className="text-brand-400 size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-services"
            className="flex flex-col gap-3 lg:col-span-3"
          >
            <h2
              id="footer-services"
              className="text-brand-800 text-2xs font-semibold tracking-[0.22em] uppercase"
            >
              Our services
            </h2>
            <ul className="flex flex-col">
              {FOOTER_SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={routes.services}
                    className="text-ink-muted hover:text-brand-800 inline-flex min-h-9 items-center text-sm transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3 lg:col-span-3">
            <h2 className="text-brand-800 text-2xs font-semibold tracking-[0.22em] uppercase">
              Contact us
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex gap-3">
                <PinIcon className="text-brand-600 mt-0.5 size-4" />
                <address className="text-ink-muted not-italic">
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </address>
              </li>
              <li className="flex gap-3">
                <PhoneIcon className="text-brand-600 mt-0.5 size-4" />
                <a
                  href={telHref}
                  className="text-ink-muted hover:text-brand-800 transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <WhatsAppIcon className="text-brand-600 mt-0.5 size-4" />
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-muted hover:text-brand-800 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex gap-3">
                <MailIcon className="text-brand-600 mt-0.5 size-4" />
                <a
                  href={mailHref}
                  className="text-ink-muted hover:text-brand-800 break-all transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
            <p className="text-ink-muted mt-1 text-xs leading-relaxed">
              Serving {siteConfig.coverage.join(', ')} and wider Tamil Nadu.
            </p>
          </div>
        </div>

        <div className="border-line-soft flex flex-col gap-4 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-muted text-xs">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>

          <ul className="flex flex-wrap gap-4">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-muted hover:text-brand-800 text-xs transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-ink-muted inline-flex items-center gap-1.5 text-xs">
            Developed with
            <span className="text-brand-600">
              <HeartSolidIcon />
            </span>
            <span className="sr-only">love</span>
            by Zenvy
          </p>
        </div>
      </Container>
    </footer>
  );
}
