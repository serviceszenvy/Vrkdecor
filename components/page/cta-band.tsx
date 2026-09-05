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
 * This is the ONE strong quote action in a page's body (the header carries
 * the other), so it earns the brightest treatment on the site: the lime pill
 * on the dark olive stage. WhatsApp and phone sit beside it as the quiet
 * alternatives for people who would rather talk than type.
 */
export function CtaBand({
  title = closingCta.title,
  accent = closingCta.titleAccent,
  lead = closingCta.lead,
  eyebrow = closingCta.eyebrow,
  quoteHref = routes.quote,
}: {
  title?: string;
  accent?: string;
  lead?: string;
  eyebrow?: string;
  /** A design page passes its own quote link so the design stays attached. */
  quoteHref?: string;
}) {
  return (
    <section className="px-3 sm:px-5 lg:px-6" aria-labelledby="final-cta">
      <div className="surface-aurora on-deep shadow-deep relative isolate mx-auto w-full max-w-[86rem] overflow-hidden rounded-3xl border border-white/10 text-white">
        <span
          className="ambient-blob bg-accent-500/40 -top-28 -right-16 size-96"
          aria-hidden="true"
        />
        <span
          className="ambient-blob ambient-blob-slow bg-brand-400/35 -bottom-32 left-[20%] size-80"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="pattern-dots absolute inset-0 -z-10 opacity-50"
        />
        <LeafDecor className="text-accent-200/20 -top-8 -left-12 size-64" />
        <LeafDecor className="text-accent-200/20 -right-12 -bottom-10 size-64" flip />

        <Container width="wide">
          <div className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-12">
            <Reveal effect="left" className="flex flex-col gap-4">
              <p className="text-accent-300 text-2xs font-semibold tracking-[0.24em] uppercase">
                {eyebrow}
              </p>
              <h2
                id="final-cta"
                className="text-3xl font-medium sm:text-4xl lg:text-5xl"
              >
                {title}{' '}
                {accent ? (
                  <span className="text-gradient-lime block pb-1">{accent}</span>
                ) : null}
              </h2>
              <p className="text-ink-on-deep max-w-xl leading-relaxed">{lead}</p>
            </Reveal>

            <Reveal
              effect="right"
              delay={120}
              className="flex flex-col gap-3 lg:items-stretch"
            >
              <ButtonLink href={quoteHref} variant="lime" size="lg" fullWidth>
                Get a Quote
                <ArrowRightIcon className="size-4" />
              </ButtonLink>
              <div className="grid gap-3 sm:grid-cols-2">
                <ButtonLink
                  href={whatsAppHref}
                  variant="glass-deep"
                  size="md"
                  fullWidth
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp us
                </ButtonLink>
                <ButtonLink href={telHref} variant="glass-deep" size="md" fullWidth>
                  <PhoneIcon className="size-4" />
                  Call us
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </Container>
      </div>
    </section>
  );
}
