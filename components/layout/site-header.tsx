import { ButtonLink, Container } from '@/components/ui';
import { routes, telHref } from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';
import { ArrowRightIcon, PhoneIcon } from './icons';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';
import { NavLinks } from './nav-links';

/** Grouped for readability, as it appears beside the dial action. */
const DISPLAY_PHONE = '+91 99940 72435';

/**
 * Site header.
 *
 * A floating glass container rather than a full-width bar: it hovers over the
 * hero, so the picture starts at the top of the page instead of below a band
 * of interface. It stays sticky, so "Get a Quote" is reachable from anywhere
 * on a long portfolio page.
 *
 * Its height is deliberately tight (`--header-height` in globals.css) because
 * the home hero is sized to fit the first desktop viewport underneath it.
 *
 * The container carries `backdrop-filter`, which makes it a containing block
 * for fixed descendants and its own stacking context. That is why the mobile
 * panel inside `MobileNav` is rendered through a portal rather than nested
 * here.
 */
export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 pt-2 sm:pt-2.5 lg:pt-3"
      style={{ paddingTop: 'calc(0.5rem + var(--safe-top))' }}
    >
      <Container width="wide">
        <div className="header-shell glass-surface-strong glass-edge rounded-[1.4rem] px-2 py-1.5 sm:rounded-[1.6rem] sm:px-4 lg:rounded-[1.75rem] lg:px-5">
          <div className="flex min-h-13 items-center justify-between gap-1.5 sm:gap-3 lg:min-h-14">
            <Logo priority />

            <NavLinks />

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/*
                Responsive visibility is applied to a wrapper, never to the
                ButtonLink itself: the button base sets `inline-flex`, which
                would win over a `hidden` utility passed through `className`.
              */}
              <span className="hidden xl:block">
                <ButtonLink
                  href={telHref}
                  variant="glass"
                  size="sm"
                  className="font-semibold"
                >
                  <span className="text-brand-700">
                    <PhoneIcon className="size-4" />
                  </span>
                  {DISPLAY_PHONE}
                </ButtonLink>
              </span>

              {/* Compact dial button between `sm` and `xl`, and on mobile. */}
              <a
                href={telHref}
                aria-label={`Call ${siteConfig.name} on ${DISPLAY_PHONE}`}
                className="glass-surface press text-brand-700 hover:text-brand-900 inline-flex size-11 items-center justify-center rounded-full transition-[color,background-color,transform] duration-300 hover:bg-white motion-safe:hover:scale-105 xl:hidden"
              >
                <PhoneIcon />
              </a>

              <span className="hidden sm:block">
                <ButtonLink href={routes.quote} variant="primary" size="sm">
                  Get a Quote
                  <ArrowRightIcon className="size-4" />
                </ButtonLink>
              </span>

              <MobileNav />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
