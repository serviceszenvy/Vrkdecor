import Link from 'next/link';
import { ButtonLink, Container } from '@/components/ui';
import { primaryNav, routes, telHref } from '@/lib/navigation';
import { PhoneIcon } from './icons';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';

/**
 * Site header: logo, primary navigation and the primary "Get a Quote" call to
 * action. Sticky so the CTA stays reachable while browsing photography.
 */
export function SiteHeader() {
  return (
    <header className="bg-surface/95 border-line sticky top-0 z-50 border-b backdrop-blur-sm">
      <Container width="wide">
        <div className="flex min-h-16 items-center justify-between gap-4 py-2 sm:min-h-20">
          <Logo priority />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink hover:text-brand-700 hover:bg-sand-50 inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {/*
              Responsive visibility is applied to a wrapper, never to the
              ButtonLink itself: the button base sets `inline-flex`, which would
              win over a `hidden` utility passed through `className`.
            */}
            <span className="hidden xl:block">
              <ButtonLink href={telHref} variant="ghost" size="sm">
                <PhoneIcon />
                Call
              </ButtonLink>
            </span>
            <span className="hidden sm:block">
              <ButtonLink href={routes.quote} variant="primary" size="sm">
                Get a Quote
              </ButtonLink>
            </span>
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
