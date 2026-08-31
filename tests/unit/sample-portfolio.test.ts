import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sampleDesigns } from '@/lib/content/sample-portfolio';
import { occasions, services, styles } from '@/lib/content';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

/**
 * The sample portfolio is placeholder content for layout review. It must never
 * be able to appear on a configured environment.
 */
describe('sample content safety', () => {
  it('is active only when Supabase is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    const unconfigured = await import('@/features/portfolio/data');
    expect(unconfigured.isShowingSampleContent()).toBe(true);

    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    const configured = await import('@/features/portfolio/data');
    expect(configured.isShowingSampleContent()).toBe(false);
  });

  it('falls back to an empty portfolio, never to samples, when a configured database fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    // No network: the client is stubbed to fail the way an unreachable
    // database would.
    vi.doMock('@/lib/auth/supabase-anon', () => ({
      isSupabaseConfigured: () => true,
      createSupabaseAnonClient: () => {
        throw new Error('unreachable');
      },
    }));

    const { listDesigns } = await import('@/features/portfolio/data');
    expect(await listDesigns()).toEqual([]);
  });
});

describe('sample dataset integrity', () => {
  it('uses only approved occasion, style and service slugs', () => {
    const occasionSlugs = new Set(occasions.map((o) => o.slug));
    const styleSlugs = new Set(styles.map((s) => s.slug));
    const serviceSlugs = new Set(services.map((s) => s.slug));

    for (const design of sampleDesigns) {
      expect(occasionSlugs.has(design.occasionSlug), design.slug).toBe(true);
      for (const slug of design.styleSlugs)
        expect(styleSlugs.has(slug), slug).toBe(true);
      for (const slug of design.serviceSlugs)
        expect(serviceSlugs.has(slug), slug).toBe(true);
    }
  });

  it('gives every design exactly one cover image and unique slugs', () => {
    const slugs = new Set<string>();

    for (const design of sampleDesigns) {
      expect(slugs.has(design.slug), design.slug).toBe(false);
      slugs.add(design.slug);

      const covers = design.images.filter((image) => image.isCover);
      expect(covers, design.slug).toHaveLength(1);
      expect(design.images.length, design.slug).toBeGreaterThan(1);
    }
  });

  it('gives every image alt text and a sample-scoped storage key', () => {
    for (const design of sampleDesigns) {
      for (const image of design.images) {
        expect(image.altText.length, image.id).toBeGreaterThan(3);
        expect(image.storageKey.startsWith('/samples/'), image.id).toBe(true);
      }
    }
  });

  it('ships an image file for every referenced sample key', () => {
    for (const design of sampleDesigns) {
      for (const image of design.images) {
        const path = fileURLToPath(
          new URL(`../../public${image.storageKey}`, import.meta.url),
        );
        expect(() => readFileSync(path), image.storageKey).not.toThrow();
      }
    }
  });

  it('includes at least one featured design and one video, to exercise both paths', () => {
    expect(sampleDesigns.some((design) => design.featured)).toBe(true);
    expect(sampleDesigns.some((design) => design.videos.length > 0)).toBe(true);
  });
});
