import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui';
import {
  legalNav,
  mailHref,
  primaryNav,
  telHref,
  whatsAppHref,
} from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';
import logoSrc from '@/public/brand/vrk-decor-logo.png';

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { address } = siteConfig.contact;

  return (
    <footer className="bg-surface-inverse text-ink-inverse">
      <Container width="wide">
        <div className="grid gap-10 py-14 sm:py-16 lg:grid-cols-4">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/*
              The supplied logo is drawn for light backgrounds; its sage
              wordmark is weak on the inverse surface. Until a reversed brand
              asset is supplied it is presented on a white plate.
              `self-start` prevents the column flex container from stretching
              the artwork.
            */}
            <span className="inline-flex self-start rounded-md bg-white px-4 py-3">
              <Image
                src={logoSrc}
                alt={siteConfig.name}
                sizes="180px"
                className="h-11 w-auto"
              />
            </span>
            <p className="text-sand-200 max-w-sm text-sm">{siteConfig.description}</p>
            <address className="text-sand-300 text-sm not-italic">
              {address.street}
              <br />
              {address.city}, {address.state} {address.postalCode}
            </address>
          </div>

          <nav aria-labelledby="footer-explore" className="flex flex-col gap-3">
            <h2
              id="footer-explore"
              className="text-accent-300 text-xs font-semibold tracking-[0.18em] uppercase"
            >
              Explore
            </h2>
            <ul className="flex flex-col gap-2">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sand-200 inline-flex min-h-9 items-center text-sm hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="text-accent-300 text-xs font-semibold tracking-[0.18em] uppercase">
              Contact
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <a
                  href={telHref}
                  className="text-sand-200 inline-flex min-h-9 items-center hover:text-white"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand-200 inline-flex min-h-9 items-center hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={mailHref}
                  className="text-sand-200 inline-flex min-h-9 items-center break-all hover:text-white"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
            <p className="text-sand-300 text-xs">
              Serving {siteConfig.coverage.join(', ')} and wider Tamil Nadu.
            </p>
          </div>
        </div>

        <div className="border-sand-800 flex flex-col gap-3 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sand-400 text-xs">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-4">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sand-400 text-xs hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
