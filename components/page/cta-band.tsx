import { ButtonLink, Container } from '@/components/ui';
import { closingCta } from '@/lib/content';
import { routes, telHref, whatsAppHref } from '@/lib/navigation';
import { ArrowRightIcon, PhoneIcon, WhatsAppIcon } from '@/components/layout/icons';
import { LeafDecor } from './leaf-decor';

/**
 * Closing call to action.
 *
 * Requirements section 7 requires a final CTA on the Home page; the same band
 * closes the other public pages so the primary action is always reachable.
 *
 * One primary action and two quiet alternatives, rather than three buttons of
 * equal weight. The quotation form is where a request is actually captured
 * with a date, a venue and a design attached, so it leads; phone and WhatsApp
 * are there for people who would simply rather talk.
 */
export function CtaBand({
  title = closingCta.title,
  accent = closingCta.titleAccent,
  lead = closingCta.lead,
}: {
  title?: string;
  accent?: string;
  lead?: string;
}) {
  return (
    <section className="px-3 sm:px-5 lg:px-6" aria-labelledby="final-cta">
      <div className="from-surface-tint via-canvas-deep to-accent-500/10 border-accent-400/20 relative isolate mx-auto w-full max-w-[86rem] overflow-hidden rounded-3xl border bg-gradient-to-r">
        <LeafDecor className="text-accent-400/20 -top-8 -left-12 size-64" />
        <LeafDecor className="text-accent-400/20 -right-12 -bottom-10 size-64" flip />

        <Container width="wide">
          <div className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-12">
            <div className="flex flex-col gap-4">
              <p className="text-accent-300 text-2xs font-semibold tracking-[0.24em] uppercase">
                {closingCta.eyebrow}
              </p>
              <h2 id="final-cta" className="text-3xl font-medium sm:text-4xl">
                {title}{' '}
                {accent ? <span className="text-accent-300 block">{accent}</span> : null}
              </h2>
              <p className="text-ink-soft max-w-xl leading-relaxed">{lead}</p>
            </div>

            <div className="flex flex-col gap-3 lg:items-stretch">
              <ButtonLink href={routes.quote} variant="primary" size="lg" fullWidth>
                Get a Quote
                <ArrowRightIcon className="size-4" />
              </ButtonLink>
              <div className="grid gap-3 sm:grid-cols-2">
                <ButtonLink href={whatsAppHref} variant="glass" size="md" fullWidth>
                  <WhatsAppIcon className="size-4" />
                  WhatsApp us
                </ButtonLink>
                <ButtonLink href={telHref} variant="glass" size="md" fullWidth>
                  <PhoneIcon className="size-4" />
                  Call us
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
