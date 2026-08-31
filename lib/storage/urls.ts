import 'server-only';

import { createSupabaseServiceRoleClient } from '@/lib/auth/supabase-service';
import { requirePublicSupabaseConfig } from '@/lib/auth/config';
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
 * The caller must have already authorized the request (`requireAdmin()`), since
 * this uses the service-role client. The URL expires in five minutes so a
 * leaked link stops working quickly.
 */
export async function createReferenceSignedUrl(
  storageKey: string,
  expiresInSeconds: number = REFERENCE_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase.storage
    .from(REFERENCE_BUCKET)
    .createSignedUrl(storageKey, expiresInSeconds);

  if (error || !data) {
    // Deliberately generic: never surface storage internals to a caller.
    throw new Error('Could not create a signed URL for the requested file');
  }

  return data.signedUrl;
}
