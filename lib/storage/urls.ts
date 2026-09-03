import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { requirePublicSupabaseConfig } from '@/lib/auth/config';
import type { Database } from '@/lib/db/types';
import { PORTFOLIO_BUCKET, REFERENCE_BUCKET } from './buckets';

/**
 * Public URL for a published portfolio object.
 *
 * Only ever call this for objects in the portfolio bucket. Reference images
 * have no public URL by design.
 */
export function portfolioPublicUrl(storageKey: string): string {
  const { url } = requirePublicSupabaseConfig();
  return `${url.replace(/\/$/, '')}/storage/v1/object/public/${PORTFOLIO_BUCKET}/${storageKey}`;
}

/** Short-lived signed URLs only; never a permanent link to private data. */
export const REFERENCE_SIGNED_URL_TTL_SECONDS = 300;

/**
 * Issues a short-lived signed URL for a PRIVATE reference image.
 *
 * The Supabase client is a required argument, and the Admin Panel passes its
 * own SESSION client. That is deliberate: the storage policy
 * `admins read reference objects` then has to agree before a URL exists at all,
 * on top of the `requireAdmin()` guard the caller has already passed. Handing
 * this function a service-role client would produce a working link for anyone
 * who reached the code path, which is exactly the mistake worth making
 * impossible to write by accident.
 *
 * The URL expires in five minutes, so a link that leaks out of an admin's
 * browser stops working quickly.
 */
export async function createReferenceSignedUrl(
  supabase: SupabaseClient<Database>,
  storageKey: string,
  expiresInSeconds: number = REFERENCE_SIGNED_URL_TTL_SECONDS,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(REFERENCE_BUCKET)
    .createSignedUrl(storageKey, expiresInSeconds);

  if (error || !data) {
    // Deliberately generic, and never the error object: a storage failure must
    // not become a description of the private bucket.
    console.error('[storage] Could not sign a reference image.');
    return null;
  }

  return data.signedUrl;
}

/**
 * Removes private reference objects, as the caller.
 *
 * Used when an admin deletes an enquiry's attachment. The storage policy
 * `admins delete reference objects` decides, so a non-admin session removes
 * nothing even if it reaches this function.
 */
export async function removeReferenceObjectsAs(
  supabase: SupabaseClient<Database>,
  storageKeys: string[],
): Promise<void> {
  if (storageKeys.length === 0) return;
  try {
    await supabase.storage.from(REFERENCE_BUCKET).remove(storageKeys);
  } catch {
    console.error('[storage] Could not remove reference objects.');
  }
}
