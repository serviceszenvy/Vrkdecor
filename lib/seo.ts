import type { Metadata } from 'next';
import { siteConfig } from './site-config';

/**
 * Page metadata helper — SEO foundations (P4).
 *
 * Requirements section 17 asks for unique metadata, clean URLs, canonical URLs
 * and Open Graph. Those are implemented here and applied by every page.
 *
 * The XML sitemap, robots.txt, structured data and analytics are owned by P9
 * (`05_PROMPTS/09-SEO-ANALYTICS.md`) and are deliberately not implemented here.
 */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
  absoluteTitle = false,
}: {
  /**
   * Page title WITHOUT the brand: the root layout's title template appends
   * " | VRK Decor" to it.
   */
  title: string;
  description: string;
  /** Route path beginning with "/". Used for the canonical URL. */
  path: string;
  /** Set false for pages that must never be indexed. */
  index?: boolean;
  /**
   * The home page shares a segment with the root layout, so Next.js does not
   * apply the title template to it. It passes its full title with this set.
   */
  absoluteTitle?: boolean;
}): Metadata {
  const canonical = path === '/' ? '/' : path.replace(/\/$/, '');

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: absoluteTitle ? title : `${title} | ${siteConfig.name}`,
      description,
      url: canonical,
      locale: 'en_IN',
    },
    ...(index ? {} : { robots: { index: false, follow: false, nocache: true } }),
  };
}
