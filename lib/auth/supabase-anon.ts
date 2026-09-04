import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/db/types';
import { requirePublicSupabaseConfig } from './config';

/**
 * Sessionless Supabase client for reading public content.
 *
 * Uses the anon key and reads no cookies, so pages that use it can still be
 * statically rendered. Row Level Security applies exactly as it does for any
 * anonymous visitor: only published designs, active reference data, published
 * packages and approved testimonials are visible.
 *
 * Use `createSupabaseServerClient()` instead whenever a request's own session
 * matters.
 */
export function createSupabaseAnonClient() {
  const { url, anonKey } = requirePublicSupabaseConfig();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** True when both public Supabase variables are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
