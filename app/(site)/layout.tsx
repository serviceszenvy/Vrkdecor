import { SiteChrome } from '@/components/layout';

/**
 * Every public page. The `(site)` group adds no URL segment, so the routes
 * below it are unchanged from P4/P5/P6/P7.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteChrome>{children}</SiteChrome>;
}
