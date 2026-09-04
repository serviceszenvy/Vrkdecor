import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/db/types';
import { requirePublicSupabaseConfig, requireServiceRoleKey } from './config';

/**
 * Supabase client authenticated with the SERVICE ROLE key.
 *
 * This client BYPASSES Row Level Security. Use it only where the server is the
 * authority and has already performed its own authorization:
 *   - creating an enquiry after server-side validation and rate limiting (P6)
 *   - writing a private reference image on the customer's behalf (P7)
 *   - issuing a short-lived signed URL for a private object (P7/P8)
 *   - provisioning or disabling an admin
 *
 * Rules:
 *   - never import this module from a Client Component; the `server-only`
 *     import above turns that into a build error rather than a leak
 *   - never return its results to a caller without an authorization check
 *   - never log the key or place it in an error message
 */
export function createSupabaseServiceRoleClient() {
  const { url } = requirePublicSupabaseConfig();

  return createClient<Database>(url, requireServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
