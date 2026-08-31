import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Every variant meets WCAG 2.1 AA for its label colour against its background;
 * the pairings are asserted in `tests/unit/design-tokens.test.ts`.
 */
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-800 text-white hover:bg-brand-900 border border-transparent',
  accent: 'bg-accent-500 text-ink hover:bg-accent-600 border border-transparent',
  secondary: 'bg-sand-100 text-ink hover:bg-sand-200 border border-transparent',
  outline: 'bg-transparent text-brand-700 border border-brand-700 hover:bg-brand-50',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-sand-100',
  inverse: 'bg-white text-ink hover:bg-sand-100 border border-transparent',
};

/** `min-h` values keep every control at or above the 44px touch target. */
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm gap-1.5',
  md: 'min-h-12 px-5 text-base gap-2',
  lg: 'min-h-14 px-7 text-lg gap-2.5',
};

const base = cn(
  'inline-flex items-center justify-center rounded-md font-medium',
  'transition-colors duration-150',
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
