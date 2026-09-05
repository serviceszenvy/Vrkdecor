import { ButtonLink } from '@/components/ui';
import { routes, telHref } from '@/lib/navigation';
import { PhoneIcon } from './icons';

/**
 * Persistent mobile action bar — required by Requirements & SOW section 4.
 *
 * Two actions rather than three since the redesign: WhatsApp has its own
 * floating button directly above this bar, so repeating it here would have put
 * the same action on screen twice and squeezed the two that remain.
 *
 * Hidden at `lg` and above, where the header call to action is always visible.
 *
 * Safe area: the document is `viewport-fit=cover`, so on an iPhone the bar now
 * sits over the home-indicator strip and has to lift itself clear of it. The
 * bar's own inset and the `--mobile-cta-height` that reserves page space for
 * it are both measured from `--safe-bottom`, so the last line of a page is
 * never hidden underneath it and the glass never stops short of the edge.
 */
export function StickyMobileCta() {
  return (
    <div
      data-testid="sticky-mobile-cta"
      className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3 lg:hidden"
      style={{
        paddingBottom: 'calc(0.75rem + var(--safe-bottom))',
        paddingLeft: 'calc(0.75rem + var(--safe-left))',
        paddingRight: 'calc(0.75rem + var(--safe-right))',
      }}
    >
      <div className="glass-surface-strong glass-edge mx-auto flex max-w-md items-center gap-2 rounded-full p-1.5">
        <ButtonLink
          href={telHref}
          variant="ghost"
          size="sm"
          fullWidth
          className="press"
        >
          <PhoneIcon className="size-4" />
          Call
        </ButtonLink>
        <ButtonLink
          href={routes.quote}
          variant="deep"
          size="sm"
          fullWidth
          className="press"
        >
          Get Quote
        </ButtonLink>
      </div>
    </div>
  );
}
