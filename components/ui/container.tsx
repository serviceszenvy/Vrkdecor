import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerWidth = 'narrow' | 'default' | 'wide' | 'full';

const widths: Record<ContainerWidth, string> = {
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

export function Container({
  children,
  width = 'wide',
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  width?: ContainerWidth;
  className?: string;
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'main';
}) {
  return (
    <Tag
      className={cn('mx-auto w-full px-5 sm:px-6 lg:px-8', widths[width], className)}
    >
      {children}
    </Tag>
  );
}
