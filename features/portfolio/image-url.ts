import { PORTFOLIO_BUCKET } from '@/lib/storage/buckets';
import { bucketForKey } from '@/lib/storage/keys';

/**
 * Resolves a `design_images.storage_key` to a renderable URL.
 *
 * Real keys are server-generated object keys in the public portfolio bucket
 * (`designs/<design id>/<uuid>.<ext>`) and resolve to a Supabase public URL.
 *
 * Sample placeholder content uses a local path under `/samples/`. Only that
 * exact prefix is accepted as a local path, so a stored key can never be turned
 * into an arbitrary local URL.
 *
 * A PRIVATE reference-image key is refused outright. It would already fail —
 * the object is in another bucket, and that bucket grants `anon` nothing — but
 * a customer's inspiration image must never be handed to a function whose whole
 * job is to build a public URL, whatever a future caller believes it is holding.
 * Admins read those objects through short-lived signed URLs
 * (`lib/storage/urls.ts`) and by no other route.
 */
export function resolveImageUrl(storageKey: string, supabaseUrl?: string): string {
  if (storageKey.startsWith('/samples/')) return storageKey;

  if (storageKey.startsWith('/')) {
    throw new Error('Unexpected absolute storage key');
  }

  if (bucketForKey(storageKey) !== PORTFOLIO_BUCKET) {
    throw new Error('Refusing to build a public URL for a private object');
  }

  const base = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base)
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');

  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${PORTFOLIO_BUCKET}/${storageKey}`;
}
