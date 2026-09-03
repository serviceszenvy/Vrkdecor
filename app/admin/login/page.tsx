import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { isSupabaseConfigured } from '@/lib/auth/supabase-anon';
import { siteConfig } from '@/lib/site-config';
import logoSrc from '@/public/brand/vrk-decor-logo.png';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

/**
 * Admin sign-in.
 *
 * The only page under `/admin` that an unauthenticated visitor may see, and it
 * shows nothing: no list of admins, no hint about which addresses exist, and
 * no indication of whether the site has any enquiries. Everything else
 * redirects here.
 *
 * When Supabase is not configured there is no Auth to sign in to, so the page
 * says so plainly instead of presenting a form that cannot work. That is the
 * state a reviewer sees on a fresh checkout, and being honest about it is more
 * useful than a login box that silently fails.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const configured = isSupabaseConfigured();

  // Somebody already signed in has no business on this page.
  if (configured && (await getCurrentAdmin())) redirect('/admin');

  const params = await searchParams;
  const signedOut = params.signedOut === '1';

  return (
    <main
      id="main"
      className="bg-canvas canvas-wash flex min-h-dvh flex-1 items-center py-16"
    >
      <Container width="narrow" className="flex max-w-md flex-col gap-6">
        <div className="glass-surface-strong glass-edge flex flex-col gap-6 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Image
              src={logoSrc}
              alt={siteConfig.name}
              sizes="200px"
              className="h-12 w-auto"
            />
            <h1 className="font-display mt-2 text-2xl font-medium">Admin sign in</h1>
            <p className="text-ink-muted text-sm">
              This area is for the {siteConfig.name} team.
            </p>
          </div>

          {signedOut ? (
            <p
              className="border-line-soft bg-surface rounded-2xl border p-4 text-center text-sm"
              data-testid="signed-out-notice"
              role="status"
            >
              You have been signed out.
            </p>
          ) : null}

          {configured ? (
            <LoginForm />
          ) : (
            <div
              className="border-accent-400/70 bg-accent-50 text-accent-900 rounded-2xl border p-4 text-sm"
              data-testid="admin-unavailable"
            >
              <p className="font-medium">The Admin Panel is not connected yet.</p>
              <p className="mt-2">
                No Supabase project is configured for this environment, so there is no
                account to sign in to and no enquiries to show. Set{' '}
                <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, apply the migrations, and
                create the first admin user.
              </p>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
