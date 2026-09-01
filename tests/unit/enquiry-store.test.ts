import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

/**
 * The local enquiry store is a development and testing convenience, and it must
 * never be able to swallow a real lead.
 *
 * The invariant mirrors the one the sample portfolio content is held to: the
 * store exists only while Supabase is unconfigured, which is impossible in
 * staging and production.
 */

const enquiry = {
  name: 'Meena Rajan',
  phone: '+919994072435',
  email: null,
  eventType: 'wedding',
  eventDate: '2026-12-14',
  venue: 'Sea View Hall',
  city: 'Nagercoil',
  guestCount: null,
  budget: null,
  requiredServices: ['stage-mandap-decoration'],
  notes: null,
  consent: true as const,
  designId: 'design-1',
  imageId: 'image-1',
};

describe('local enquiry store safety', () => {
  it('is active only when Supabase is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    const unconfigured = await import('@/features/enquiries/store');
    expect(unconfigured.isUsingLocalEnquiryStore()).toBe(true);

    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    const configured = await import('@/features/enquiries/store');
    expect(configured.isUsingLocalEnquiryStore()).toBe(false);
  });

  it('refuses to store anything once Supabase is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    const { storeEnquiryLocally } = await import('@/features/enquiries/store');
    expect(() => storeEnquiryLocally(enquiry, 'fingerprint')).toThrow(
      /must never be used while Supabase is configured/,
    );
  });

  it('refuses to read anything back once Supabase is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    const { listLocalEnquiries } = await import('@/features/enquiries/store');
    expect(() => listLocalEnquiries()).toThrow();
  });
});

describe('local enquiry store behaviour', () => {
  it('keeps the parent Design and originating photograph with the enquiry', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const store = await import('@/features/enquiries/store');
    store.resetLocalEnquiries();

    const stored = store.storeEnquiryLocally(enquiry, 'fingerprint');

    expect(stored.designId).toBe('design-1');
    expect(stored.imageId).toBe('image-1');
    expect(stored.status).toBe('new');
    expect(store.countLocalEnquiries()).toBe(1);
  });

  it('never keeps more than three reference images against one enquiry', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const store = await import('@/features/enquiries/store');
    store.resetLocalEnquiries();

    const image = {
      storageKey: 'references/x.jpg',
      originalFilename: 'x.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
    };

    const stored = store.storeEnquiryLocally(
      { ...enquiry, referenceImages: [image, image, image, image] },
      'fingerprint',
    );

    expect(stored.referenceImageCount).toBe(3);
  });

  it('does not leak the duplicate fingerprint through the listing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const store = await import('@/features/enquiries/store');
    store.resetLocalEnquiries();
    store.storeEnquiryLocally(enquiry, 'fingerprint');

    expect(store.listLocalEnquiries()[0]).not.toHaveProperty('fingerprint');
  });
});
