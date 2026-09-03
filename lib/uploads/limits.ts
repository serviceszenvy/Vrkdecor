import {
  BUCKETS,
  MAX_REFERENCE_IMAGES_PER_ENQUIRY,
  PORTFOLIO_BUCKET,
  REFERENCE_BUCKET,
} from '@/lib/storage/buckets';

/**
 * Reference-image limits, in a module with no server dependencies.
 *
 * The quote form is a Client Component and needs these numbers to label the
 * control honestly. They live here so the browser can read them without pulling
 * in the validator, the storage client or anything that imports `node:crypto`.
 *
 * These are LABELS. Every one of them is enforced again server-side in
 * `reference-images.ts` and again by the bucket itself.
 */

/** Dimension limits — the open decision carried since P3, resolved in P7. */
export const MIN_REFERENCE_IMAGE_EDGE = 200;
export const MAX_REFERENCE_IMAGE_EDGE = 12_000;
export const MAX_REFERENCE_IMAGE_PIXELS = 40_000_000;

export const MAX_REFERENCE_IMAGE_BYTES = BUCKETS[REFERENCE_BUCKET].maxBytes;

/** The most a single request may carry, before the per-file limits apply. */
export const MAX_REFERENCE_UPLOAD_BYTES =
  MAX_REFERENCE_IMAGE_BYTES * MAX_REFERENCE_IMAGES_PER_ENQUIRY;

export const ACCEPTED_REFERENCE_MIME_TYPES = BUCKETS[REFERENCE_BUCKET]
  .allowedMimeTypes as readonly string[];

/** The `accept` attribute for the file input. A hint to the file picker only. */
export const REFERENCE_ACCEPT_ATTRIBUTE = ACCEPTED_REFERENCE_MIME_TYPES.join(',');

export const MAX_REFERENCE_IMAGE_MB = Math.round(
  MAX_REFERENCE_IMAGE_BYTES / (1024 * 1024),
);

// ---------------------------------------------------------------------------
// Portfolio images (P8)
//
// Uploaded by an admin, published to the public portfolio. The bucket allows
// 10 MB and four types; the application accepts three of them.
//
// AVIF is deliberately NOT accepted as an upload even though the bucket allows
// it for delivery. `lib/uploads/image-signature.ts` reads JPEG, PNG and WebP
// headers, and adding a half-verified AVIF parser to accept a format that
// `next/image` re-encodes to WebP anyway would be work with no benefit and a
// new place to be wrong. Extending the probe is the way to add it later.
// ---------------------------------------------------------------------------

export const PORTFOLIO_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const PORTFOLIO_ACCEPT_ATTRIBUTE = PORTFOLIO_UPLOAD_MIME_TYPES.join(',');

export const MAX_PORTFOLIO_IMAGE_BYTES = BUCKETS[PORTFOLIO_BUCKET].maxBytes;

export const MAX_PORTFOLIO_IMAGE_MB = Math.round(
  MAX_PORTFOLIO_IMAGE_BYTES / (1024 * 1024),
);

/**
 * The whole-request ceiling, shared by every upload surface.
 *
 * `next.config.ts` sets `serverActions.bodySizeLimit` to 16 MB. A request over
 * that is rejected by the framework before any of this code runs, and the admin
 * would see a generic failure rather than a sentence explaining it. So the
 * application's own ceiling sits just under the framework's, and the form says
 * so: an admin uploading a batch is told the limit before they hit it.
 */
export const MAX_UPLOAD_REQUEST_BYTES = 15 * 1024 * 1024;

/**
 * How many related images may be attached in one upload.
 *
 * Six 10 MB photographs would exceed the request ceiling above, so in practice
 * the size limit binds first for large files and this count binds for small
 * ones. Both are stated on the form.
 */
export const MAX_PORTFOLIO_UPLOAD_BATCH = 6;

export const MAX_PORTFOLIO_UPLOAD_BYTES = MAX_UPLOAD_REQUEST_BYTES;

/**
 * Dimension limits for published portfolio photography.
 *
 * The floor is higher than the reference-image floor because these are shown
 * full width on a design page: anything smaller than 800 px on an edge would be
 * upscaled and look poor. The ceilings are the same decompression-bomb guards.
 */
export const MIN_PORTFOLIO_IMAGE_EDGE = 800;
export const MAX_PORTFOLIO_IMAGE_EDGE = 12_000;
export const MAX_PORTFOLIO_IMAGE_PIXELS = 60_000_000;
