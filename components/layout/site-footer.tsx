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
 * The deepest ground on the page (`canvas-deep`) — every public page is dark
 * now, so the footer no longer needs to be a special "dark exception"; it
 * just closes the page one shade darker than the `canvas` everything else
 * sits on, for a little visual weight at the very bottom.
 *
 * The supplied logo is drawn for light backgrounds only (no reversed variant
 * has been supplied — `docs/DESIGN-SYSTEM.md` §1 records this as a
 * recommended client action), so it sits on its own small white plate here
 * rather than directly on the dark ground. Every other colour here is
 * asserted in `contrastContract` (`lib/design-tokens.ts`).
 *
 * Every fact here comes from `lib/site-config.ts`, which is the approved
 * business record. No opening hours are shown, because none are approved.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const { address } = siteConfig.contact;

  return (
    <footer className="bg-canvas-deep relative mt-4 sm:mt-6">
      <div
        aria-hidden="true"
        className="from-accent-400/0 via-accent-400/60 to-brand-400/0 absolute inset-x-0 top-0 h-px bg-gradient-to-r"
      />
      <Container width="wide">
        <div className="grid gap-10 py-14 sm:py-16 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-5 lg:col-span-4">
            <div className="w-fit self-start rounded-2xl bg-white px-4 py-2.5">
              <Image src={logoSrc} alt={siteConfig.name} sizes="180px" className="h-9 w-auto" />
            </div>
            <p className="text-sand-300 max-w-sm text-sm leading-relaxed">
              We design and set up weddings, receptions and family celebrations across
              Tamil Nadu, and we look after every part of the setting so the day feels
              the way you pictured it.
            </p>

            <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
              {credentials.map((credential) => (
                <div key={credential.label} className="flex flex-col-reverse">
                  <dt className="text-sand-400 text-xs">{credential.label}</dt>
                  <dd className="font-display text-accent-300 text-2xl font-medium">
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
              className="text-accent-300 text-2xs font-semibold tracking-[0.22em] uppercase"
            >
              Explore
            </h2>
            <ul className="flex flex-col">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sand-300 hover:text-accent-300 group inline-flex min-h-9 items-center gap-1.5 text-sm transition-colors"
                  >
                    {item.label}
                    <ChevronRightIcon className="text-accent-400 size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
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
              className="text-accent-300 text-2xs font-semibold tracking-[0.22em] uppercase"
            >
              Our services
            </h2>
            <ul className="flex flex-col">
              {FOOTER_SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={routes.services}
                    className="text-sand-300 hover:text-accent-300 inline-flex min-h-9 items-center text-sm transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3 lg:col-span-3">
            <h2 className="text-accent-300 text-2xs font-semibold tracking-[0.22em] uppercase">
              Contact us
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex gap-3">
                <PinIcon className="text-accent-400 mt-0.5 size-4" />
                <address className="text-sand-300 not-italic">
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </address>
              </li>
              <li className="flex gap-3">
                <PhoneIcon className="text-accent-400 mt-0.5 size-4" />
                <a
                  href={telHref}
                  className="text-sand-300 hover:text-accent-300 transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <WhatsAppIcon className="text-accent-400 mt-0.5 size-4" />
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand-300 hover:text-accent-300 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex gap-3">
                <MailIcon className="text-accent-400 mt-0.5 size-4" />
                <a
                  href={mailHref}
                  className="text-sand-300 hover:text-accent-300 break-all transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
            <p className="text-sand-400 mt-1 text-xs leading-relaxed">
              Serving {siteConfig.coverage.join(', ')} and wider Tamil Nadu.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sand-400 text-xs">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>

          <ul className="flex flex-wrap gap-4">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sand-400 hover:text-accent-300 text-xs transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-sand-400 inline-flex items-center gap-1.5 text-xs">
            Developed with
            <span className="text-accent-400">
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
