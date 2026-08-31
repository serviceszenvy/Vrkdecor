import { ButtonLink } from '@/components/ui';
import { routes, telHref, whatsAppHref } from '@/lib/navigation';
import { PhoneIcon, WhatsAppIcon } from './icons';

/**
 * Persistent mobile action bar: Call, WhatsApp and Get a Quote.
 * Required by the Requirements & SOW section 4 ("Mobile sticky CTA").
 *
 * Hidden at `lg` and above, where the header CTA is always visible.
 * `--mobile-cta-height` in `app/globals.css` reserves the space it occupies so
 * it never covers page content.
 */
export function StickyMobileCta() {
  return (
    <div
      data-testid="sticky-mobile-cta"
      className="bg-surface/95 border-line fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2 px-3 py-2">
        <ButtonLink href={telHref} variant="ghost" size="sm" fullWidth>
          <PhoneIcon />
          <span className="text-xs">Call</span>
        </ButtonLink>
        <ButtonLink href={whatsAppHref} variant="ghost" size="sm" fullWidth>
          <WhatsAppIcon />
          <span className="text-xs">WhatsApp</span>
        </ButtonLink>
        <ButtonLink href={routes.quote} variant="primary" size="sm" fullWidth>
          <span className="text-xs">Get Quote</span>
        </ButtonLink>
      </div>
    </div>
  );
}
