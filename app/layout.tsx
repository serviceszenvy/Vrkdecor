import type { Metadata, Viewport } from 'next';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Full SEO implementation (Open Graph, canonicals, structured data, sitemap,
  // robots) is delivered in P9 — 09-SEO-ANALYTICS.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f7f1',
};

/**
 * The root layout carries the document only.
 *
 * The public chrome moved to `app/(site)/layout.tsx` in P8 so that the Admin
 * Panel, which is a different application for a different audience, can have a
 * shell of its own rather than sitting inside a marketing header, a footer and
 * a "Get a Quote" action bar. Route groups change no URL: every public page is
 * still exactly where it was.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
