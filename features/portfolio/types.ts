/**
 * Portfolio view models.
 *
 * The core rule from CLAUDE.md and the Technical Development Specification
 * section 7: a Design is the parent entity, and every image belongs to exactly
 * one Design. `PortfolioPhoto` therefore always carries its parent, which is
 * what makes "every photo can start a quote for its parent Design" true by
 * construction rather than by convention.
 */

export type PortfolioTag = {
  name: string;
  slug: string;
};

export type PortfolioImage = {
  id: string;
  /** Resolved, renderable URL. */
  url: string;
  /**
   * Per-image alt text when the admin supplied one; otherwise inherited from
   * the parent Design (Requirements section 9: alt text may be overridden per
   * image, everything else is inherited).
   */
  alt: string;
  isCover: boolean;
  sortOrder: number;
  width: number | null;
  height: number | null;
};

export type PortfolioVideo = {
  id: string;
  provider: 'youtube' | 'instagram' | 'vimeo';
  url: string;
  caption: string | null;
  sortOrder: number;
};

export type PortfolioDesign = {
  id: string;
  name: string;
  slug: string;
  occasion: PortfolioTag | null;
  styles: PortfolioTag[];
  services: PortfolioTag[];
  location: string | null;
  description: string | null;
  quoteMode: 'custom_quote' | 'starting_from';
  startingPrice: number | null;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  images: PortfolioImage[];
  videos: PortfolioVideo[];
};

/** The cover image, falling back to the first ordered image. */
export function coverImage(design: PortfolioDesign): PortfolioImage | null {
  return design.images.find((image) => image.isCover) ?? design.images[0] ?? null;
}

/**
 * A single photograph together with the Design it belongs to.
 *
 * This is the type the gallery and lightbox use, so a photo can never be
 * rendered without the information needed to open its parent Design or start a
 * quote for it.
 */
export type PortfolioPhoto = {
  image: PortfolioImage;
  design: Pick<PortfolioDesign, 'id' | 'name' | 'slug' | 'occasion' | 'location'>;
};

/** Flattens designs into photos, each still carrying its parent. */
export function toPhotos(designs: readonly PortfolioDesign[]): PortfolioPhoto[] {
  return designs.flatMap((design) =>
    design.images.map((image) => ({
      image,
      design: {
        id: design.id,
        name: design.name,
        slug: design.slug,
        occasion: design.occasion,
        location: design.location,
      },
    })),
  );
}

export type PortfolioFilters = {
  occasion?: string | undefined;
  style?: string | undefined;
  service?: string | undefined;
};

/** Applies occasion, style and service filters (Requirements section 8). */
export function matchesFilters(
  design: PortfolioDesign,
  filters: PortfolioFilters,
): boolean {
  if (filters.occasion && design.occasion?.slug !== filters.occasion) return false;
  if (filters.style && !design.styles.some((s) => s.slug === filters.style))
    return false;
  if (filters.service && !design.services.some((s) => s.slug === filters.service)) {
    return false;
  }
  return true;
}

/** Featured designs first, then most recently published. */
export function sortForListing(designs: PortfolioDesign[]): PortfolioDesign[] {
  return [...designs].sort((a, b) => Number(b.featured) - Number(a.featured));
}
