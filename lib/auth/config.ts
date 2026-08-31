/**
 * Supabase configuration accessors.
 *
 * Every value is read at call time, never at module load, so the application
 * builds and the public shell runs without Supabase credentials configured.
 * Each accessor fails loudly, and without echoing any value, when a variable it
 * needs is missing.
 */

export type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    // The name only — never the value, and never the surrounding environment.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Safe for browser and server. */
export function requirePublicSupabaseConfig(): PublicSupabaseConfig {
  return {
    url: required('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

/**
 * Server-only. The service-role key bypasses Row Level Security, so it must
 * never be read in a module that can reach the browser bundle. Callers are
 * additionally guarded by the `server-only` import in `supabase-service.ts`.
 */
export function requireServiceRoleKey(): string {
  return required('SUPABASE_SERVICE_ROLE_KEY');
}
