import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/page';
import { Badge, ButtonLink, Reveal, Section } from '@/components/ui';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/layout/icons';
import {
  PhotoGallery,
  SampleContentNotice,
  VideoEmbed,
  WorkNav,
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
 * Previous / Next navigation lets a visitor move through the whole collection
 * without returning to Our Work. The order is the listing order, so it is the
 * same sequence they were browsing.
 *
 * A draft, archived or unknown slug produces a 404 that reveals nothing about
 * whether the Design exists.
 */
export default async function DesignDetailPage({ params }: Params) {
  const { slug } = await params;
  const [design, collection] = await Promise.all([
    getDesignBySlug(slug),
    listDesigns(),
  ]);

  if (!design) notFound();

  const photos = toPhotos([design]);
  const [cover, ...related] = photos;
  const index = collection.findIndex((entry) => entry.slug === design.slug);
  const position =
    index >= 0
      ? `${String(index + 1).padStart(2, '0')} / ${String(collection.length).padStart(2, '0')}`
      : null;

  return (
    <div className="flex flex-col gap-3 pb-3 sm:gap-6 sm:pb-6">
      <Section
        tone="panel"
        spacing="compact"
        width="wide"
        aria-labelledby="design-title"
        className="pt-2 sm:pt-2.5 lg:pt-3"
      >
        {isShowingSampleContent() ? (
          <div className="mb-8">
            <SampleContentNotice />
          </div>
        ) : null}

        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center justify-between gap-3"
        >
          <Link
            href={routes.work}
            className="text-brand-800 hover:text-brand-900 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
          >
            <ArrowLeftIcon className="size-4" />
            All designs
          </Link>
          {position ? (
            <span className="text-ink-muted text-sm tabular-nums">
              <span className="sr-only">Design </span>
              {position}
            </span>
          ) : null}
        </nav>

        {/*
          The cover photograph leads, which is the point of a portfolio page.
          It is the same image as the first item in the gallery below, so it
          costs no extra request, and it is the only image on the page marked
          `priority`.
        */}
        {cover ? (
          <Reveal effect="mask" className="mb-8 sm:mb-10">
            <div className="bg-surface-muted shadow-deep relative isolate aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] sm:aspect-[16/9] lg:aspect-[21/9]">
              <Image
                src={cover.image.url}
                alt={cover.image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 80vw, 100vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="from-brand-950/60 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-7">
                <div className="flex flex-wrap gap-2">
                  {design.occasion ? (
                    <Badge tone="lime">{design.occasion.name}</Badge>
                  ) : null}
                  {design.featured ? <Badge tone="glass">Featured</Badge> : null}
                </div>
                {design.location ? (
                  <p className="text-sm font-medium text-white/90">{design.location}</p>
                ) : null}
              </div>
            </div>
          </Reveal>
        ) : null}

        <div className="grid gap-7 sm:gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <Reveal effect="left" className="flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-wrap gap-2">
              {design.styles.map((style) => (
                <Badge key={style.slug} tone="brand">
                  {style.name}
                </Badge>
              ))}
            </div>

            <h1 id="design-title" className="text-3xl font-medium sm:text-5xl">
              {design.name}
            </h1>

            {design.description ? (
              <p className="text-ink-muted text-lg leading-relaxed">
                {design.description}
              </p>
            ) : null}

            <div className="mt-2 flex flex-wrap gap-3">
              <ButtonLink
                href={designQuoteHref(design.slug)}
                variant="primary"
                size="lg"
                data-testid="design-quote-cta"
              >
                Get Quote for This Design
                <ArrowRightIcon className="size-4" />
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal
            effect="right"
            delay={120}
            as="div"
            className="surface-bloom border-brand-200/60 shadow-card flex flex-col gap-4 rounded-2xl border p-5 sm:rounded-3xl sm:p-7"
          >
            <dl className="flex flex-col gap-4">
              {design.occasion ? (
                <div>
                  <dt className="text-brand-800 text-2xs font-semibold tracking-[0.16em] uppercase">
                    Occasion
                  </dt>
                  <dd className="text-ink mt-0.5">{design.occasion.name}</dd>
                </div>
              ) : null}

              {design.location ? (
                <div>
                  <dt className="text-brand-800 text-2xs font-semibold tracking-[0.16em] uppercase">
                    Location
                  </dt>
                  <dd className="text-ink mt-0.5">{design.location}</dd>
                </div>
              ) : null}

              {design.styles.length > 0 ? (
                <div>
                  <dt className="text-brand-800 text-2xs font-semibold tracking-[0.16em] uppercase">
                    Style
                  </dt>
                  <dd className="text-ink mt-0.5">
                    {design.styles.map((style) => style.name).join(', ')}
                  </dd>
                </div>
              ) : null}

              {design.services.length > 0 ? (
                <div>
                  <dt className="text-brand-800 text-2xs font-semibold tracking-[0.16em] uppercase">
                    Services
                  </dt>
                  <dd className="text-ink mt-0.5">
                    {design.services.map((service) => service.name).join(', ')}
                  </dd>
                </div>
              ) : null}

              <div>
                <dt className="text-brand-800 text-2xs font-semibold tracking-[0.16em] uppercase">
                  Pricing
                </dt>
                <dd className="text-ink mt-0.5">
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
          </Reveal>
        </div>
      </Section>

      <Section tone="panel" width="wide" aria-labelledby="gallery">
        <Reveal>
          <h2 id="gallery" className="font-display text-2xl font-medium sm:text-3xl">
            Gallery
          </h2>
          <p className="text-ink-muted mt-2">
            {photos.length} {photos.length === 1 ? 'photograph' : 'photographs'} from
            this design. Open any one of them to ask for a quote.
          </p>
        </Reveal>

        <div className="mt-6 sm:mt-8">
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
        <Section tone="panel" width="wide" aria-labelledby="video">
          <h2 id="video" className="font-display text-2xl font-medium sm:text-3xl">
            Video
          </h2>
          <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-2">
            {design.videos.map((video) => (
              <VideoEmbed key={video.id} video={video} />
            ))}
          </div>
        </Section>
      ) : null}

      <WorkNav designs={collection} current={design} />

      <CtaBand
        eyebrow="Like this design?"
        quoteHref={designQuoteHref(design.slug)}
        title={`Interested in ${design.name}?`}
        accent="Let us know your date."
        lead="Send a quote request and we will come back to you on the phone or on WhatsApp. The design you picked comes with it, so there is nothing to describe again."
      />
    </div>
  );
}
