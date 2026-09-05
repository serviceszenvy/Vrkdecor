import type { CSSProperties } from 'react';
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
 * offset is `--mobile-cta-height`, which already includes the home-indicator
 * inset, and the right edge adds the landscape notch inset, so the button
 * stays reachable on a phone held sideways.
 *
 * The target is 56px, comfortably over the 44px floor the design system
 * commits to. A slow ring breathes out from underneath it — the one piece of
 * unprompted movement in the chrome, and it stops entirely for a visitor who
 * has asked for reduced motion.
 */
export function WhatsAppFab() {
  return (
    <a
      href={whatsAppHref}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-fab"
      aria-label={`Message ${siteConfig.name} on WhatsApp`}
      className="press pulse-ring fixed z-30 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_-8px_rgb(37_211_102/0.7)] transition-transform motion-safe:hover:scale-105"
      style={
        {
          right: 'calc(1rem + var(--safe-right))',
          bottom: 'var(--fab-offset)',
          '--pulse-ring-color': '#25D366',
        } as CSSProperties
      }
    >
      <span className="relative z-10">
        <WhatsAppIcon className="size-7" />
      </span>
    </a>
  );
}
