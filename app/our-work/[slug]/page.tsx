import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/page';
import { Badge, ButtonLink, Section } from '@/components/ui';
import {
  PhotoGallery,
  SampleContentNotice,
  VideoEmbed,
} from '@/features/portfolio/components';
import {
  designQuoteHref,
  getDesignBySlug,
  isShowingSampleContent,
  listDesignSlugs,
  toPhotos,
} from '@/features/portfolio';
import { routes } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

/** Pre-renders a page for every published Design. */
export async function generateStaticParams() {
  const slugs = await listDesignSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const design = await getDesignBySlug(slug);

  if (!design) {
    return pageMetadata({
      title: 'Design not found',
      description: 'This design is not available.',
      path: `/our-work/${slug}`,
      index: false,
    });
  }

  const descriptor = [design.occasion?.name, design.location]
    .filter(Boolean)
    .join(' · ');

  return pageMetadata({
    title: design.seoTitle ?? design.name,
    description:
      design.seoDescription ??
      design.description ??
      `${design.name}${descriptor ? ` — ${descriptor}` : ''}. Event decoration by VRK Decor.`,
    path: `/our-work/${design.slug}`,
  });
}

/**
 * Design detail — Requirements section 10.
 *
 * Shows the parent Design's name, occasion, styles, location, services and
 * description once, and the ordered gallery beneath it. Related images inherit
 * all of that context; only alt text can be overridden per image. There is no
 * separate record for a related photograph.
 *
 * A draft, archived or unknown slug produces a 404 that reveals nothing about
 * whether the Design exists.
 */
export default async function DesignDetailPage({ params }: Params) {
  const { slug } = await params;
  const design = await getDesignBySlug(slug);

  if (!design) notFound();

  const photos = toPhotos([design]);
  const [cover, ...related] = photos;

  return (
    <>
      <Section spacing="compact" width="wide" aria-labelledby="design-title">
        {isShowingSampleContent() ? (
          <div className="mb-8">
            <SampleContentNotice />
          </div>
        ) : null}

        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href={routes.work}
            className="text-brand-700 text-sm underline underline-offset-4"
          >
            &larr; All designs
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-1.5">
              {design.occasion ? (
                <Badge tone="brand">{design.occasion.name}</Badge>
              ) : null}
              {design.featured ? <Badge tone="accent">Featured</Badge> : null}
              {design.styles.map((style) => (
                <Badge key={style.slug} tone="neutral">
                  {style.name}
                </Badge>
              ))}
            </div>

            <h1 id="design-title" className="text-4xl font-medium sm:text-5xl">
              {design.name}
            </h1>

            {design.location ? (
              <p className="text-ink-muted text-lg">{design.location}</p>
            ) : null}

            {design.description ? (
              <p className="text-ink-muted text-lg">{design.description}</p>
            ) : null}

            <div className="mt-2 flex flex-wrap gap-3">
              <ButtonLink
                href={designQuoteHref(design.slug)}
                variant="primary"
                size="lg"
                data-testid="design-quote-cta"
              >
                Get Quote for This Design
              </ButtonLink>
            </div>
          </div>

          <dl className="border-line flex flex-col gap-4 rounded-lg border p-6">
            {design.occasion ? (
              <div>
                <dt className="text-ink-muted text-2xs tracking-[0.16em] uppercase">
                  Occasion
                </dt>
                <dd className="text-ink">{design.occasion.name}</dd>
              </div>
            ) : null}

            {design.styles.length > 0 ? (
              <div>
                <dt className="text-ink-muted text-2xs tracking-[0.16em] uppercase">
                  Style
                </dt>
                <dd className="text-ink">
                  {design.styles.map((style) => style.name).join(', ')}
                </dd>
              </div>
            ) : null}

            {design.services.length > 0 ? (
              <div>
                <dt className="text-ink-muted text-2xs tracking-[0.16em] uppercase">
                  Services
                </dt>
                <dd className="text-ink">
                  {design.services.map((service) => service.name).join(', ')}
                </dd>
              </div>
            ) : null}

            <div>
              <dt className="text-ink-muted text-2xs tracking-[0.16em] uppercase">
                Pricing
              </dt>
              <dd className="text-ink">
                {design.quoteMode === 'starting_from' && design.startingPrice !== null
                  ? `Starting from ${new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(design.startingPrice / 100)}`
                  : 'Custom quote'}
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section tone="subtle" width="wide" aria-labelledby="gallery">
        <h2 id="gallery" className="font-display text-3xl font-medium">
          Gallery
        </h2>
        <p className="text-ink-muted mt-2">
          {photos.length} {photos.length === 1 ? 'photograph' : 'photographs'} from this
          design. Open any photograph to request a quote for it.
        </p>

        <div className="mt-8">
          {photos.length > 0 ? (
            <PhotoGallery photos={photos} columns={3} />
          ) : (
            <p className="text-ink-muted">
              Photographs for this design are coming soon.
            </p>
          )}
        </div>

        {cover && related.length > 0 ? (
          <p className="text-ink-muted mt-6 text-sm">
            All {related.length} related{' '}
            {related.length === 1 ? 'photograph belongs' : 'photographs belong'} to this
            design and share its occasion, style, services and location.
          </p>
        ) : null}
      </Section>

      {design.videos.length > 0 ? (
        <Section width="wide" aria-labelledby="video">
          <h2 id="video" className="font-display text-3xl font-medium">
            Video
          </h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {design.videos.map((video) => (
              <VideoEmbed key={video.id} video={video} />
            ))}
          </div>
        </Section>
      ) : null}

      <CtaBand
        title={`Interested in ${design.name}?`}
        lead="Send a quote request and the team will get back to you by phone or WhatsApp. The design you chose is included automatically."
      />
    </>
  );
}
