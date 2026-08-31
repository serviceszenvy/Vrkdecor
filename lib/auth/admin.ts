import 'server-only';

import { redirect } from 'next/navigation';
import type { AdminUserRow } from '@/lib/db/types';
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
  const supabase = await createSupabaseServerClient();

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
 * Every admin route and mutation must call this. It is the server-side half of
 * the protection; Row Level Security is the other half, and neither is
 * sufficient alone.
 */
export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
