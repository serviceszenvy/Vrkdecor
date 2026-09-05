import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerWidth = 'narrow' | 'default' | 'wide' | 'full';

const widths: Record<ContainerWidth, string> = {
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-[82rem]',
  full: 'max-w-none',
};

/**
 * The page container.
 *
 * The horizontal padding comes from the `gutter` utility in `app/globals.css`
 * rather than from `px-*` here, because it has to absorb the safe-area inset
 * as well as the design gutter. On a notched phone turned sideways that inset
 * is over 40px, and content that only had `px-4` was sitting underneath the
 * camera housing.
 *
 * `flush` drops the gutter for the rare child that manages its own inset (the
 * figures band, which is flush with the rounded panel above it).
 */
export function Container({
  children,
  width = 'wide',
  className,
  flush = false,
  as: Tag = 'div',
}: {
  children: ReactNode;
  width?: ContainerWidth;
  className?: string;
  flush?: boolean;
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'main';
}) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full',
        flush ? 'inset-safe-x' : 'gutter',
        widths[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
