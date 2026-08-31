import {
  createSupabaseAnonClient,
  isSupabaseConfigured,
} from '@/lib/auth/supabase-anon';
import {
  occasions as approvedOccasions,
  services as approvedServices,
  styles as approvedStyles,
} from '@/lib/content';
import { sampleDesigns } from '@/lib/content/sample-portfolio';
import { withTimeout } from '@/lib/db/with-timeout';
import { resolveImageUrl } from './image-url';
import {
  matchesFilters,
  sortForListing,
  type PortfolioDesign,
  type PortfolioFilters,
  type PortfolioTag,
} from './types';

/**
 * Portfolio reads.
 *
 * Only published Designs are ever returned. That is enforced in three places:
 * Row Level Security (the real boundary), an explicit `status` filter in the
 * query, and — for the sample dataset — the fact that samples exist only when
 * there is no database at all.
 *
 * Filtering by style and service is applied in memory after a single query.
 * Style and service live behind join tables, and expressing those filters in
 * PostgREST requires inner-join syntax that cannot be integration-tested
 * without a live Supabase project. One query plus an in-memory filter is
 * correct, testable and fast at the scale of a decorator's portfolio. If the
 * portfolio grows into the thousands, move the filter into the query and add a
 * test against a live project.
 */

const DESIGN_SELECT = `
  id, name, slug, description, location, quote_mode, starting_price, featured,
  seo_title, seo_description, published_at,
  occasion:occasions ( name, slug ),
  design_styles ( style:styles ( name, slug ) ),
  design_services ( service:services ( name, slug ) ),
  design_images ( id, storage_key, alt_text, sort_order, is_cover, status, width, height ),
  design_videos ( id, provider, url, caption, sort_order )
`;

type RawTag = { name: string; slug: string } | null;

type RawDesign = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  quote_mode: 'custom_quote' | 'starting_from';
  starting_price: number | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  occasion: RawTag;
  design_styles: { style: RawTag }[] | null;
  design_services: { service: RawTag }[] | null;
  design_images:
    | {
        id: string;
        storage_key: string;
        alt_text: string | null;
        sort_order: number;
        is_cover: boolean;
        status: string;
        width: number | null;
        height: number | null;
      }[]
    | null;
  design_videos:
    | {
        id: string;
        provider: 'youtube' | 'instagram' | 'vimeo';
        url: string;
        caption: string | null;
        sort_order: number;
      }[]
    | null;
};

function tags(entries: { style?: RawTag; service?: RawTag }[] | null): PortfolioTag[] {
  return (entries ?? [])
    .map((entry) => entry.style ?? entry.service ?? null)
    .filter((tag): tag is PortfolioTag => tag !== null);
}

