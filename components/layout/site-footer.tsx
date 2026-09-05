import Link from 'next/link';
import Image from 'next/image';
import { Container, CountUp } from '@/components/ui';
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

/** The developer credit links here, as agreed in the refinement brief. */
export const ZENVY_URL = 'https://serviceszenvy.wixsite.com/home';

/**
 * Site footer.
 *
 * The site now closes on the deep olive surface, so the page ends with the
 * same confident dark note the hero opens with. The supplied logo is drawn for
 * light backgrounds, so it sits on a small white plate rather than being
 * recoloured, which no approved brand asset permits.
 *
 * Every fact here comes from `lib/site-config.ts`, which is the approved
 * business record. No opening hours are shown, because none are approved.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const { address } = siteConfig.contact;

  return (
    <footer className="surface-aurora on-deep relative isolate mt-4 overflow-hidden text-white sm:mt-6">
      <span
        className="ambient-blob bg-accent-500/25 -top-40 right-[8%] size-[30rem]"
        aria-hidden="true"
      />
      <span
        className="ambient-blob ambient-blob-slow bg-brand-400/25 -bottom-48 -left-24 size-[28rem]"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pattern-dots absolute inset-0 -z-10 opacity-40"
      />

      <Container width="wide">
        <div className="grid gap-8 py-10 sm:gap-10 sm:py-16 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-5 lg:col-span-4">
            <span className="inline-flex self-start rounded-2xl bg-white px-3.5 py-2 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.5)]">
              <Image
                src={logoSrc}
                alt={siteConfig.name}
                sizes="180px"
                className="h-11 w-auto"
              />
            </span>
            <p className="text-ink-on-deep max-w-sm text-sm leading-relaxed">
              We design and set up weddings, receptions and family celebrations across
              Tamil Nadu, and we look after every part of the setting so the day feels
              the way you pictured it.
            </p>

            <dl className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5 sm:gap-4">
              {credentials.map((credential) => (
                <div key={credential.label} className="flex flex-col-reverse">
                  <dt className="text-ink-on-deep/80 text-[0.75rem] leading-tight text-pretty sm:text-xs">
                    {credential.label}
                  </dt>
                  <dd className="font-display text-gradient-lime text-xl font-medium tabular-nums sm:text-2xl">
                    <CountUp value={credential.value} />
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
                    className="text-ink-on-deep group inline-flex min-h-11 items-center gap-1.5 text-sm transition-colors hover:text-white"
                  >
                    {item.label}
                    <ChevronRightIcon className="text-accent-400 size-3.5 -translate-x-1 opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100" />
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
                    className="text-ink-on-deep inline-flex min-h-11 items-center text-sm transition-colors hover:text-white"
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
                <PinIcon className="text-accent-400 mt-0.5 size-4 shrink-0" />
                <address className="text-ink-on-deep not-italic">
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </address>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="text-accent-400 size-4 shrink-0" />
                <a
                  href={telHref}
                  className="text-ink-on-deep inline-flex min-h-11 items-center transition-colors hover:text-white"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <WhatsAppIcon className="text-accent-400 size-4 shrink-0" />
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-on-deep inline-flex min-h-11 items-center transition-colors hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MailIcon className="text-accent-400 size-4 shrink-0" />
                <a
                  href={mailHref}
                  className="text-ink-on-deep inline-flex min-h-11 items-center break-all transition-colors hover:text-white"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
            <p className="text-ink-on-deep/80 mt-1 text-xs leading-relaxed">
              Serving {siteConfig.coverage.join(', ')} and wider Tamil Nadu.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-on-deep/80 text-xs">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>

          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-on-deep/80 inline-flex min-h-11 items-center text-xs transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-ink-on-deep/80 inline-flex items-center gap-1.5 text-xs">
            Developed with
            <span className="text-accent-400">
              <HeartSolidIcon />
            </span>
            <span className="sr-only">love</span>
            by{' '}
            <a
              href={ZENVY_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="zenvy-link"
              className="inline-flex min-h-11 items-center text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
            >
              Zenvy
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
