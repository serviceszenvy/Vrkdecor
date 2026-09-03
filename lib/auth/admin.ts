import 'server-only';

import { redirect } from 'next/navigation';
import type { AdminUserRow } from '@/lib/db/types';
import { isSupabaseConfigured } from './supabase-anon';
import { createSupabaseServerClient } from './supabase-server';

export type AdminIdentity = Pick<AdminUserRow, 'user_id' | 'email' | 'role' | 'status'>;

/**
 * Resolves the current admin, or null.
 *
 * Authorization is decided by the database, not by the session: the query runs
 * as the signed-in user, so the `admin_users` policies (and the `is_active_admin`
 * predicate behind every admin policy) are what actually answer. A user whose
 * admin record is missing or disabled resolves to null even with a perfectly
 * valid session.
 */
export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  // No Supabase project means no Auth, so there is nobody to be. Returning null
  // rather than throwing keeps the Admin Panel routable on an unconfigured
  // environment: every page redirects to the sign-in screen, which explains
  // what is missing instead of rendering a stack trace.
  if (!isSupabaseConfigured()) return null;

  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    console.error('[auth] Could not create a session client.');
    return null;
  }

  // getUser() revalidates the token with Supabase Auth. Never trust
  // getSession() for an authorization decision — its contents are not verified.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) return null;

  return data;
}

/** True when the caller is an active admin. */
export async function isAdmin(): Promise<boolean> {
  return (await getCurrentAdmin()) !== null;
}

/**
 * Guard for admin server components and server actions. Redirects unauthorized
 * callers to the login page instead of revealing whether a resource exists.
 *
 * EVERY admin route and EVERY admin mutation must call this, and
 * `tests/unit/admin-authorization.test.ts` fails the build if one does not. It
 * is the server-side half of the protection; Row Level Security is the other
 * half, and neither is sufficient alone:
 *
 *   - this guard decides whether the request may proceed at all
 *   - the policies decide, per row, what the query is actually allowed to touch
 *
 * Admin reads and writes deliberately run through the CALLER'S session client,
 * never the service role, so both halves apply to every statement. The service
 * role is used only where no policy path exists, and only after this guard.
 */
export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

/**
 * The authorized admin plus the session client its queries must use.
 *
 * A single call site for "who is this, and which client speaks for them" makes
 * the wrong thing hard to write: there is no convenient way to end up holding
 * an authorized identity and a service-role client at the same time.
 */
export async function requireAdminContext() {
  const admin = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  return { admin, supabase };
}
