import { ButtonLink, Container, Reveal } from '@/components/ui';
import { ArrowRightIcon, PinIcon } from '@/components/layout/icons';
import { cn } from '@/lib/cn';
import { coverage } from '@/lib/content';
import { routes } from '@/lib/navigation';

/**
 * Where We Create — the service-area section.
 *
 * The coverage statement used to sit as a line of small print under the
 * closing call to action. It is an approved business fact and a real question
 * a customer has ("do they come to Tuticorin?"), so it now has a section of
 * its own: location chips, a map-inspired drawing and one quiet action.
 *
 * The places are `coverage.primaryAreas` from the approved requirements plus
 * the approved "anywhere in Tamil Nadu" statement. Nothing else is added.
 */
export function ServiceArea({
  tone = 'bloom',
  action = 'contact',
  id = 'where-we-create',
}: {
  tone?: 'bloom' | 'deep';
  action?: 'contact' | 'about';
  id?: string;
}) {
  const deep = tone === 'deep';
  const cta =
    action === 'contact'
      ? { href: routes.contact, label: 'Plan with us' }
      : { href: routes.about, label: 'About VRK Decor' };

  return (
    <section className="px-3 sm:px-5 lg:px-6" aria-labelledby={id}>
      <div
        className={cn(
          'relative isolate mx-auto w-full max-w-[86rem] overflow-hidden rounded-3xl border',
          deep
            ? 'surface-aurora on-deep shadow-deep border-white/10 text-white'
            : 'surface-bloom border-brand-200/60 shadow-panel',
        )}
      >
        <span
          className={cn(
            'ambient-blob -top-24 -right-20 size-80',
            deep ? 'bg-accent-500/30' : 'bg-accent-400/30',
          )}
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 -z-10',
            deep ? 'pattern-dots opacity-50' : 'pattern-dots-ink opacity-60',
          )}
        />

        <Container width="wide">
          <div className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
            <Reveal effect="left" className="flex flex-col gap-5">
              <p
                className={cn(
                  'text-2xs font-semibold tracking-[0.24em] uppercase',
                  deep ? 'text-accent-300' : 'text-brand-800',
                )}
              >
                Where we create
              </p>
              <h2 id={id} className="text-3xl font-medium sm:text-4xl">
                Serving across{' '}
                <span className={deep ? 'text-gradient-lime' : 'text-gradient-sage'}>
                  Tamil Nadu
                </span>
              </h2>
              <p
                className={cn(
                  'max-w-xl leading-relaxed',
                  deep ? 'text-ink-on-deep' : 'text-ink-soft',
                )}
              >
                We work across {coverage.primaryAreas.join(', ')} and anywhere in Tamil
                Nadu depending on what your event needs. Tell us where the celebration
                is and we will plan the setup around the venue.
              </p>

              <ul className="flex flex-wrap gap-2.5" aria-label="Locations we serve">
                {[...coverage.primaryAreas, 'Across Tamil Nadu'].map((area, index) => (
                  <Reveal
                    as="li"
                    key={area}
                    delay={index * 70}
                    effect="scale"
                    className={cn(
                      'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[transform,box-shadow,border-color] duration-300 motion-safe:hover:-translate-y-0.5',
                      deep
                        ? 'glass-surface-deep hover:border-accent-400/60 border-white/15 text-white'
                        : 'border-brand-200 hover:border-brand-400 text-ink shadow-card bg-white/85',
                      index === coverage.primaryAreas.length &&
                        (deep
                          ? 'bg-accent-500 text-brand-950 border-transparent'
                          : 'bg-brand-900 text-accent-200 border-transparent'),
                    )}
                  >
                    <PinIcon
                      className={cn(
                        'size-4',
                        index === coverage.primaryAreas.length
                          ? 'text-current'
                          : deep
                            ? 'text-accent-400'
                            : 'text-brand-700',
                      )}
                    />
                    {area}
                  </Reveal>
                ))}
              </ul>

              <div className="mt-1">
                <ButtonLink href={cta.href} variant={deep ? 'lime' : 'deep'} size="md">
                  {cta.label}
                  <ArrowRightIcon className="size-4" />
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal
              effect="scale"
              delay={120}
              className="relative mx-auto w-full max-w-md"
            >
              <CoverageMap deep={deep} />
            </Reveal>
          </div>
        </Container>
      </div>
    </section>
  );
}

/**
 * A map-inspired drawing rather than a map: concentric range rings around the
 * studio in Nagercoil, with the primary coverage areas placed as lit nodes in
 * roughly their real direction. It is decorative and hidden from assistive
 * technology; the list of places beside it is the accessible content.
 */
function CoverageMap({ deep }: { deep: boolean }) {
  const nodes = [
    { name: 'Nagercoil', x: 130, y: 300, home: true },
    { name: 'Trivandrum', x: 52, y: 262 },
    { name: 'Tirunelveli', x: 176, y: 178 },
    { name: 'Tuticorin', x: 292, y: 168 },
    { name: 'Madurai', x: 250, y: 58 },
  ];
  const line = deep ? 'rgb(199 231 157 / 0.6)' : 'rgb(97 118 75 / 0.7)';
  const ring = deep ? 'rgb(255 255 255 / 0.16)' : 'rgb(97 118 75 / 0.3)';
  const text = deep ? '#e4ead8' : '#37432b';

  return (
    <svg
      viewBox="0 0 360 340"
      aria-hidden="true"
      focusable="false"
      className="h-auto w-full drop-shadow-[0_20px_40px_rgb(36_44_28/0.25)]"
    >
      <defs>
        <radialGradient id="coverage-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8ec840" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8ec840" stopOpacity="0" />
        </radialGradient>
      </defs>

      {[70, 130, 190, 250].map((r, index) => (
        <circle
          key={r}
          cx={130}
          cy={300}
          r={r}
          fill="none"
          stroke={ring}
          strokeWidth={1.2}
          strokeDasharray={index % 2 ? '4 8' : undefined}
          className="motion-safe:animate-pulse-glow"
          style={{ animationDelay: `${index * 0.6}s` }}
        />
      ))}

      {nodes
        .filter((node) => !node.home)
        .map((node) => (
          <path
            key={node.name}
            d={`M130 300 Q ${(130 + node.x) / 2 + 24} ${(300 + node.y) / 2 - 30} ${node.x} ${node.y}`}
            fill="none"
            stroke={line}
            strokeWidth={1.6}
            strokeDasharray="5 7"
            strokeLinecap="round"
          />
        ))}

      {nodes.map((node, index) => (
        <g key={node.name}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.home ? 34 : 22}
            fill="url(#coverage-glow)"
            className="motion-safe:animate-pulse-glow"
            style={{ animationDelay: `${index * 0.45}s` }}
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={node.home ? 9 : 6}
            fill={node.home ? '#8ec840' : deep ? '#ffffff' : '#61764b'}
            stroke={deep ? '#37432b' : '#ffffff'}
            strokeWidth={3}
          />
          <text
            x={node.x}
            y={node.y + (node.home ? 30 : 24)}
            textAnchor="middle"
            fontSize="12.5"
            fontWeight={node.home ? 700 : 600}
            fill={text}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {node.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
