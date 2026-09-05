import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { ArrowRightIcon, SparkIcon } from '@/components/layout/icons';
import { designHref } from '@/features/portfolio';
import type { CapturedDesign as CapturedDesignModel } from '../types';

/**
 * The Design this quote request is for — shown, never chosen.
 *
 * Requirements section 11 and CLAUDE.md: "the customer must not re-select the
 * design". So there is no picker, no dropdown and no editable field here. The
 * Design arrives from the link the customer followed, the server re-verifies
 * it, and this component reports the result back to them so they can see the
 * request is attached to the right thing before they send it.
 *
 * When the request started from a specific photograph, that photograph is the
 * one shown — the customer sees the image they clicked, not a different cover
 * shot of the same design — and the panel says so in one line:
 * "I'm requesting a quote for this particular design."
 */
export function CapturedDesign({
  design,
  fromPhoto,
}: {
  design: CapturedDesignModel;
  fromPhoto: boolean;
}) {
  return (
    <div
      data-testid="captured-design"
      data-design-slug={design.slug}
      className="surface-aurora on-deep shine shadow-deep relative isolate overflow-hidden rounded-3xl border border-white/10 p-3 text-white sm:p-4"
    >
      <span
        aria-hidden="true"
        className="ambient-blob bg-accent-500/35 -top-24 -right-16 size-72"
      />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,17rem)_1fr] sm:items-center sm:gap-6">
        {design.image ? (
          <div className="bg-brand-950 relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/15">
            <Image
              src={design.image.url}
              alt={design.image.alt}
              fill
              sizes="(min-width: 640px) 272px, 100vw"
              className="motion-safe:animate-scale-in object-cover"
            />
            <span className="absolute top-3 left-3">
              <Badge tone="lime">
                {fromPhoto ? 'Selected photograph' : 'Selected design'}
              </Badge>
            </span>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-col gap-2 px-1 pb-1 sm:px-0">
          <p className="text-accent-300 text-2xs inline-flex items-center gap-2 font-semibold tracking-[0.18em] uppercase">
            <SparkIcon className="size-3.5" />
            {fromPhoto ? 'Quote for this photograph' : 'Quote for this design'}
          </p>

          <p
            className="font-display text-2xl leading-tight font-medium sm:text-3xl"
            data-testid="captured-design-name"
          >
            {design.name}
          </p>

          {design.occasionName || design.location ? (
            <p className="text-ink-on-deep text-sm">
              {[design.occasionName, design.location].filter(Boolean).join(' · ')}
            </p>
          ) : null}

          <p className="text-ink-on-deep text-sm leading-relaxed">
            You are requesting a quote for this particular design. It stays attached to
            your request, so there is nothing to describe or choose again.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Badge tone="glass">Added automatically</Badge>
            <Link
              href={designHref(design.slug)}
              className="text-accent-200 inline-flex min-h-9 items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
            >
              View this design
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
