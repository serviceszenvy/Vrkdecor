import Image from 'next/image';
import Link from 'next/link';
import { Badge, ImageScrim, Reveal } from '@/components/ui';
import { ArrowRightIcon } from '@/components/layout/icons';
import { cn } from '@/lib/cn';
import { designHref } from '../quote-link';
import { coverImage, type PortfolioDesign } from '../types';

/**
 * Our Signature Work — the four-card composition on the home page.
 *
 * Two by two on a desktop, two across on a tablet and a single column on a
 * phone. Every card has the same proportion and the same treatment, so the
 * four read as one collection: a wide photograph, a glass occasion chip, the
 * name in a scrim, and an arrow that slides in on hover. The cards rise one
 * after another as the section scrolls into view.
 *
 * The designs come from `listFeaturedDesigns(4)`: whatever VRK Decor marks as
 * featured in the Admin Panel, in the sample dataset a wedding, a reception, a
 * baby shower and a birthday celebration.
 *
 * The whole card links to the parent Design's detail page. Related images are
 * never separate cards — they live inside the Design (Requirements section 9).
 */
export function SignatureGrid({ designs }: { designs: readonly PortfolioDesign[] }) {
  return (
    <ul
      data-testid="signature-grid"
      className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6"
    >
      {designs.map((design, index) => {
        const cover = coverImage(design);
        const meta = [design.location, design.styles[0]?.name]
          .filter(Boolean)
          .join(' · ');

        return (
          <Reveal
            as="li"
            key={design.id}
            delay={index * 120}
            effect="scale"
            className="min-w-0"
          >
            <article
              className={cn(
                'group shine press relative isolate overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem]',
                'shadow-card hover:shadow-deep transition-[box-shadow,transform] duration-500',
                'motion-safe:focus-within:-translate-y-1.5 motion-safe:hover:-translate-y-1.5',
              )}
            >
              <div className="bg-surface-muted relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/11]">
                {cover ? (
                  <Image
                    src={cover.url}
                    alt={cover.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 48vw, 94vw"
                    priority={index < 2}
                    className="object-cover motion-safe:transition-transform motion-safe:duration-[1200ms] motion-safe:ease-[var(--ease-out-soft)] motion-safe:group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="from-brand-300 via-brand-500 to-accent-300 h-full w-full bg-gradient-to-br" />
                )}
              </div>

              <ImageScrim strength="strong" />
              <div
                aria-hidden="true"
                className="from-accent-500/0 to-accent-500/25 pointer-events-none absolute inset-0 bg-gradient-to-tr opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                {design.occasion ? (
                  <Badge tone="glass">{design.occasion.name}</Badge>
                ) : (
                  <span />
                )}
                <span className="text-accent-200 rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-xs font-semibold tabular-nums backdrop-blur-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="font-display text-xl leading-snug font-medium text-white sm:text-2xl">
                    <Link
                      href={designHref(design.slug)}
                      className="rounded-sm after:absolute after:inset-0 hover:underline"
                    >
                      {design.name}
                    </Link>
                  </h3>
                  {meta ? <p className="text-sm text-white/80">{meta}</p> : null}
                </div>
                <span
                  aria-hidden="true"
                  className="bg-accent-500 text-brand-950 inline-flex size-11 shrink-0 translate-y-2 items-center justify-center rounded-full opacity-0 shadow-[0_10px_24px_-8px_rgb(142_200_64/0.9)] transition-[opacity,transform] duration-500 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <ArrowRightIcon className="size-5" />
                </span>
              </div>
            </article>
          </Reveal>
        );
      })}
    </ul>
  );
}
