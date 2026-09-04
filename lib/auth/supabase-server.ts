import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/db/types';
import { requirePublicSupabaseConfig } from './config';

/**
 * Supabase client for server components, route handlers and server actions.
 *
 * Runs as the signed-in user (or `anon` when there is no session), so every
 * query is still subject to Row Level Security. This is the client to use for
 * anything that should respect the caller's permissions.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = requirePublicSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            });
          }
        } catch {
          // `setAll` is called from a Server Component, where cookies are
          // read-only. Session refresh happens in middleware instead, so this
          // is safe to ignore.
        }
      },
    },
  });
}
