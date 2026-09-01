import { coverImage, getDesignBySlug } from '@/features/portfolio';
import type { PortfolioDesign } from '@/features/portfolio';
import type { CapturedDesign, QuoteContext, QuoteSourcePhoto } from './types';

/**
 * Resolves the Design a quote request is for.
 *
 * This is the single place where `?design=` and `?photo=` become a Design, and
 * it is the reason the customer never re-selects one:
 *
 *   1. The slug is looked up through `getDesignBySlug`, which returns published
 *      Designs only — Row Level Security is the boundary, and the query also
 *      filters on status as defence in depth. A draft, archived, deleted or
 *      invented slug resolves to nothing, indistinguishably.
 *   2. The photograph is accepted only if it is one of that Design's own
 *      published images. A photo id belonging to another Design is discarded,
 *      not followed, so a crafted link cannot cross the parent relationship.
 *   3. The result is re-resolved on submit, from the hidden field, by exactly
 *      this function. Tampering with that field can therefore only ever swap in
 *      another *published* Design — it can never attach a draft one, and there
 *      is no chooser in the UI to be tampered with in the first place.
 *
 * Technical Development Specification section 9; CLAUDE.md core business rules.
 */
export async function resolveQuoteContext(params: {
  design?: string | undefined;
  photo?: string | undefined;
}): Promise<QuoteContext> {
  const slug = normaliseParam(params.design);

  if (!slug) {
    return { design: null, photo: null, requestedDesignUnavailable: false };
  }

  const design = await getDesignBySlug(slug);

  if (!design) {
    return { design: null, photo: null, requestedDesignUnavailable: true };
  }

  const photo = resolvePhoto(design, normaliseParam(params.photo));

  return {
    design: captureDesign(design, photo),
    photo,
    requestedDesignUnavailable: false,
  };
}

/**
 * Trims and length-caps a query parameter before it is used as a lookup key.
 *
 * Slugs and ids are short; anything longer is not a real value and is dropped
 * rather than sent to the database.
 */
function normaliseParam(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return null;
  return trimmed;
}

function resolvePhoto(
  design: PortfolioDesign,
  photoId: string | null,
): QuoteSourcePhoto | null {
  if (!photoId) return null;
  const image = design.images.find((candidate) => candidate.id === photoId);
  if (!image) return null;
  return { id: image.id, url: image.url, alt: image.alt };
}

function captureDesign(
  design: PortfolioDesign,
  photo: QuoteSourcePhoto | null,
): CapturedDesign {
  const cover = coverImage(design);

  return {
    id: design.id,
    name: design.name,
    slug: design.slug,
    occasionSlug: design.occasion?.slug ?? null,
    occasionName: design.occasion?.name ?? null,
    location: design.location,
    serviceSlugs: design.services.map((service) => service.slug),
    // Show the photograph they actually clicked when there is one; the cover
    // otherwise. Either way the customer sees what the request is attached to.
    image: photo ?? (cover ? { id: cover.id, url: cover.url, alt: cover.alt } : null),
  };
}