function mapDesign(raw: RawDesign): PortfolioDesign {
  const images = (raw.design_images ?? [])
    .filter((image) => image.status === 'published')
    .sort(
      (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
    )
    .map((image) => ({
      id: image.id,
      url: resolveImageUrl(image.storage_key),
      // Per-image alt text overrides; otherwise the parent Design's context is
      // inherited (Requirements section 9).
      alt:
        image.alt_text?.trim() ||
        `${raw.name}${raw.location ? ` — ${raw.location}` : ''}`,
      isCover: image.is_cover,
      sortOrder: image.sort_order,
      width: image.width,
      height: image.height,
    }));

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    occasion: raw.occasion,
    styles: tags(raw.design_styles),
    services: tags(raw.design_services),
    location: raw.location,
    description: raw.description,
    quoteMode: raw.quote_mode,
    startingPrice: raw.starting_price,
    featured: raw.featured,
    seoTitle: raw.seo_title,
    seoDescription: raw.seo_description,
    images,
    videos: (raw.design_videos ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((video) => ({
        id: video.id,
        provider: video.provider,
        url: video.url,
        caption: video.caption,
        sortOrder: video.sort_order,
      })),
  };
}

function lookup(
  list: readonly { name: string; slug: string }[],
  slug: string,
): PortfolioTag {
  return list.find((entry) => entry.slug === slug) ?? { name: slug, slug };
}

/** Builds the sample dataset in the same shape as a database result. */
function buildSampleDesigns(): PortfolioDesign[] {
  return sampleDesigns.map((design) => ({
    id: design.id,
    name: design.name,
    slug: design.slug,
    occasion: lookup(approvedOccasions, design.occasionSlug),
    styles: design.styleSlugs.map((slug) => lookup(approvedStyles, slug)),
    services: design.serviceSlugs.map((slug) => lookup(approvedServices, slug)),
    location: design.location,
    description: design.description,
    quoteMode: 'custom_quote' as const,
    startingPrice: null,
    featured: design.featured,
    seoTitle: null,
    seoDescription: null,
    images: design.images.map((image) => ({
      id: image.id,
      url: resolveImageUrl(image.storageKey),
      alt: image.altText,
      isCover: image.isCover,
      sortOrder: image.sortOrder,
      width: image.width,
      height: image.height,
    })),
    videos: design.videos,
  }));
}

/**
 * True when the portfolio is showing procedurally generated sample content
 * because no database is configured. The UI must display a notice whenever this
 * is true, and it can never be true in staging or production.
 */
export function isShowingSampleContent(): boolean {
  return !isSupabaseConfigured();
}

async function loadPublishedDesigns(): Promise<PortfolioDesign[]> {
  if (!isSupabaseConfigured()) return buildSampleDesigns();

  try {
    const { data, error } = await withTimeout(
      async () =>
        createSupabaseAnonClient()
          .from('designs')
          .select(DESIGN_SELECT)
          .eq('status', 'published')
          .order('featured', { ascending: false })
          .order('published_at', { ascending: false, nullsFirst: false }),
      undefined,
      'portfolio designs',
    );

    if (error || !data) {
      console.error('[portfolio] Could not load designs.');
      return [];
    }

    return (data as unknown as RawDesign[]).map(mapDesign);
  } catch {
    console.error('[portfolio] Could not load designs.');
    return [];
  }
}

export async function listDesigns(
  filters: PortfolioFilters = {},
): Promise<PortfolioDesign[]> {
  const designs = await loadPublishedDesigns();
  return sortForListing(designs.filter((design) => matchesFilters(design, filters)));
}

export async function listFeaturedDesigns(limit = 6): Promise<PortfolioDesign[]> {
  const designs = await loadPublishedDesigns();
  const featured = designs.filter((design) => design.featured);
  return (featured.length > 0 ? featured : designs).slice(0, limit);
}

/**
 * A single published Design by slug, or null.
 *
 * Returns null for a draft, archived or unknown slug, so the route can answer
 * with a 404 that reveals nothing about whether the Design exists.
 */
export async function getDesignBySlug(slug: string): Promise<PortfolioDesign | null> {
  const designs = await loadPublishedDesigns();
  return designs.find((design) => design.slug === slug) ?? null;
}

/** Slugs of every published Design, for static generation and the sitemap (P9). */
export async function listDesignSlugs(): Promise<string[]> {
  const designs = await loadPublishedDesigns();
  return designs.map((design) => design.slug);
}

/**
 * Filter options, restricted to values that actually match a published Design,
 * so the UI never offers a filter that returns nothing.
 */
export async function listFilterOptions(): Promise<{
  occasions: PortfolioTag[];
  styles: PortfolioTag[];
  services: PortfolioTag[];
}> {
  const designs = await loadPublishedDesigns();

  const collect = (pick: (design: PortfolioDesign) => PortfolioTag[]) => {
    const seen = new Map<string, PortfolioTag>();
    for (const design of designs) {
      for (const tag of pick(design)) if (!seen.has(tag.slug)) seen.set(tag.slug, tag);
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  };

  return {
    occasions: collect((design) => (design.occasion ? [design.occasion] : [])),
    styles: collect((design) => design.styles),
    services: collect((design) => design.services),
  };
}
