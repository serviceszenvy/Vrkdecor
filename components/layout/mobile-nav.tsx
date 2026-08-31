'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ButtonLink } from '@/components/ui';
import { cn } from '@/lib/cn';
import { primaryNav, routes, telHref, whatsAppHref } from '@/lib/navigation';
import { CloseIcon, MenuIcon, PhoneIcon, WhatsAppIcon } from './icons';

/**
 * Mobile navigation disclosure.
 *
 * Accessibility behaviour:
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        data-testid="mobile-nav-trigger"
        className="text-ink hover:bg-sand-100 inline-flex size-11 items-center justify-center rounded-md lg:hidden"
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
                className="bg-ink/50 fixed inset-0 z-40 lg:hidden"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              <div
                ref={panelRef}
                id={panelId}
                data-testid="mobile-nav-panel"
                className={cn(
                  // Sits directly below the sticky header so the close control
                  // stays visible and usable while the panel is open.
                  'bg-surface border-line fixed inset-x-0 top-16 z-40 border-b sm:top-20 lg:hidden',
                  'flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto p-4',
                )}
              >
                <nav aria-label="Mobile">
                  <ul className="flex flex-col">
                    {primaryNav.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-ink hover:bg-sand-100 flex min-h-12 items-center rounded-md px-3 text-lg"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="border-line mt-3 flex flex-col gap-2 border-t pt-4">
                  <ButtonLink href={routes.quote} variant="primary" size="md" fullWidth>
                    Get a Quote
                  </ButtonLink>
                  <div className="grid grid-cols-2 gap-2">
                    <ButtonLink href={telHref} variant="outline" size="md" fullWidth>
                      <PhoneIcon />
                      Call
                    </ButtonLink>
                    <ButtonLink
                      href={whatsAppHref}
                      variant="outline"
                      size="md"
                      fullWidth
                    >
                      <WhatsAppIcon />
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
