import type { Metadata } from 'next';
import { CtaBand, EmptyState, Hero } from '@/components/page';
import { ButtonLink, Section } from '@/components/ui';
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
 * Each photograph carries its parent Design, so opening one gives both a link
 * to that Design and a quote CTA for it. There is no separate Design record per
 * photograph: this view is a flattening of the same parent Designs shown on
 * Our Work.
 */
export default async function GalleryPage() {
  const designs = await listDesigns();
  const photos = toPhotos(designs);

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Hero
        compact
        eyebrow="Gallery"
        title="Photographs from"
        accent="our celebrations"
        lead="Open any photograph to see the design it belongs to and ask for a quote for it."
        actions={
          <ButtonLink href={routes.work} variant="primary" size="lg">
            Browse by design
          </ButtonLink>
        }
      />

      <Section tone="panel" width="wide" aria-labelledby="photos">
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
            <p className="text-ink-muted mb-6 text-sm">
              {photos.length} photographs from {designs.length}{' '}
              {designs.length === 1 ? 'design' : 'designs'}.
            </p>
            <PhotoGallery photos={photos} columns={4} variant="masonry" />
          </>
        ) : (
          <EmptyState
            title="Photographs are on their way"
            body="We are putting the gallery together. In the meantime, browse the designs or tell us about your celebration."
            action={
              <ButtonLink href={routes.work} variant="primary" size="md">
                Explore Our Work
              </ButtonLink>
            }
          />
        )}
      </Section>

      <CtaBand />
    </div>
  );
}
