import type { ReactNode, SVGProps } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge, Button, SkipLink } from '@/components/ui';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/site-config';
import type { AdminIdentity } from '@/lib/auth/admin';
import type { PublicationStatus } from '@/lib/db/types';
import logoSrc from '@/public/brand/vrk-decor-logo.png';
import { signOutAction } from '../actions/auth';

/**
 * The Admin Panel shell.
 *
 * Deliberately not the public site chrome. An enquiry inbox sitting inside a
 * marketing header, a "Get a Quote" action bar and a footer full of sales copy
 * would be confusing to work in and careless to show anyone standing behind the
 * person using it. `app/(site)/layout.tsx` keeps the public chrome; this is the
 * other application.
 *
 * It shares the brand's colours, type and shapes so the two read as one
 * product, and diverges where the job is different:
 *
 *   - a fixed sidebar from `lg` up, because six sections in a row of tabs
 *     already overflowed a phone and there will be more
 *   - glass on the sidebar and the top bar only. Never behind a table: nobody
 *     should read a customer's phone number through a blurred photograph
 *   - denser spacing and smaller type than the public site, because this is a
 *     tool somebody uses all day rather than a page that has to persuade
 *
 * The navigation is the approved feature set: the enquiry inbox, portfolio,
 * packages, testimonials and page content.
 */

type IconProps = SVGProps<SVGSVGElement>;

function NavIcon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-[18px] shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

const ICONS = {
  overview: (
    <NavIcon>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
    </NavIcon>
  ),
  enquiries: (
    <NavIcon>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7.5 7.3 5.1a1.2 1.2 0 0 0 1.4 0L20 7.5" />
    </NavIcon>
  ),
  designs: (
    <NavIcon>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="m4 16 4.6-4.2a1.6 1.6 0 0 1 2.2 0L15 16" />
      <circle cx="15.5" cy="9" r="1.6" />
    </NavIcon>
  ),
  packages: (
    <NavIcon>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
      <path d="m4 7 8 4 8-4M12 11v10" />
    </NavIcon>
  ),
  testimonials: (
    <NavIcon>
      <path d="M4.5 5h15v10.5h-9L5 19.5V15H4.5V5Z" />
      <path d="M9 9.5h6M9 12h4" />
    </NavIcon>
  ),
  content: (
    <NavIcon>
      <path d="M4.5 6h15M4.5 12h15M4.5 18h9" />
    </NavIcon>
  ),
} as const;

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: ICONS.overview },
  { href: '/admin/enquiries', label: 'Enquiries', icon: ICONS.enquiries },
  { href: '/admin/designs', label: 'Designs', icon: ICONS.designs },
  { href: '/admin/packages', label: 'Packages', icon: ICONS.packages },
  { href: '/admin/testimonials', label: 'Testimonials', icon: ICONS.testimonials },
  { href: '/admin/content', label: 'Occasions & services', icon: ICONS.content },
] as const;

