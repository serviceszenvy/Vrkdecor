import type { ReactNode } from 'react';
import { SkipLink } from '@/components/ui';
import { ScrollProgress } from './scroll-progress';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { StickyMobileCta } from './sticky-mobile-cta';
import { WhatsAppFab } from './whatsapp-fab';

/**
 * The public site chrome: skip link, header, main landmark, footer, the mobile
 * action bar and the persistent WhatsApp action.
 *
 * It lives in a component rather than in the root layout because the Admin
 * Panel (P8) must not render any of it. A marketing header, a "Get a Quote"
 * sticky bar and a public footer around an enquiry inbox would be wrong for the
 * person using it and confusing for anyone looking over their shoulder.
 *
 * Used by `app/(site)/layout.tsx` for every public page, and by
 * `app/not-found.tsx`, which Next.js renders directly inside the root layout
 * for an unmatched URL and therefore cannot inherit a group layout.
 *
 * The `canvas-wash` is the soft botanical gradient behind every page. It is two
 * very wide, very low opacity radial gradients on one element — cheap to paint,
 * and quiet enough that photography still leads.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="canvas-wash flex flex-1 flex-col">
      <SkipLink />
      <ScrollProgress />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="pb-mobile-cta flex-1">
        {children}
      </main>
      <SiteFooter />
      <StickyMobileCta />
      <WhatsAppFab />
    </div>
  );
}
