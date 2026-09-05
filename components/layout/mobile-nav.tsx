'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ButtonLink } from '@/components/ui';
import { cn } from '@/lib/cn';
import { headerNav, routes, telHref, whatsAppHref } from '@/lib/navigation';
import {
  ChevronRightIcon,
  CloseIcon,
  MenuIcon,
  PhoneIcon,
  WhatsAppIcon,
} from './icons';
import { isCurrent } from './nav-links';

/**
 * Mobile navigation disclosure.
 *
 * Accessibility behaviour, unchanged by the redesign:
 * - the trigger owns `aria-expanded` and `aria-controls`
 * - Escape closes the panel and returns focus to the trigger
 * - focus moves into the panel on open and is trapped while it is open
 * - background scrolling is locked while the panel is open
 * - the panel closes on route change
 *
 * The overlay and panel are rendered through a portal. The header uses
 * `backdrop-filter`, which makes it the containing block for `fixed`
 * descendants and its own stacking context — nesting them inside it would
 * position them against the header and dim the header itself.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close the panel when the route changes. React's documented
  // adjust-state-during-render pattern; an effect here would cause a
  // cascading render.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab' || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const current = pathname ?? routes.home;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        data-testid="mobile-nav-trigger"
        className="glass-surface text-ink hover:text-brand-800 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white lg:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      </button>

      {/*
        Portalled only while open: the panel can only be opened by a client-side
        interaction, so `document.body` is guaranteed to exist at that point and
        no mount guard (and no state-setting effect) is needed.
      */}
      {open
        ? createPortal(
            <>
              <div
                className="bg-brand-950/55 motion-safe:animate-fade-in fixed inset-0 z-40 backdrop-blur-[3px] lg:hidden"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              <div
                ref={panelRef}
                id={panelId}
                data-testid="mobile-nav-panel"
                className={cn(
                  // Sits below the floating header so the close control stays
                  // visible and usable while the panel is open.
                  'fixed inset-x-3 top-[4.75rem] z-40 sm:inset-x-4 sm:top-[5.5rem] lg:hidden',
                  'glass-surface-strong glass-edge motion-safe:animate-slide-down rounded-3xl',
                  'flex max-h-[calc(100dvh-6.5rem)] flex-col overflow-y-auto p-3',
                )}
              >
                <nav aria-label="Mobile">
                  <ul
                    className="stagger flex flex-col"
                    style={{ '--stagger-step': '45ms' } as CSSProperties}
                  >
                    {headerNav.map((item, index) => {
                      const active = isCurrent(current, item.href);
                      return (
                        <li key={item.href} style={{ '--i': index } as CSSProperties}>
                          <Link
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex min-h-12 items-center justify-between gap-3 rounded-2xl px-4 text-base transition-colors',
                              active
                                ? 'bg-brand-900 text-accent-200 font-semibold'
                                : 'text-ink hover:bg-brand-50',
                            )}
                          >
                            {item.label}
                            <ChevronRightIcon
                              className={cn(
                                'size-4',
                                active ? 'text-accent-300' : 'text-brand-500',
                              )}
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="border-line-soft mt-3 flex flex-col gap-2 border-t px-1 pt-4 pb-1">
                  <ButtonLink href={routes.quote} variant="primary" size="md" fullWidth>
                    Get a Quote
                  </ButtonLink>
                  <div className="grid grid-cols-2 gap-2">
                    <ButtonLink href={telHref} variant="outline" size="md" fullWidth>
                      <PhoneIcon className="size-4" />
                      Call
                    </ButtonLink>
                    <ButtonLink
                      href={whatsAppHref}
                      variant="outline"
                      size="md"
                      fullWidth
                    >
                      <WhatsAppIcon className="size-4" />
                      WhatsApp
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
