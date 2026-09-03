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
 * hero photography, so the picture starts at the top of the page instead of
 * below a band of interface. It stays sticky, so "Get a Quote" is reachable
 * from anywhere on a long portfolio page.
 *
 * The container carries `backdrop-filter`, which makes it a containing block
 * for fixed descendants and its own stacking context. That is why the mobile
 * panel inside `MobileNav` is rendered through a portal rather than nested
 * here.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 pt-2 sm:pt-3 lg:pt-4">
      <Container width="wide">
        <div className="glass-surface-strong glass-edge rounded-[1.6rem] px-3 py-2 sm:px-4 lg:rounded-[1.75rem] lg:px-5">
          <div className="flex min-h-14 items-center justify-between gap-3 sm:min-h-16">
            <Logo priority />

            <NavLinks />

            <div className="flex items-center gap-2">
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
                className="glass-surface text-brand-700 hover:text-brand-800 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white xl:hidden"
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
