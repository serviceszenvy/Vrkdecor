import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  // The Admin Panel must never be indexed, linked from a sitemap or cached by a
  // search engine. The `X-Robots-Tag` header in `next.config.ts` says the same
  // thing at the HTTP level, so a crawler that ignores the meta tag still gets
  // the instruction.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The Admin Panel segment.
 *
 * There is no shared shell here on purpose: `AdminShell` needs the signed-in
 * admin, and only a page that has already called `requireAdmin()` has one. A
 * layout cannot perform that guard for its children in a way the children may
 * rely on, so each page guards itself and renders the shell with the identity
 * the guard returned. That keeps the authorization check impossible to forget
 * and impossible to satisfy by accident.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
