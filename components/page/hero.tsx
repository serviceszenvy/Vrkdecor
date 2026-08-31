import type { ReactNode } from 'react';
import { Container } from '@/components/ui';
import { cn } from '@/lib/cn';

/**
 * Page hero.
 *
 * Requirements section 7 asks for a premium hero image or video on the Home
 * page. No approved photography has been supplied yet, so the hero is built to
 * read as finished without one: brand-toned panel, editorial typography and the
 * primary calls to action. When photography arrives, pass it as `media` and the
 * layout accepts it without change.
 */
export function Hero({
  eyebrow,
  title,
  lead,
  actions,
  media,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: ReactNode;
  media?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={cn('bg-surface-subtle border-line border-b')}>
      <Container width="wide">
        <div
          className={cn(
            'grid items-center gap-10 lg:grid-cols-2 lg:gap-16',
            compact ? 'py-12 sm:py-16' : 'py-14 sm:py-20 lg:py-24',
          )}
        >
          <div className="flex flex-col gap-5">
            {eyebrow ? (
              <p className="text-brand-700 text-xs font-semibold tracking-[0.18em] uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                'font-medium',
                compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl',
              )}
            >
              {title}
            </h1>
            {lead ? <p className="text-ink-muted max-w-xl text-lg">{lead}</p> : null}
            {actions ? (
              <div className="mt-2 flex flex-wrap gap-3">{actions}</div>
            ) : null}
          </div>

          {/*
            `w-full` is required: a grid item that is only `justify-self-end`
            shrinks to its content, which collapses a percentage-width child to
            zero.
          */}
          {media ? <div className="w-full lg:pl-4">{media}</div> : null}
        </div>
      </Container>
    </section>
  );
}
