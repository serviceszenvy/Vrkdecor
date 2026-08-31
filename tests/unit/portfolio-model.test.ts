import { describe, expect, it } from 'vitest';
import {
  coverImage,
  matchesFilters,
  sortForListing,
  toPhotos,
  type PortfolioDesign,
} from '@/features/portfolio/types';
import { designHref, designQuoteHref } from '@/features/portfolio/quote-link';
import { resolveImageUrl } from '@/features/portfolio/image-url';

function design(overrides: Partial<PortfolioDesign> = {}): PortfolioDesign {
  return {
    id: 'design-1',
    name: 'Golden Mandap',
    slug: 'golden-mandap',
    occasion: { name: 'Wedding', slug: 'wedding' },
    styles: [
      { name: 'Royal', slug: 'royal' },
      { name: 'Traditional', slug: 'traditional' },
    ],
    services: [{ name: 'Floral Decoration', slug: 'floral-decoration' }],
    location: 'Nagercoil',
    description: 'A mandap.',
    quoteMode: 'custom_quote',
    startingPrice: null,
    featured: false,
    seoTitle: null,
    seoDescription: null,
    images: [
      {
        id: 'img-1',
        url: '/a.webp',
        alt: 'Cover',
        isCover: true,
        sortOrder: 0,
        width: 1,
        height: 1,
      },
      {
        id: 'img-2',
        url: '/b.webp',
        alt: 'Related',
        isCover: false,
        sortOrder: 1,
        width: 1,
        height: 1,
      },
      {
        id: 'img-3',
        url: '/c.webp',
        alt: 'Related 2',
        isCover: false,
        sortOrder: 2,
        width: 1,
        height: 1,
      },
    ],
    videos: [],
    ...overrides,
  };
}

/**
 * The core portfolio rules from CLAUDE.md and Technical Development
 * Specification section 7.
 */
describe('Design is the parent entity', () => {
  it('flattens to photographs that each still carry their parent Design', () => {
    const photos = toPhotos([design()]);

    expect(photos).toHaveLength(3);
    for (const photo of photos) {
      expect(photo.design.id).toBe('design-1');
      expect(photo.design.slug).toBe('golden-mandap');
      expect(photo.design.occasion?.slug).toBe('wedding');
    }
  });

  it('creates no duplicate Design records for related photographs', () => {
    const photos = toPhotos([design()]);
    const designIds = new Set(photos.map((photo) => photo.design.id));

    expect(designIds.size).toBe(1);
  });

  it('keeps every photograph resolvable to its parent across several designs', () => {
    const photos = toPhotos([
      design(),
      design({
        id: 'design-2',
        slug: 'garden-stage',
        images: [
          {
            id: 'img-4',
            url: '/d.webp',
            alt: 'Cover 2',
            isCover: true,
            sortOrder: 0,
            width: 1,
            height: 1,
          },
        ],
      }),
    ]);

    expect(photos).toHaveLength(4);
    expect(photos.filter((p) => p.design.id === 'design-1')).toHaveLength(3);
    expect(photos.filter((p) => p.design.id === 'design-2')).toHaveLength(1);
    for (const photo of photos) {
      expect(photo.design.slug, photo.image.id).toBeTruthy();
    }
  });

  it('resolves the cover image, falling back to the first image', () => {
    expect(coverImage(design())?.id).toBe('img-1');

    const noCover = design({
      images: [
        {
          id: 'x',
          url: '/x.webp',
          alt: 'x',
          isCover: false,
          sortOrder: 0,
          width: null,
          height: null,
        },
      ],
    });
    expect(coverImage(noCover)?.id).toBe('x');

    expect(coverImage(design({ images: [] }))).toBeNull();
  });
});

describe('every photo can start a quote for its parent Design', () => {
  it('always carries the parent Design, from a design or from a photo', () => {
    expect(designQuoteHref('golden-mandap')).toBe('/quote?design=golden-mandap');
    expect(designQuoteHref('golden-mandap', 'img-2')).toBe(
      '/quote?design=golden-mandap&photo=img-2',
    );
  });

  it('never produces a quote link without a design', () => {
    for (const photo of toPhotos([design()])) {
      const href = designQuoteHref(photo.design.slug, photo.image.id);
      expect(href).toContain('design=golden-mandap');
    }
  });

  it('links a design to its canonical detail page', () => {
    expect(designHref('golden-mandap')).toBe('/our-work/golden-mandap');
  });
});

describe('filtering', () => {
  it('matches on occasion, style and service', () => {
    const d = design();

    expect(matchesFilters(d, {})).toBe(true);
    expect(matchesFilters(d, { occasion: 'wedding' })).toBe(true);
    expect(matchesFilters(d, { occasion: 'birthday' })).toBe(false);
    expect(matchesFilters(d, { style: 'royal' })).toBe(true);
    expect(matchesFilters(d, { style: 'minimal' })).toBe(false);
    expect(matchesFilters(d, { service: 'floral-decoration' })).toBe(true);
    expect(matchesFilters(d, { service: 'food-catering' })).toBe(false);
  });

  it('requires all supplied filters to match', () => {
    const d = design();

    expect(matchesFilters(d, { occasion: 'wedding', style: 'royal' })).toBe(true);
    expect(matchesFilters(d, { occasion: 'wedding', style: 'minimal' })).toBe(false);
  });

  it('places featured designs first', () => {
    const sorted = sortForListing([
      design({ id: 'a', featured: false }),
      design({ id: 'b', featured: true }),
      design({ id: 'c', featured: false }),
    ]);

    expect(sorted[0]?.id).toBe('b');
  });
});

describe('image URL resolution', () => {
  it('builds a public portfolio URL from a storage key', () => {
    expect(resolveImageUrl('designs/abc/def.webp', 'https://example.supabase.co')).toBe(
      'https://example.supabase.co/storage/v1/object/public/portfolio/designs/abc/def.webp',
    );
  });

  it('passes through sample placeholder paths only', () => {
    expect(resolveImageUrl('/samples/wedding-royal-1.webp')).toBe(
      '/samples/wedding-royal-1.webp',
    );
    expect(() => resolveImageUrl('/etc/passwd')).toThrow(/absolute storage key/i);
    expect(() => resolveImageUrl('/admin/secret.png')).toThrow(/absolute storage key/i);
  });
});
