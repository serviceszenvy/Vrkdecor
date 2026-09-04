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
 * The one deliberately *bright* glass moment on an otherwise dark site
 * (`glass-surface-inverse`) — the supplied logo is drawn for light
 * backgrounds only, with no reversed variant supplied
 * (docs/DESIGN-SYSTEM.md §1), so the header carries its own light ground
 * rather than a plate behind just the logo. It also reads as a deliberate
 * "layered surfaces" moment per the dark-theme brief: a bright pill floating
 * over a dark page, rather than one more dark panel.
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
        <div className="glass-surface-inverse glass-edge rounded-[1.6rem] px-3 py-2 sm:px-4 lg:rounded-[1.75rem] lg:px-5">
          <div className="flex min-h-14 items-center justify-between gap-3 sm:min-h-16">
            <Logo priority />

            <NavLinks />

            <div className="flex items-center gap-2">
              {/*
                Responsive visibility is applied to a wrapper, never to the
                ButtonLink itself: the button base sets `inline-flex`, which
                would win over a `hidden` utility passed through `className`.
              */}
              {/*
                A plain custom link, not `ButtonLink`: every button variant is
                now tuned for the site's dark theme, and this is the one
                light-context control on the page (it lives inside the
                header's bright `glass-surface-inverse`) — building it from a
                dark-tuned variant would mean fighting the base classes with
                appended overrides that aren't guaranteed to win (`lib/cn.ts`
                does not resolve conflicting Tailwind utilities).
              */}
              <span className="hidden xl:block">
                <a
                  href={telHref}
                  className="border-brand-200 text-brand-700 hover:border-brand-400 hover:bg-brand-50 motion-safe:hover:-translate-y-0.5 inline-flex min-h-11 items-center gap-1.5 rounded-full border bg-white/70 px-4 text-sm font-semibold transition-[background-color,border-color,transform] duration-200"
                >
                  <PhoneIcon className="size-4" />
                  {DISPLAY_PHONE}
                </a>
              </span>

              {/* Compact dial button between `sm` and `xl`, and on mobile. */}
              <a
                href={telHref}
                aria-label={`Call ${siteConfig.name} on ${DISPLAY_PHONE}`}
                className="border-brand-200 text-brand-700 hover:text-brand-800 inline-flex size-11 items-center justify-center rounded-full border bg-white/70 transition-[background-color,color,transform] duration-200 hover:bg-white motion-safe:active:scale-90 xl:hidden"
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
