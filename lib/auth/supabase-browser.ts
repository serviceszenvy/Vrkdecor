import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/db/types';
import { requirePublicSupabaseConfig } from './config';

/**
 * Supabase client for browser code.
 *
 * Uses the anon key only. That key is safe in the browser solely because Row
 * Level Security is enabled on every table and the policies grant anonymous
 * users read access to published content and nothing else
 * (`supabase/migrations/20260831120100_row_level_security.sql`).
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = requirePublicSupabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}
