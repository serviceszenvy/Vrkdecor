import 'server-only';

import { createSupabaseServiceRoleClient } from '@/lib/auth/supabase-service';
import type { ValidatedReferenceImage } from '@/lib/uploads';
import { MAX_REFERENCE_IMAGES_PER_ENQUIRY, REFERENCE_BUCKET } from './buckets';
import { referenceObjectKey } from './keys';

/**
 * Writes validated customer reference images into the PRIVATE bucket.
 *
 * Only ever called with images that `validateReferenceImageUploads` has already
 * accepted, and only after the enquiry itself has been persisted — the enquiry
 * id is what namespaces the object key, and a lead is never made to depend on
 * an upload succeeding.
 *
 * Three properties are the security of this function:
 *
 *   - the key is generated here from the enquiry id and a random UUID, never
 *     from the customer's filename, so nothing can traverse a path, collide
 *     with another enquiry's object or be guessed
 *   - the object is written with the type PROVEN by the file's bytes, not the
 *     type the browser claimed, so a stored object can never be served as
 *     anything other than the image it is
 *   - the bucket is private, and `upsert` is false, so an existing object can
 *     never be overwritten and no object here has a public URL
 */

export type StoredReferenceObject = {
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
};

export type ReferenceUploadOutcome = {
  stored: StoredReferenceObject[];
  /** True when at least one image could not be written. Never fatal. */
  incomplete: boolean;
};

export async function uploadReferenceImages(
  enquiryId: string,
  images: ValidatedReferenceImage[],
): Promise<ReferenceUploadOutcome> {
  if (images.length === 0) return { stored: [], incomplete: false };

  const capped = images.slice(0, MAX_REFERENCE_IMAGES_PER_ENQUIRY);
  const supabase = createSupabaseServiceRoleClient();
  const stored: StoredReferenceObject[] = [];
  let incomplete = capped.length < images.length;

  for (const image of capped) {
    const storageKey = referenceObjectKey(enquiryId, image.mimeType);

    const { error } = await supabase.storage
      .from(REFERENCE_BUCKET)
      .upload(storageKey, image.bytes, {
        contentType: image.mimeType,
        upsert: false,
        cacheControl: 'no-store',
      });

    if (error) {
      // Never log the error object or the customer's filename: a storage error
      // can carry request detail, and the enquiry is already safe either way.
      console.error('[storage] Could not store a reference image.');
      incomplete = true;
      continue;
    }

    stored.push({
      storageKey,
      originalFilename: image.originalFilename,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
    });
  }

  return { stored, incomplete };
}

/**
 * Removes reference objects that were uploaded but could not be recorded.
 *
 * Best effort: an orphaned private object is a housekeeping problem, not a
 * safety one, and a failure here must never surface to the customer.
 */
export async function removeReferenceObjects(storageKeys: string[]): Promise<void> {
  if (storageKeys.length === 0) return;

  try {
    const supabase = createSupabaseServiceRoleClient();
    await supabase.storage.from(REFERENCE_BUCKET).remove(storageKeys);
  } catch {
    console.error('[storage] Could not remove orphaned reference objects.');
  }
}
