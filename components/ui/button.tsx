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
 * DARK THEME — `primary` is the logo's lime (`accent-500`), the most vivid
 * colour available, used as the CTA colour against the dark `#37432B` ground.
 * Dark text on it is 8.22:1. `accent` is a softer sage pill for secondary
 * emphasis. `glass` is now dark translucent glass rather than a white pill,
 * so it reads correctly floating on the dark ground and on photography.
 */
const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-500 text-ink-inverse hover:bg-accent-600 border border-transparent shadow-[0_10px_28px_-12px_rgb(142_200_64/0.55)]',
  accent:
    'bg-brand-400 text-ink-inverse hover:bg-brand-500 border border-transparent',
  secondary: 'bg-surface-muted text-ink hover:bg-surface border border-line-soft',
  outline:
    'bg-transparent text-accent-300 border border-accent-400/50 hover:bg-accent-500/10 hover:border-accent-300',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-surface-muted',
  inverse: 'bg-ink text-canvas hover:bg-white border border-transparent',
  glass: 'glass-surface-strong text-ink hover:border-accent-300/40',
};

/** `min-h` values keep every control at or above the 44px touch target. */
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm gap-1.5',
  md: 'min-h-12 px-5 text-base gap-2',
  lg: 'min-h-14 px-7 text-base sm:text-lg gap-2.5',
};

const base = cn(
  'inline-flex items-center justify-center rounded-full font-medium',
  'transition-[background-color,box-shadow,transform,color] duration-200',
  'motion-safe:active:translate-y-px',
  'disabled:pointer-events-none disabled:opacity-50',
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
