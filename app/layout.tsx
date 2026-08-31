import type { Metadata, Viewport } from 'next';
import { SiteFooter, SiteHeader, StickyMobileCta } from '@/components/layout';
import { SkipLink } from '@/components/ui';
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
  themeColor: '#252522',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="pb-mobile-cta flex-1">
          {children}
        </main>
        <SiteFooter />
        <StickyMobileCta />
      </body>
    </html>
  );
}
