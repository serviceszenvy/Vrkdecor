import type { Metadata } from 'next';
import { CtaBand, EmptyState, Hero } from '@/components/page';
import { ButtonLink, Reveal, Section } from '@/components/ui';
import { PhotoGallery, SampleContentNotice } from '@/features/portfolio/components';
import { isShowingSampleContent, listDesigns, toPhotos } from '@/features/portfolio';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Gallery',
  description:
    'Photographs from weddings, receptions and celebrations designed by VRK Decor. Every photograph opens the design it belongs to.',
  path: '/gallery',
});

/**
 * Gallery — every published photograph across the portfolio.
 *
 * A visual wall rather than a catalogue: photographs at their own proportions
 * in a masonry layout on the deep olive surface, with no caption printed under
 * any of them. The design's name appears on hover and in the lightbox, where
 * "Get a Quote" carries both the design and the exact photograph.
 *
 * Each photograph carries its parent Design, so opening one gives both a link
 * to that Design and a quote CTA for it. There is no separate Design record per
 * photograph: this view is a flattening of the same parent Designs shown on
 * Our Work.
 */
export default async function GalleryPage() {
  const designs = await listDesigns();
  const photos = toPhotos(designs);

  return (
    <div className="flex flex-col gap-3 pb-3 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Gallery"
        title="Photographs from"
        accent="our celebrations"
        lead="A wall of recent work. Open any photograph to see it large, then ask for a quote for that design without leaving it."
        actions={
          <ButtonLink href={routes.work} variant="glass-deep" size="lg">
            Browse by design
          </ButtonLink>
        }
      />

      <Section
        tone="panel-deep"
        width="wide"
        spacing="compact"
        aria-labelledby="photos"
        panelClassName="pattern-dots"
      >
        <span
          aria-hidden="true"
          className="ambient-blob bg-accent-500/25 -top-40 right-[15%] size-[30rem]"
        />
        <span
          aria-hidden="true"
          className="ambient-blob ambient-blob-slow bg-brand-400/30 -bottom-48 -left-24 size-[28rem]"
        />

        <h2 id="photos" className="sr-only">
          Photographs
        </h2>

        {isShowingSampleContent() ? (
          <div className="mb-8">
            <SampleContentNotice />
          </div>
        ) : null}

        {photos.length > 0 ? (
          <>
            <Reveal className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-ink-on-deep text-sm">
                {photos.length} photographs from {designs.length}{' '}
                {designs.length === 1 ? 'design' : 'designs'}.
              </p>
              <p className="text-ink-on-deep/80 hidden text-xs sm:block">
                Hover for the design, click to open.
              </p>
            </Reveal>
            <PhotoGallery photos={photos} layout="masonry" />
          </>
        ) : (
          <EmptyState
            title="Photographs are on their way"
            body="We are putting the gallery together. In the meantime, browse the designs or tell us about your celebration."
            action={
              <ButtonLink href={routes.work} variant="lime" size="md">
                Explore Our Work
              </ButtonLink>
            }
          />
        )}
      </Section>

      <CtaBand
        eyebrow="Seen something you like?"
        title="Tell us which design caught your eye."
        accent="We will quote for it."
        lead="Open the photograph and use Get a Quote, and the design comes with your request. Or simply message us on WhatsApp."
      />
    </div>
  );
}
