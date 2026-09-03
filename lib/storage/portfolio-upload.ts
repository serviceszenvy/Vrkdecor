import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/db/types';
import type { ValidatedReferenceImage } from '@/lib/uploads';
import { PORTFOLIO_BUCKET } from './buckets';
import { portfolioObjectKey } from './keys';

/**
 * Writes validated portfolio images to the PUBLIC bucket, as the caller.
 *
 * The client is passed in rather than created here, and the Admin Panel always
 * passes its own session client. That is the point: the storage policy
 * `admins manage portfolio objects` then decides whether the write is allowed,
 * on top of the `requireAdmin()` guard the caller has already passed. A
 * service-role client would bypass the policy and leave only one check standing.
 *
 * The key is generated from the design id and a random UUID, with the extension
 * taken from the type PROVEN by the file's bytes, so an admin's filename never
 * reaches storage and cannot traverse a path or overwrite another design's
 * object. `upsert: false` refuses to replace an existing object outright.
 */

export type StoredPortfolioObject = {
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  originalFilename: string;
};

export type PortfolioUploadOutcome = {
  stored: StoredPortfolioObject[];
  /** True when at least one image could not be written. */
  incomplete: boolean;
};

export async function uploadPortfolioImages(
  supabase: SupabaseClient<Database>,
  designId: string,
  images: ValidatedReferenceImage[],
): Promise<PortfolioUploadOutcome> {
  if (images.length === 0) return { stored: [], incomplete: false };

  const stored: StoredPortfolioObject[] = [];
  let incomplete = false;

  for (const image of images) {
    const storageKey = portfolioObjectKey(designId, image.mimeType);

    const { error } = await supabase.storage
      .from(PORTFOLIO_BUCKET)
      .upload(storageKey, image.bytes, {
        contentType: image.mimeType,
        upsert: false,
        // Portfolio object keys are content-addressed by a random UUID, so a
        // replaced image always gets a new key and a long cache is safe.
        cacheControl: '31536000',
      });

    if (error) {
      // The message only. A storage error can carry request detail.
      console.error('[storage] Could not store a portfolio image.');
      incomplete = true;
      continue;
    }

    stored.push({
      storageKey,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      width: image.width,
      height: image.height,
      originalFilename: image.originalFilename,
    });
  }

  return { stored, incomplete };
}

/**
 * Removes portfolio objects, as the caller.
 *
 * Used when a row could not be written after its object was uploaded, and when
 * an admin deletes an image. Best effort: an orphaned object is a housekeeping
 * problem, and a failure here must never surface as a broken page.
 */
export async function removePortfolioObjects(
  supabase: SupabaseClient<Database>,
  storageKeys: string[],
): Promise<void> {
  if (storageKeys.length === 0) return;

  try {
    await supabase.storage.from(PORTFOLIO_BUCKET).remove(storageKeys);
  } catch {
    console.error('[storage] Could not remove portfolio objects.');
  }
}
