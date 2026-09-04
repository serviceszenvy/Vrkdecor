import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/page';
import { Badge, ButtonLink, ImageFrame, Section } from '@/components/ui';
import {
  PhotoGallery,
  PrevNextWork,
  SampleContentNotice,
  VideoEmbed,
} from '@/features/portfolio/components';
import {
  designQuoteHref,
  getDesignBySlug,
  isShowingSampleContent,
  listDesigns,
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
      `${design.name}${descriptor ? `, ${descriptor}` : ''}. Event decoration by VRK Decor.`,
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

  const allDesigns = await listDesigns();
  const photos = toPhotos([design]);
  const [cover, ...related] = photos;

  return (
    <div className="flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6">
      <Section
        tone="panel"
        spacing="compact"
        width="wide"
        aria-labelledby="design-title"
      >
        {isShowingSampleContent() ? (
          <div className="mb-8">
            <SampleContentNotice />
          </div>
        ) : null}

        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href={routes.work}
            className="text-accent-300 inline-flex min-h-9 items-center text-sm underline underline-offset-4"
          >
            &larr; All designs
          </Link>
        </nav>

        {/*
          The cover photograph leads, which is the point of a portfolio page.
          It is the same image as the first item in the gallery below, so it
          costs no extra request, and it is the only image on the page marked
          `priority`.
        */}
        {cover ? (
          <ImageFrame ratio="wide" radius="2xl" className="mb-10">
            <Image
              src={cover.image.url}
              alt={cover.image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="object-cover"
            />
          </ImageFrame>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
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

          <dl className="border-accent-400/25 from-surface-tint to-canvas-deep flex flex-col gap-4 rounded-3xl border bg-gradient-to-br p-6 sm:p-7">
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

      <Section tone="panel" width="wide" aria-labelledby="gallery">
        <h2 id="gallery" className="font-display text-3xl font-medium">
          Gallery
        </h2>
        <p className="text-ink-muted mt-2">
          {photos.length} {photos.length === 1 ? 'photograph' : 'photographs'} from this
          design. Open any one of them to ask for a quote.
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

        <div className="mt-10">
          <PrevNextWork designs={allDesigns} currentSlug={design.slug} />
        </div>
      </Section>

      {design.videos.length > 0 ? (
        <Section tone="panel" width="wide" aria-labelledby="video">
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
        accent="Let us know your date."
        lead="Send a quote request and we will come back to you on the phone or on WhatsApp. The design you picked comes with it, so there is nothing to describe again."
      />
    </div>
  );
}
