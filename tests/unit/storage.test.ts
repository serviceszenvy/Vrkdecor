import { describe, expect, it } from 'vitest';
import {
  BUCKETS,
  MAX_REFERENCE_IMAGES_PER_ENQUIRY,
  PORTFOLIO_BUCKET,
  REFERENCE_BUCKET,
  extensionForMimeType,
  isAllowedMimeType,
  isWithinSizeLimit,
} from '@/lib/storage/buckets';
import {
  bucketForKey,
  portfolioObjectKey,
  referenceObjectKey,
} from '@/lib/storage/keys';

const DESIGN_ID = '7f1c2a3e-4b5d-6e7f-8a9b-0c1d2e3f4a5b';
const ENQUIRY_ID = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d';

describe('bucket policy', () => {
  it('keeps the reference bucket private and the portfolio bucket public', () => {
    expect(BUCKETS[PORTFOLIO_BUCKET].public).toBe(true);
    expect(BUCKETS[REFERENCE_BUCKET].public).toBe(false);
  });

  it('allows only raster image types, never scriptable or executable ones', () => {
    for (const bucket of Object.values(BUCKETS)) {
      for (const type of bucket.allowedMimeTypes) {
        expect(type.startsWith('image/')).toBe(true);
      }
      expect(bucket.allowedMimeTypes as readonly string[]).not.toContain(
        'image/svg+xml',
      );
      expect(bucket.allowedMimeTypes as readonly string[]).not.toContain(
        'application/pdf',
      );
      expect(bucket.allowedMimeTypes as readonly string[]).not.toContain(
        'application/zip',
      );
    }
  });

  it('rejects disallowed types and oversized files', () => {
    expect(isAllowedMimeType(REFERENCE_BUCKET, 'image/jpeg')).toBe(true);
    expect(isAllowedMimeType(REFERENCE_BUCKET, 'image/svg+xml')).toBe(false);
    expect(isAllowedMimeType(REFERENCE_BUCKET, 'application/x-msdownload')).toBe(false);
    // AVIF is accepted for portfolio delivery but not for customer uploads.
    expect(isAllowedMimeType(REFERENCE_BUCKET, 'image/avif')).toBe(false);
    expect(isAllowedMimeType(PORTFOLIO_BUCKET, 'image/avif')).toBe(true);

    expect(isWithinSizeLimit(REFERENCE_BUCKET, 1)).toBe(true);
    expect(isWithinSizeLimit(REFERENCE_BUCKET, 5 * 1024 * 1024)).toBe(true);
    expect(isWithinSizeLimit(REFERENCE_BUCKET, 5 * 1024 * 1024 + 1)).toBe(false);
    expect(isWithinSizeLimit(REFERENCE_BUCKET, 0)).toBe(false);
    expect(isWithinSizeLimit(REFERENCE_BUCKET, -1)).toBe(false);
  });

  it('caps reference images at the approved maximum of 3', () => {
    expect(MAX_REFERENCE_IMAGES_PER_ENQUIRY).toBe(3);
  });
});

describe('server-generated storage keys', () => {
  it('never contains the user-supplied filename', () => {
    const key = referenceObjectKey(ENQUIRY_ID, 'image/jpeg');
    expect(key).not.toContain('inspiration');
    expect(key).toMatch(
      /^enquiries\/[0-9a-f-]+\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/,
    );
  });

  it('is unique on every call', () => {
    const keys = new Set(
      Array.from({ length: 50 }, () => referenceObjectKey(ENQUIRY_ID, 'image/png')),
    );
    expect(keys.size).toBe(50);
  });

  it('namespaces portfolio objects under their parent design', () => {
    expect(portfolioObjectKey(DESIGN_ID, 'image/webp')).toMatch(
      new RegExp(`^designs/${DESIGN_ID}/`),
    );
  });

  it('refuses path traversal in an identifier', () => {
    expect(() => referenceObjectKey('../../etc/passwd', 'image/jpeg')).toThrow(
      /unsafe/i,
    );
    expect(() => portfolioObjectKey('a/../b', 'image/png')).toThrow(/unsafe/i);
    expect(() => referenceObjectKey('id with spaces', 'image/jpeg')).toThrow(/unsafe/i);
  });

  it('refuses an unsupported image type', () => {
    expect(() => referenceObjectKey(ENQUIRY_ID, 'image/svg+xml')).toThrow(
      /unsupported/i,
    );
    expect(() => referenceObjectKey(ENQUIRY_ID, 'text/html')).toThrow(/unsupported/i);
  });

  it('maps approved types to safe extensions', () => {
    expect(extensionForMimeType('image/jpeg')).toBe('jpg');
    expect(extensionForMimeType('image/png')).toBe('png');
    expect(extensionForMimeType('image/webp')).toBe('webp');
    expect(extensionForMimeType('application/x-httpd-php')).toBeNull();
  });

  it('routes keys back to the correct bucket', () => {
    expect(bucketForKey(referenceObjectKey(ENQUIRY_ID, 'image/jpeg'))).toBe(
      REFERENCE_BUCKET,
    );
    expect(bucketForKey(portfolioObjectKey(DESIGN_ID, 'image/jpeg'))).toBe(
      PORTFOLIO_BUCKET,
    );
  });
});
