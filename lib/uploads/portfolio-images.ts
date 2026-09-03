import { PORTFOLIO_BUCKET } from '@/lib/storage/buckets';
import {
  MAX_PORTFOLIO_IMAGE_EDGE,
  MAX_PORTFOLIO_IMAGE_MB,
  MAX_PORTFOLIO_IMAGE_PIXELS,
  MAX_PORTFOLIO_UPLOAD_BATCH,
  MAX_PORTFOLIO_UPLOAD_BYTES,
  MIN_PORTFOLIO_IMAGE_EDGE,
  PORTFOLIO_UPLOAD_MIME_TYPES,
} from './limits';
import {
  validateImageUploads,
  type ImageUploadValidation,
  type ImageValidationPolicy,
} from './reference-images';

/**
 * Portfolio image validation (P8).
 *
 * The same gate the customer's private uploads pass through, with the
 * portfolio bucket's ceilings and its own messages. An admin's upload is not
 * trusted more than a visitor's: it is a browser posting bytes either way, and
 * these files end up on the public website, which is if anything a reason for
 * more care rather than less.
 *
 * The one difference that matters is what happens to a rejected file. A
 * customer is asked to choose their pictures again; an admin is told which of
 * their files was wrong so they can fix it and re-upload just that one.
 */
export const PORTFOLIO_IMAGE_POLICY: ImageValidationPolicy = {
  bucket: PORTFOLIO_BUCKET,
  maxFiles: MAX_PORTFOLIO_UPLOAD_BATCH,
  maxTotalBytes: MAX_PORTFOLIO_UPLOAD_BYTES,
  minEdge: MIN_PORTFOLIO_IMAGE_EDGE,
  maxEdge: MAX_PORTFOLIO_IMAGE_EDGE,
  maxPixels: MAX_PORTFOLIO_IMAGE_PIXELS,
  messages: {
    tooMany: `Please upload at most ${MAX_PORTFOLIO_UPLOAD_BATCH} images at a time.`,
    tooLarge: `Each image must be ${MAX_PORTFOLIO_IMAGE_MB} MB or smaller, and one upload may carry ${Math.round(MAX_PORTFOLIO_UPLOAD_BYTES / (1024 * 1024))} MB in total. Upload the larger files one at a time.`,
    notAnImage: `Every file must be a JPG, PNG or WEBP image. AVIF and HEIC are not accepted; export as JPG first.`,
    badDimensions: `Each image must be at least ${MIN_PORTFOLIO_IMAGE_EDGE} pixels on its shorter edge and no larger than ${MAX_PORTFOLIO_IMAGE_EDGE}x${MAX_PORTFOLIO_IMAGE_EDGE}.`,
  },
};

/**
 * Validates portfolio images posted under `images`.
 *
 * `expectSingle` is used by the cover-image control, which accepts one file:
 * the ceiling still applies, but the message names the real problem.
 */
export async function validatePortfolioImageUploads(
  formData: FormData,
  field = 'images',
  { expectSingle = false }: { expectSingle?: boolean } = {},
): Promise<ImageUploadValidation> {
  const policy = expectSingle
    ? {
        ...PORTFOLIO_IMAGE_POLICY,
        maxFiles: 1,
        messages: {
          ...PORTFOLIO_IMAGE_POLICY.messages,
          tooMany: 'Please choose one cover image.',
        },
      }
    : PORTFOLIO_IMAGE_POLICY;

  return validateImageUploads(formData, field, policy);
}

/** The `accept` attribute for a portfolio file input. A picker hint only. */
export { PORTFOLIO_ACCEPT_ATTRIBUTE } from './limits';
export { PORTFOLIO_UPLOAD_MIME_TYPES };
