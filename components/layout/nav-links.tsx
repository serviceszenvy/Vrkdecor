'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { headerNav, routes } from '@/lib/navigation';

/**
 * Desktop primary navigation with the current-page indicator.
 *
 * This is the only part of the header that needs the pathname, so it is the
 * only part that is a client component. `aria-current="page"` carries the state
 * to assistive technology; the green underline dot is the visual half of the
 * same fact, never the only half.
 */
export function isCurrent(pathname: string, href: string): boolean {
  if (href === routes.home) return pathname === routes.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname() ?? routes.home;

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-0.5">
        {headerNav.map((item) => {
          const current = isCurrent(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'relative inline-flex min-h-11 items-center rounded-full px-3.5 text-sm transition-colors',
                  current
                    ? 'text-brand-800 font-semibold'
                    : 'text-ink/80 hover:text-brand-800 font-medium hover:bg-white/50',
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'bg-brand-600 absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity',
                    current ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
