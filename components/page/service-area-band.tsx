import { ButtonLink, Container, SectionHeading } from '@/components/ui';
import { PinIcon } from '@/components/layout/icons';
import { coverage } from '@/lib/content';
import { routes } from '@/lib/navigation';

/**
 * "Where We Create" — redesign brief section 16.
 *
 * The service-area statement ("We work across Nagercoil, Tirunelveli,
 * Trivandrum, Tuticorin, Madurai and anywhere in Tamil Nadu depending on what
 * your event needs") previously sat as one quiet line at the very bottom of
 * the Home page. It is now a proper section on About, with the primary areas
 * as location chips and a subtle map-inspired radial backdrop, closing with a
 * CTA into Contact as the brief asks for.
 */
export function ServiceAreaBand() {
  return (
    <section className="px-3 sm:px-5 lg:px-6" aria-labelledby="service-area">
      <div className="from-canvas-deep via-canvas to-surface-tint relative isolate mx-auto w-full max-w-[86rem] overflow-hidden rounded-3xl bg-gradient-to-br">
        {/* Map-inspired ambient dots, purely decorative. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(rgb(142 200 64 / 0.35) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
            maskImage:
              'radial-gradient(60% 60% at 50% 40%, black 0%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(60% 60% at 50% 40%, black 0%, transparent 100%)',
          }}
        />

        <Container width="wide">
          <div className="flex flex-col items-center gap-8 py-14 text-center sm:py-20">
            <SectionHeading
              id="service-area"
              align="center"
              rule
              eyebrow="Where we create"
              title="Serving across"
              accent="Tamil Nadu"
              lead={`We work across ${coverage.primaryAreas.join(', ')} and anywhere in Tamil Nadu depending on what your event needs.`}
            />

            <ul className="flex flex-wrap justify-center gap-3">
              {coverage.primaryAreas.map((area, index) => (
                <li
                  key={area}
                  className={`animate-fade-up stagger-${Math.min(index + 1, 4)}`}
                >
                  <span className="glass-surface glass-edge text-ink inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                    <PinIcon className="text-accent-300 size-4" />
                    {area}
                  </span>
                </li>
              ))}
              <li>
                <span className="border-accent-400/40 text-accent-300 inline-flex items-center gap-2 rounded-full border border-dashed px-4 py-2 text-sm font-medium">
                  + Across Tamil Nadu
                </span>
              </li>
            </ul>

            <ButtonLink href={routes.contact} variant="primary" size="lg">
              Ask if we cover your area
            </ButtonLink>
          </div>
        </Container>
      </div>
    </section>
  );
}
