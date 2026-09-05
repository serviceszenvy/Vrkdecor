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
 * `--mobile-cta-height` in `app/globals.css` reserves the space it occupies so
 * it never covers page content, and the floating WhatsApp button is offset by
 * the same variable so the two never overlap.
 */
export function StickyMobileCta() {
  return (
    <div
      data-testid="sticky-mobile-cta"
      className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3 lg:hidden"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="glass-surface-strong glass-edge mx-auto flex max-w-md items-center gap-2 rounded-full p-1.5">
        <ButtonLink href={telHref} variant="ghost" size="sm" fullWidth>
          <PhoneIcon className="size-4" />
          Call
        </ButtonLink>
        <ButtonLink href={routes.quote} variant="deep" size="sm" fullWidth>
          Get Quote
        </ButtonLink>
      </div>
    </div>
  );
}
