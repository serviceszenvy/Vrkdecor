import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { sampleDesigns } from '@/lib/content/sample-portfolio';
import { resolveQuoteContext } from '@/features/enquiries/quote-context';

/**
 * Capturing the parent Design — Requirements section 11, Technical Development
 * Specification section 9, CLAUDE.md core business rules.
 *
 * `resolveQuoteContext` is the only route by which a Design enters a quote
 * request, so these are the tests that make "the customer must not re-select
 * the design" true rather than merely intended.
 *
 * The tests run against the sample dataset, which is what the portfolio serves
 * while Supabase is unconfigured — the same code path either way, because
 * `getDesignBySlug` returns published designs only in both modes.
 */

const [firstDesign, secondDesign] = sampleDesigns;

const savedEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

afterEach(() => {
  if (savedEnv.url) process.env.NEXT_PUBLIC_SUPABASE_URL = savedEnv.url;
  if (savedEnv.anonKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedEnv.anonKey;
});

describe('a quote started from nowhere in particular', () => {
  it('captures no design and reports nothing missing', async () => {
    const context = await resolveQuoteContext({});

    expect(context.design).toBeNull();
    expect(context.photo).toBeNull();
    expect(context.requestedDesignUnavailable).toBe(false);
  });
});

describe('a quote started from a Design', () => {
  it('captures the parent Design from its slug alone', async () => {
    const context = await resolveQuoteContext({ design: firstDesign!.slug });

    expect(context.design).not.toBeNull();
    expect(context.design!.id).toBe(firstDesign!.id);
    expect(context.design!.name).toBe(firstDesign!.name);
    expect(context.design!.slug).toBe(firstDesign!.slug);
  });

  it('carries the design occasion and services forward for the form to prefill', async () => {
    const context = await resolveQuoteContext({ design: firstDesign!.slug });

    expect(context.design!.occasionSlug).toBe(firstDesign!.occasionSlug);
    expect(context.design!.serviceSlugs).toEqual(firstDesign!.serviceSlugs);
  });

  it('shows the cover image when no photograph was named', async () => {
    const context = await resolveQuoteContext({ design: firstDesign!.slug });
    const cover = firstDesign!.images.find((image) => image.isCover)!;

    expect(context.photo).toBeNull();
    expect(context.design!.image?.id).toBe(cover.id);
  });
});

describe('a quote started from an individual photograph', () => {
  it('captures the parent Design, not the photograph, as the enquiry subject', async () => {
    const photo = firstDesign!.images[2]!;
    const context = await resolveQuoteContext({
      design: firstDesign!.slug,
      photo: photo.id,
    });

    expect(context.design!.id).toBe(firstDesign!.id);
    expect(context.photo?.id).toBe(photo.id);
  });

  it('shows the photograph the customer actually clicked', async () => {
    const photo = firstDesign!.images[1]!;
    const context = await resolveQuoteContext({
      design: firstDesign!.slug,
      photo: photo.id,
    });

    expect(context.design!.image?.id).toBe(photo.id);
  });

  it('works from every photograph of a design, not just the cover', async () => {
    for (const image of firstDesign!.images) {
      const context = await resolveQuoteContext({
        design: firstDesign!.slug,
        photo: image.id,
      });
      expect(context.design!.id, image.id).toBe(firstDesign!.id);
      expect(context.photo?.id, image.id).toBe(image.id);
    }
  });
});

describe('parameters that cannot be trusted', () => {
  it('discards a photograph belonging to a different design', async () => {
    const foreignPhoto = secondDesign!.images[0]!;
    const context = await resolveQuoteContext({
      design: firstDesign!.slug,
      photo: foreignPhoto.id,
    });

    // The design still resolves; only the mismatched photograph is dropped.
    expect(context.design!.id).toBe(firstDesign!.id);
    expect(context.photo).toBeNull();
  });

  it('discards a photograph id that matches nothing', async () => {
    const context = await resolveQuoteContext({
      design: firstDesign!.slug,
      photo: 'not-a-real-image',
    });

    expect(context.design!.id).toBe(firstDesign!.id);
    expect(context.photo).toBeNull();
  });

  it('captures nothing for a slug that is not a publicly eligible design', async () => {
    const context = await resolveQuoteContext({ design: 'draft-or-invented-design' });

    expect(context.design).toBeNull();
    expect(context.photo).toBeNull();
    expect(context.requestedDesignUnavailable).toBe(true);
  });

  it('reports the same result whether a slug is unpublished or invented', async () => {
    const invented = await resolveQuoteContext({ design: 'totally-made-up' });
    const plausible = await resolveQuoteContext({ design: 'wedding-royal-draft' });

    expect(invented).toEqual(plausible);
  });

  it('ignores an absurdly long parameter instead of looking it up', async () => {
    const context = await resolveQuoteContext({ design: 'x'.repeat(500) });

    expect(context.design).toBeNull();
    expect(context.requestedDesignUnavailable).toBe(false);
  });

  it('ignores an empty or whitespace-only parameter', async () => {
    expect(
      (await resolveQuoteContext({ design: '   ' })).requestedDesignUnavailable,
    ).toBe(false);
  });

  it('trims a slug rather than failing on stray whitespace', async () => {
    const context = await resolveQuoteContext({ design: `  ${firstDesign!.slug} ` });
    expect(context.design!.slug).toBe(firstDesign!.slug);
  });
});
