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
  | 'glass'
  | 'glass-deep'
  | 'lime'
  | 'deep';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Every variant meets WCAG 2.1 AA for its label colour against its background;
 * the pairings are asserted in `tests/unit/design-tokens.test.ts`.
 *
 * `primary` uses `brand-700`, which is the sage measured in the logo itself.
 * White on it is 5.00:1, and it is the mid-olive the approved reference design
 * uses for its primary actions.
 *
 * `glass` is the white pill from the reference — a translucent surface that
 * sits on photography without hiding it. It falls back to a near-opaque white
 * panel where `backdrop-filter` is unsupported, so its label is never left
 * floating on an image.
 */
const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-700 text-white hover:bg-brand-800 border border-transparent shine shadow-[0_12px_28px_-12px_rgb(36_44_28/0.85),0_0_0_1px_rgb(142_200_64/0.2)] hover:shadow-[0_16px_34px_-12px_rgb(36_44_28/0.9),0_0_0_1px_rgb(142_200_64/0.45)]',
  accent: 'bg-accent-500 text-ink hover:bg-accent-600 border border-transparent shine',
  secondary: 'bg-sand-100 text-ink hover:bg-sand-200 border border-transparent',
  outline: 'bg-transparent text-brand-700 border border-brand-700 hover:bg-brand-50',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-sand-100',
  inverse: 'bg-white text-ink hover:bg-sand-100 border border-transparent',
  glass: 'glass-surface-strong text-ink hover:bg-white',
  /* A translucent pill for the dark surfaces: white text, lime on hover. */
  'glass-deep':
    'glass-surface-deep text-white hover:text-accent-200 hover:border-accent-400/60 shine',
  /* The lime pill: the brightest action on the site, reserved for one CTA. */
  lime: 'bg-accent-500 text-brand-950 hover:bg-accent-400 border border-transparent shine shadow-[0_14px_34px_-12px_rgb(142_200_64/0.8)]',
  /* Dark olive pill on the light ground. */
  deep: 'bg-brand-900 text-white hover:bg-brand-950 border border-transparent shine shadow-[0_12px_28px_-12px_rgb(36_44_28/0.8)]',
};

/** `min-h` values keep every control at or above the 44px touch target. */
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm gap-1.5',
  md: 'min-h-12 px-5 text-base gap-2',
  lg: 'min-h-14 px-7 text-base sm:text-lg gap-2.5',
};

const base = cn(
  'inline-flex items-center justify-center rounded-full font-medium',
  'transition-[background-color,box-shadow,transform,color,border-color] duration-300',
  'motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-px',
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
