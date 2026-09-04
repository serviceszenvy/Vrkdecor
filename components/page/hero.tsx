import type { ReactNode } from 'react';
import { Container } from '@/components/ui';
import { cn } from '@/lib/cn';
import { LeafDecor } from './leaf-decor';

/**
 * Hero for the inner pages.
 *
 * A calm tinted band rather than a photograph: these pages lead with their own
 * content (a portfolio grid, a service list, a form), and a second full-bleed
 * image above them would compete with it. The home page has its own
 * photographic hero in `home-hero.tsx`.
 *
 * `media` is still accepted for a page that does want a picture beside the
 * headline; the layout takes it without change.
 */
export function Hero({
  eyebrow,
  title,
  accent,
  lead,
  actions,
  media,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  /** Emphasised continuation of the title, in brand green. */
  accent?: string;
  lead?: string;
  actions?: ReactNode;
  media?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6">
      <div
        className={cn(
          'from-brand-800 via-canvas to-brand-950 relative isolate mx-auto w-full max-w-[86rem]',
          'border-line-soft overflow-hidden rounded-3xl border bg-gradient-to-br',
        )}
      >
        <div
          aria-hidden="true"
          className="ambient-blob bg-accent-400/30 motion-safe:animate-drift-slow -top-24 -right-20 size-72"
        />
        <div
          aria-hidden="true"
          className="ambient-blob bg-brand-400/20 motion-safe:animate-drift-slower -bottom-16 -left-16 size-64"
        />
        {/*
          Botanical decoration in the space to the right of the headline. It is
          hidden below `lg`, where the copy fills the panel and there is no
          empty space for it to occupy.
        */}
        {media ? null : (
          <LeafDecor
            className="text-accent-400/25 -right-8 -bottom-16 hidden size-80 lg:block"
            flip
          />
        )}

        <Container width="wide">
          <div
            className={cn(
              'grid items-center gap-10 lg:gap-16',
              media ? 'lg:grid-cols-2' : '',
              compact
                ? 'pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-32 lg:pb-16'
                : 'pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-40 lg:pb-24',
            )}
          >
            <div className="motion-safe:animate-fade-in flex max-w-2xl flex-col gap-4">
              {eyebrow ? (
                <p className="text-accent-300 text-2xs font-semibold tracking-[0.24em] uppercase">
                  {eyebrow}
                </p>
              ) : null}

              <h1
                className={cn(
                  'font-semibold',
                  compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl',
                )}
              >
                {title}
                {accent ? <span className="text-brand-300"> {accent}</span> : null}
              </h1>

              {lead ? (
                <p className="text-ink-soft max-w-xl text-base leading-relaxed sm:text-lg">
                  {lead}
                </p>
              ) : null}

              {actions ? (
                <div className="mt-2 flex flex-wrap gap-3">{actions}</div>
              ) : null}
            </div>

            {/*
              `w-full` is required: a grid item that is only `justify-self-end`
              shrinks to its content, which collapses a percentage-width child
              to zero.
            */}
            {media ? <div className="w-full lg:pl-4">{media}</div> : null}
          </div>
        </Container>
      </div>
    </section>
  );
}
