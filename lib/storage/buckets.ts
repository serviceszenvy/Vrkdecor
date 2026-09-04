/**
 * Supabase Storage configuration.
 *
 * Source of truth: Technical Development Specification section 11, Master
 * Implementation Specification section 8, Requirements & SOW section 13.
 * The values here mirror the bucket definitions in
 * `supabase/migrations/20260831120200_storage.sql`; a database test asserts
 * they match.
 *
 * Upload limits are a developer decision documented per Master Implementation
 * Specification section 18 and recorded in 09_DECISIONS/DECISIONS.md.
 */

export const PORTFOLIO_BUCKET = 'portfolio' as const;
export const REFERENCE_BUCKET = 'references' as const;

export type BucketId = typeof PORTFOLIO_BUCKET | typeof REFERENCE_BUCKET;

export const BUCKETS = {
  [PORTFOLIO_BUCKET]: {
    id: PORTFOLIO_BUCKET,
    public: true,
    maxBytes: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
  [REFERENCE_BUCKET]: {
    id: REFERENCE_BUCKET,
    public: false,
    // Requirements & SOW section 13: up to 3 JPG/JPEG, PNG or WEBP images.
    maxBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
} as const;

/** Requirements & SOW section 13 and CLAUDE.md. */
export const MAX_REFERENCE_IMAGES_PER_ENQUIRY = 3;

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export function extensionForMimeType(mimeType: string): string | null {
  return EXTENSION_BY_MIME[mimeType] ?? null;
}

export function isAllowedMimeType(bucket: BucketId, mimeType: string): boolean {
  return (BUCKETS[bucket].allowedMimeTypes as readonly string[]).includes(mimeType);
}

export function isWithinSizeLimit(bucket: BucketId, sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= BUCKETS[bucket].maxBytes;
}