export function AdminShell({
  admin,
  current,
  children,
}: {
  admin: AdminIdentity;
  /** The nav item to mark, matched on the href. */
  current: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-canvas canvas-wash flex min-h-dvh flex-col lg:flex-row">
      <SkipLink />

      {/*
        One navigation list, rendered once. At `lg` it is a fixed sidebar; below
        that it becomes a horizontally scrollable strip under the brand bar. The
        markup is identical either way, so there is no second copy of the links
        to keep in step and no duplicate landmark for a screen reader.
      */}
      <div className="glass-surface-strong z-20 flex flex-col border-0 border-b lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5 lg:py-5">
          {/*
            A plain link with the mark, not the public `Logo` component: that
            one is itself a link to the public home page, and an anchor inside
            an anchor is invalid markup and confusing to a screen reader.
          */}
          <Link
            href="/admin"
            className="flex min-h-11 items-center gap-2.5 rounded-xl"
            aria-label="VRK Decor Admin, overview"
          >
            <Image src={logoSrc} alt="" sizes="120px" className="h-8 w-auto" />
            <span className="text-ink-muted border-line-soft border-l pl-2.5 text-xs font-semibold tracking-[0.16em] uppercase">
              Admin
            </span>
          </Link>

          <Link
            href="/"
            className="border-line-soft text-ink-muted hover:text-brand-800 inline-flex min-h-11 items-center rounded-full border px-3 text-xs transition-colors lg:hidden"
          >
            View site
          </Link>
        </div>

        <nav
          aria-label="Admin sections"
          className="border-line-soft border-t px-2 py-2 lg:flex-1 lg:overflow-y-auto lg:px-3 lg:py-4"
        >
          <ul className="rail flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {ADMIN_NAV.map((item) => {
              const active = item.href === current;
              return (
                <li key={item.href} className="shrink-0 lg:shrink">
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium whitespace-nowrap transition-colors',
                      active
                        ? 'bg-brand-700 text-white'
                        : 'text-ink-soft hover:bg-brand-50 hover:text-brand-800',
                    )}
                  >
                    <span
                      className={active ? 'text-white' : 'text-brand-600'}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/*
          Rendered once, whatever the size, so there is never a second control
          with the same test id or two ways to sign out on screen at once.
        */}
        <div className="border-line-soft flex flex-col gap-2 border-t px-4 py-3 lg:py-4">
          <p
            className="text-ink-muted truncate text-xs"
            data-testid="admin-identity"
            title={admin.email}
          >
            {admin.email}
          </p>
          <div className="flex items-center gap-2">
            <form action={signOutAction} className="flex-1">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                fullWidth
                data-testid="sign-out"
              >
                Sign out
              </Button>
            </form>
            <Link
              href="/"
              className="border-line-soft text-ink-muted hover:text-brand-800 hidden min-h-11 items-center rounded-full border px-3 text-xs transition-colors lg:inline-flex"
            >
              View site
            </Link>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </main>

        <footer className="text-ink-muted px-4 pb-6 text-xs sm:px-6 lg:px-8">
          <div className="border-line-soft mx-auto max-w-6xl border-t pt-4">
            {siteConfig.name} Admin Panel. Enquiries are handled here, never by email.
          </div>
        </footer>
      </div>
    </div>
  );
}

export function AdminPageHeading({
  title,
  lead,
  actions,
}: {
  title: string;
  lead?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-2xl flex-col gap-1">
        <h1 className="font-display text-2xl font-medium sm:text-3xl">{title}</h1>
        {lead ? <p className="text-ink-muted text-sm">{lead}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  id,
  padded = true,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  id?: string;
  /** Off for a full-bleed list, where the rows carry their own padding. */
  padded?: boolean;
}) {
  return (
    <section
      id={id}
      className="border-line-soft bg-surface shadow-card overflow-hidden rounded-2xl border"
    >
      {title || description ? (
        <div className="border-line-soft border-b px-5 py-4">
          {title ? <h2 className="font-display text-lg font-medium">{title}</h2> : null}
          {description ? (
            <p className="text-ink-muted mt-1 text-sm">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

/**
 * The filter strip above a list. One component so the enquiry inbox and the
 * design list cannot drift apart.
 */
export function AdminFilterNav({
  label,
  options,
  active,
}: {
  label: string;
  options: readonly { href: string; label: string; value: string }[];
  active: string;
}) {
  return (
    <nav aria-label={label}>
      <ul className="rail -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {options.map((option) => {
          const isActive = option.value === active;
          return (
            <li key={option.href} className="shrink-0">
              <Link
                href={option.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors',
                  isActive
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-line-soft bg-surface text-ink-soft hover:border-brand-300 hover:bg-brand-50',
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** One row in an admin list. Opaque and dense, never glass. */
export function AdminRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        'hover:bg-brand-50/50 border-line-soft border-b px-5 py-4 transition-colors last:border-b-0',
        className,
      )}
    >
      {children}
    </li>
  );
}

/** One badge for the publication lifecycle, used by every list that shows it. */
export function StatusBadge({ status }: { status: PublicationStatus }) {
  if (status === 'published') return <Badge tone="brand">Published</Badge>;
  if (status === 'archived') return <Badge tone="neutral">Archived</Badge>;
  return <Badge tone="accent">Draft</Badge>;
}
