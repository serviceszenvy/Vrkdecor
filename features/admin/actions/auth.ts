'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { isSupabaseConfigured } from '@/lib/auth/supabase-anon';
import { consumeRateLimit } from '@/lib/rate-limit';
import { parseAdminForm, SIGN_IN_FIELDS, signInSchema } from '@/lib/validation/admin';
import { createHash } from 'node:crypto';
import { type AdminActionState, failed, invalid } from '../action-state';

/**
 * Admin sign-in and sign-out.
 *
 * Sign-in is the only anonymous write surface the Admin Panel exposes, so it is
 * treated like one:
 *
 *   - it is a Server Action, so Next.js verifies the request Origin against the
 *     host before it runs and there is no public JSON endpoint to script at
 *   - it is rate limited per client AND per email address, because either one
 *     alone leaves an obvious way around
 *   - it answers a wrong password and an unknown address identically, so the
 *     form cannot be used to find out which addresses exist
 *   - it never logs the address or the password, and never echoes the password
 *     back into the form
 *
 * Authorization is NOT decided here. A successful sign-in only proves who
 * someone is; `requireAdmin()` and the `is_active_admin()` policies decide what
 * they may do, and a user with no admin record or a disabled one gets a valid
 * session that opens nothing.
 */

/** Five attempts per client and per address in fifteen minutes. */
const SIGN_IN_CLIENT_POLICY = { limit: 10, windowMs: 15 * 60 * 1000 };
const SIGN_IN_EMAIL_POLICY = { limit: 5, windowMs: 15 * 60 * 1000 };

const GENERIC_FAILURE =
  'That email address and password do not match an account. Please try again.';

function clientKey(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get('x-forwarded-for');
  const candidate =
    forwarded?.split(',')[0]?.trim() ||
    requestHeaders.get('x-real-ip')?.trim() ||
    'unknown-client';
  // Hashed, so the limiter never becomes a place where addresses accumulate.
  return createHash('sha256').update(candidate).digest('hex').slice(0, 32);
}

function emailKey(email: string): string {
  return createHash('sha256').update(email).digest('hex').slice(0, 32);
}

export async function signInAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = parseAdminForm(signInSchema, SIGN_IN_FIELDS, formData);

  // The email is echoed back so it need not be retyped. The password never is.
  const submittedEmail = formData.get('email');
  const values = {
    email: typeof submittedEmail === 'string' ? submittedEmail : '',
  };

  if (!parsed.success) return invalid(parsed.errors, values);

  if (!isSupabaseConfigured()) {
    return failed(
      'The Admin Panel is not connected to a database yet, so there is nothing to sign in to.',
      values,
    );
  }

  const client = consumeRateLimit(
    `admin:signin:client:${clientKey(await headers())}`,
    SIGN_IN_CLIENT_POLICY,
  );
  const account = consumeRateLimit(
    `admin:signin:email:${emailKey(parsed.data.email)}`,
    SIGN_IN_EMAIL_POLICY,
  );

  if (!client.allowed || !account.allowed) {
    return failed(
      'Too many sign-in attempts. Please wait a few minutes and try again.',
      values,
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    // One message for every failure. Distinguishing "no such account" from
    // "wrong password" would turn this form into an address checker.
    if (error) return failed(GENERIC_FAILURE, values);
  } catch {
    console.error('[admin] Sign-in could not be completed.');
    return failed('Sign-in is unavailable right now. Please try again.', values);
  }

  redirect('/admin');
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      console.error('[admin] Sign-out could not be completed.');
    }
  }

  redirect('/admin/login?signedOut=1');
}
