import type { CSSProperties, ReactNode } from 'react';
import { Container } from '@/components/ui';
import { cn } from '@/lib/cn';
import { LeafDecor } from './leaf-decor';

/**
 * Hero for the inner pages.
 *
 * The same dark olive stage as the home hero, in a shorter form: every page
 * opens on the brand's own colour before handing over to its content on the
 * light ground. The copy staggers in on load; the ambient light drifts on its
 * own and is stilled under `prefers-reduced-motion`.
 *
 * `media` is accepted for a page that wants a picture beside the headline;
 * the layout takes it without change.
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
  /** Emphasised continuation of the title, in lime. */
  accent?: string;
  lead?: string;
  actions?: ReactNode;
  media?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="px-3 pt-2 sm:px-5 sm:pt-2.5 lg:px-6 lg:pt-3">
      <div
        className={cn(
          'surface-aurora on-deep relative isolate mx-auto w-full max-w-[86rem] text-white',
          'shadow-deep overflow-hidden rounded-[2rem] border border-white/10',
        )}
      >
        <span
          aria-hidden="true"
          className="ambient-blob bg-accent-500/40 -top-32 -right-24 size-[26rem]"
        />
        <span
          aria-hidden="true"
          className="ambient-blob ambient-blob-slow bg-brand-400/40 -bottom-40 -left-24 size-[24rem]"
        />
        <div
          aria-hidden="true"
          className="pattern-dots absolute inset-0 -z-10 opacity-50"
        />
        {/*
          Botanical decoration in the space to the right of the headline. It is
          hidden below `lg`, where the copy fills the panel and there is no
          empty space for it to occupy.
        */}
        {media ? null : (
          <LeafDecor
            className="text-accent-200/25 -right-8 -bottom-16 hidden size-80 lg:block"
            flip
          />
        )}

        <Container width="wide">
          <div
            className={cn(
              'grid items-center gap-10 lg:gap-16',
              media ? 'lg:grid-cols-2' : '',
              compact
                ? 'pt-12 pb-10 sm:pt-14 sm:pb-12 lg:pt-16 lg:pb-16'
                : 'pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-24',
            )}
          >
            <div className="stagger flex max-w-2xl flex-col gap-4">
              {eyebrow ? (
                <p
                  className="text-accent-300 text-2xs inline-flex items-center gap-2.5 font-semibold tracking-[0.24em] uppercase"
                  style={{ '--i': 0 } as CSSProperties}
                >
                  <span className="bg-accent-400 inline-block size-2 rounded-full shadow-[0_0_0_4px_rgb(142_200_64/0.25)]" />
                  {eyebrow}
                </p>
              ) : null}

              <h1
                className={cn(
                  'font-medium',
                  compact ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl',
                )}
                style={{ '--i': 1 } as CSSProperties}
              >
                {title}
                {accent ? <span className="text-gradient-lime"> {accent}</span> : null}
              </h1>

              {lead ? (
                <p
                  className="text-ink-on-deep max-w-xl text-base leading-relaxed sm:text-lg"
                  style={{ '--i': 2 } as CSSProperties}
                >
                  {lead}
                </p>
              ) : null}

              {actions ? (
                <div
                  className="mt-2 flex flex-wrap gap-3"
                  style={{ '--i': 3 } as CSSProperties}
                >
                  {actions}
                </div>
              ) : null}
            </div>

            {/*
              `w-full` is required: a grid item that is only `justify-self-end`
              shrinks to its content, which collapses a percentage-width child
              to zero.
            */}
            {media ? (
              <div className="w-full motion-safe:animate-[scale-in_0.9s_var(--ease-out-soft)_0.3s_both] lg:pl-4">
                {media}
              </div>
            ) : null}
          </div>
        </Container>
      </div>
    </section>
  );
}
