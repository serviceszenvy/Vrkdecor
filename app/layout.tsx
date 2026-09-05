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

/**
 * Viewport.
 *
 * `viewportFit: 'cover'` lets the layout paint into the notch and the
 * home-indicator strip on an iPhone, which is what the rounded dark panels and
 * the floating action bar are drawn to do. It also makes `env(safe-area-inset-*)`
 * report a real value: without it those insets are always zero, so the sticky
 * bar's home-indicator allowance did nothing on the device it was written for.
 * `app/globals.css` reads them once into `--safe-*` and every edge-anchored
 * element spends them.
 *
 * Zoom is deliberately not capped. `maximumScale` or `userScalable: false`
 * would stop a visitor enlarging the type, which fails WCAG 1.4.4; the 16px
 * floor on form fields in `globals.css` is what stops iOS zooming on its own.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
      <body className="flex min-h-[100svh] flex-col">{children}</body>
    </html>
  );
}
