import Image from 'next/image';
import Link from 'next/link';
import { Badge, ImageFrame } from '@/components/ui';
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
 * shot of the same design.
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
      className="border-line bg-surface-subtle rounded-lg border p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {design.image ? (
          <div className="w-full shrink-0 sm:w-40">
            <ImageFrame ratio="landscape">
              <Image
                src={design.image.url}
                alt={design.image.alt}
                fill
                sizes="(min-width: 640px) 160px, 100vw"
                className="object-cover"
              />
            </ImageFrame>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-ink-muted text-2xs font-semibold tracking-[0.16em] uppercase">
            {fromPhoto ? 'Quote for this photograph' : 'Quote for this design'}
          </p>

          <p
            className="font-display text-xl font-medium"
            data-testid="captured-design-name"
          >
            {design.name}
          </p>

          {design.occasionName || design.location ? (
            <p className="text-ink-muted text-sm">
              {[design.occasionName, design.location].filter(Boolean).join(' · ')}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge tone="brand">Added automatically</Badge>
            <Link
              href={designHref(design.slug)}
              className="text-brand-700 inline-flex min-h-9 items-center text-sm underline underline-offset-4"
            >
              View this design
            </Link>
          </div>

          <p className="text-ink-muted text-sm">
            {fromPhoto
              ? 'We have recorded the photograph you were looking at and the design it belongs to. You do not need to choose it again.'
              : 'We have recorded this design with your request. You do not need to choose it again.'}
          </p>
        </div>
      </div>
    </div>
  );
}
