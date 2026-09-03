import { whatsAppHref } from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';
import { WhatsAppIcon } from './icons';

/**
 * The persistent WhatsApp action.
 *
 * WhatsApp is the approved primary direct channel (Requirements & SOW section
 * 12), so it is reachable from every page at every size. Behaviour is
 * unchanged from the shell built in P2: plain click-to-chat to the approved
 * business number, no automation, no prefilled message.
 *
 * Placement: bottom right, lifted above the mobile action bar so the two never
 * overlap, and clear of it entirely from `lg` up where the bar is hidden. The
 * target is 56px, comfortably over the 44px floor the design system commits to.
 */
export function WhatsAppFab() {
  return (
    <a
      href={whatsAppHref}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-fab"
      aria-label={`Message ${siteConfig.name} on WhatsApp`}
      className="motion-safe:animate-sheet-in fixed right-4 bottom-[calc(var(--mobile-cta-height)+0.75rem)] z-30 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_-8px_rgb(37_211_102/0.7)] transition-transform duration-200 motion-safe:hover:scale-110 motion-safe:active:scale-95 sm:right-6 lg:bottom-6"
      style={{
        marginBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
