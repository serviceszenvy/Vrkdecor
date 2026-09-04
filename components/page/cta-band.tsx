import { ButtonLink, Container, Reveal } from '@/components/ui';
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
 * Deliberately dark — the second of the site's two dark "bookend" moments
 * (the home hero is the first). Every other public page runs entirely light,
 * so this is the one guaranteed strong, high-contrast note before the footer
 * on every page it appears on. Every inverse colour used here is asserted in
 * `contrastContract` (`lib/design-tokens.ts`, the "on the dark hero" pairings
 * — both sit on the same `brand-950` worst case).
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
      <div className="dark-surface from-brand-950 via-brand-900 to-sand-950 relative isolate mx-auto w-full max-w-[86rem] overflow-hidden rounded-3xl bg-gradient-to-r">
        <LeafDecor className="text-accent-400/20 motion-safe:animate-drift-slow -top-8 -left-12 size-64" />
        <LeafDecor
          className="text-brand-400/20 motion-safe:animate-drift-slower -right-12 -bottom-10 size-64"
          flip
        />
        <div
          aria-hidden="true"
          className="ambient-blob bg-accent-400/25 motion-safe:animate-drift-slow top-1/2 right-1/4 size-56 -translate-y-1/2"
        />

        <Container width="wide">
          <Reveal
            as="div"
            className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-12"
          >
            <div className="flex flex-col gap-4">
              <p className="text-accent-300 text-2xs font-semibold tracking-[0.24em] uppercase">
                {closingCta.eyebrow}
              </p>
              <h2 id="final-cta" className="text-3xl font-semibold text-white sm:text-4xl">
                {title}{' '}
                {accent ? <span className="text-accent-300 block">{accent}</span> : null}
              </h2>
              <p className="text-sand-200 max-w-xl leading-relaxed">{lead}</p>
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
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
