import { randomUUID } from 'node:crypto';
import {
  extensionForMimeType,
  type BucketId,
  PORTFOLIO_BUCKET,
  REFERENCE_BUCKET,
} from './buckets';

/**
 * Storage object keys are generated on the SERVER and are never derived from a
 * user-supplied filename (Technical Development Specification section 11).
 *
 * This prevents path traversal, key collision, overwriting another record's
 * object, and the enumeration of private objects: the random segment makes a
 * reference-image key unguessable even before the private bucket's policies
 * refuse the read.
 *
 * The original filename is retained in the database column for display only.
 */

function assertSafeSegment(segment: string, label: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) {
    throw new Error(`Unsafe ${label} for a storage key`);
  }
  return segment;
}

export function portfolioObjectKey(designId: string, mimeType: string): string {
  const extension = extensionForMimeType(mimeType);
  if (!extension) throw new Error('Unsupported image type for the portfolio bucket');

  return `designs/${assertSafeSegment(designId, 'design id')}/${randomUUID()}.${extension}`;
}

export function referenceObjectKey(enquiryId: string, mimeType: string): string {
  const extension = extensionForMimeType(mimeType);
  if (!extension) throw new Error('Unsupported image type for the reference bucket');

  return `enquiries/${assertSafeSegment(enquiryId, 'enquiry id')}/${randomUUID()}.${extension}`;
}

export function bucketForKey(key: string): BucketId {
  return key.startsWith('enquiries/') ? REFERENCE_BUCKET : PORTFOLIO_BUCKET;
}
