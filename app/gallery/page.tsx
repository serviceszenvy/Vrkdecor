import type { Metadata } from 'next';
import { CtaBand, EmptyState, Hero } from '@/components/page';
import { ButtonLink, Section } from '@/components/ui';
import { getPublishedDesigns } from '@/lib/db/public-content';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Gallery',
  description:
    'Photographs from weddings, receptions and celebrations designed by VRK Decor across Tamil Nadu.',
  path: '/gallery',
});

/**
 * Gallery — the photo-led view of the same published designs.
 *
 * P4 delivers the route and metadata. The photo grid, lightbox, mobile swipe
 * and photo-level quote CTAs are P5.
 */
export default async function GalleryPage() {
  const designs = await getPublishedDesigns();

  return (
    <>
      <Hero
        compact
        eyebrow="Gallery"
        title="Photographs from our celebrations"
        lead="Every photograph belongs to a design, and every design can start a quote request."
        actions={
          <ButtonLink href={routes.work} variant="primary" size="lg">
            Browse by design
          </ButtonLink>
        }
      />

      <Section width="wide" aria-labelledby="photos">
        <h2 id="photos" className="sr-only">
          Photographs
        </h2>
        <EmptyState
          title={
            designs.length > 0
              ? 'The photo gallery is being finished'
              : 'Photographs are on their way'
          }
          body="VRK Decor is preparing the gallery. In the meantime, browse the designs or tell us about your celebration."
          action={
            <ButtonLink href={routes.work} variant="primary" size="md">
              Explore Our Work
            </ButtonLink>
          }
        />
      </Section>

      <CtaBand />
    </>
  );
}
