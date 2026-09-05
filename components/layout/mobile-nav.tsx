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

    /*
     * Scroll lock.
     *
     * `overflow: hidden` on the body does not hold on iOS Safari — the page
     * behind the sheet keeps scrolling under the finger. Pinning the body at
     * its current offset does hold, on every browser, at the cost of having to
     * restore the scroll position when the sheet closes.
     */
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

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
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      // `scroll-behavior: smooth` on the root would animate this restore into
      // a visible jump back up the page, so it is done instantly.
      window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
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
        className="glass-surface press text-ink hover:text-brand-800 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white lg:hidden"
      >
        <span
          className={cn(
            'inline-flex transition-transform duration-300',
            open ? 'motion-safe:rotate-90' : 'motion-safe:rotate-0',
          )}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </span>
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
                className="bg-brand-950/60 motion-safe:animate-fade-in fixed inset-0 z-40 backdrop-blur-[3px] lg:hidden"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              <div
                ref={panelRef}
                id={panelId}
                data-testid="mobile-nav-panel"
                className={cn(
                  // Sits below the floating header so the close control stays
                  // visible and usable while the panel is open. The offset is
                  // the measured header height rather than a magic number, so
                  // it stays correct once the notch inset is added to it.
                  'fixed z-40 lg:hidden',
                  'glass-surface-strong glass-edge motion-safe:animate-sheet-up rounded-3xl',
                  // `100svh` rather than `100dvh`: the sheet must not resize
                  // under the visitor's finger as the Safari toolbar collapses.
                  'flex flex-col overflow-y-auto overscroll-contain p-3',
                )}
                style={{
                  top: 'calc(var(--header-height) + 0.5rem)',
                  left: 'calc(0.75rem + var(--safe-left))',
                  right: 'calc(0.75rem + var(--safe-right))',
                  maxHeight:
                    'calc(100svh - var(--header-height) - 1.25rem - var(--safe-bottom))',
                }}
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
                              'press flex min-h-12 items-center justify-between gap-3 rounded-2xl px-4 text-base transition-colors',
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
