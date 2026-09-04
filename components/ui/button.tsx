import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'inverse'
  | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Every variant meets WCAG 2.1 AA for its label colour against its background;
 * the pairings are asserted in `tests/unit/design-tokens.test.ts`.
 *
 * `primary` uses `brand-700`, which is the sage measured in the logo itself.
 * White on it is 5.00:1, and it is the mid-olive the approved reference design
 * uses for its primary actions. `accent`/`inverse` pair with an explicit dark
 * ink (`brand-950`), never the semantic `ink` token — both sit on a light
 * fill (the lime accent, or solid white) regardless of the site's own dark
 * theme, so they need dark text unconditionally.
 *
 * `glass` is a dark, translucent surface — it falls back to a near-opaque
 * dark panel where `backdrop-filter` is unsupported, so its label is never
 * left unreadable over busy photography.
 */
const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-700 text-white hover:bg-brand-800 border border-transparent shadow-lift motion-safe:hover:shadow-glow motion-safe:hover:-translate-y-0.5',
  accent:
    'bg-accent-500 text-brand-950 hover:bg-accent-600 border border-transparent motion-safe:hover:shadow-glow motion-safe:hover:-translate-y-0.5',
  secondary:
    'bg-white/8 text-ink border border-white/10 hover:bg-white/14 hover:border-white/20',
  outline:
    'bg-transparent text-accent-300 border border-accent-300/50 hover:bg-white/5 hover:border-accent-300',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-white/10',
  inverse: 'bg-white text-brand-950 hover:bg-sand-100 border border-transparent',
  // `.glass-hover-glow` is a plain CSS rule, not a `hover:shadow-*` utility —
  // see the comment on it in app/globals.css (docs/ui-audit.md finding M3).
  glass: 'glass-surface-strong glass-hover-glow text-ink hover:bg-white/10',
};

/** `min-h` values keep every control at or above the 44px touch target. */
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm gap-1.5',
  md: 'min-h-12 px-5 text-base gap-2',
  lg: 'min-h-14 px-7 text-base sm:text-lg gap-2.5',
};

const base = cn(
  'group inline-flex items-center justify-center rounded-full font-medium',
  'transition-[background-color,box-shadow,transform,color] duration-200 ease-out',
  'motion-safe:active:translate-y-px motion-safe:active:scale-[0.98]',
  'disabled:pointer-events-none disabled:opacity-50',
  // A trailing icon (an arrow, almost always the last child) nudges forward
  // on hover — the icon micro-interaction docs/ui-audit.md finding MO5 asked
  // for, applied once here rather than at each of the ~15 call sites that
  // pass one.
  '[&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200',
  'motion-safe:group-hover:[&>svg:last-child]:translate-x-0.5',
);

function classesFor(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={classesFor(variant, size, fullWidth, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Link styled as a button. Uses `next/link` for internal routes and a plain
 * anchor for external, `tel:` and `https://wa.me/` destinations.
 */
export function ButtonLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  external,
  ...rest
}: {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  external?: boolean;
  'aria-label'?: string;
  'data-testid'?: string;
}) {
  const classes = classesFor(variant, size, fullWidth, className);
  const isExternal = external ?? !href.startsWith('/');

  if (isExternal) {
    const isHttp = href.startsWith('http');
    return (
      <a
        href={href}
        className={classes}
        {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export const buttonClassNames = classesFor;
