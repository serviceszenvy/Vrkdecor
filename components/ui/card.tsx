import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Surface container for portfolio designs, services, packages and testimonials.
 * `interactive` adds the hover lift used when the whole card is a link target.
 */
export function Card({
  children,
  className,
  interactive = false,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: 'div' | 'article' | 'li';
}) {
  return (
    <Tag
      className={cn(
        'border-line bg-surface overflow-hidden rounded-lg border',
        interactive &&
          'shadow-card hover:shadow-raised focus-within:shadow-raised transition-shadow duration-200',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('flex flex-col gap-2 p-5', className)}>{children}</div>;
}

export function CardTitle({
  children,
  className,
  as: Tag = 'h3',
}: {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}) {
  return (
    <Tag className={cn('font-display text-xl font-medium', className)}>{children}</Tag>
  );
}

export function CardMeta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn('text-ink-muted text-sm', className)}>{children}</p>;
}
