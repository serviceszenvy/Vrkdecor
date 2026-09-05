import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { Container, GlassPanel, IconChip, Parallax } from '@/components/ui';
import { cn } from '@/lib/cn';
import { GemIcon, ShieldIcon, SparkIcon, StarIcon } from '@/components/layout/icons';
import { credentials, heroAssurances, heroCopy, heroImage } from '@/lib/content';
import { HeroAmbient } from './hero-ambient';

const ASSURANCE_ICONS = [GemIcon, SparkIcon, ShieldIcon] as const;

/** The approved "events delivered" figure, worn as a chip on the photograph. */
const EVENTS_FIGURE = credentials.find((c) => c.label === 'Events delivered');

/**
 * The home page hero.
 *
 * A dark olive stage (the logo's own #37432b) lit by lime and sage, with the
 * message on the left and the photograph on the right inside a rounded frame
 * that carries the glass assurance panel. The composition is sized to the
 * first desktop viewport: the panel's height is `100svh` less the floating
 * header and the page inset, capped so a very tall monitor does not stretch
 * it into emptiness and floored so a short laptop never crushes the type.
 * Below `lg` the constraint is dropped and the hero grows naturally.
 *
 * Nothing is cropped to achieve the fit. The type uses the fluid scale, the
 * photograph frame is sized in viewport terms, and the vertical rhythm is
 * tighter than the rest of the page rather than padded like a section.
 *
 * `lib/content/hero-media.ts` is the single replacement point for the image.
 * The gradient underneath means a missing file still reads as a finished
 * section.
 */
export function HomeHero({ actions }: { actions: ReactNode }) {
  return (
    <section
      className="pt-2 sm:pt-2.5 lg:pt-3"
      style={{
        paddingLeft: 'calc(0.625rem + var(--safe-left))',
        paddingRight: 'calc(0.625rem + var(--safe-right))',
      }}
      aria-labelledby="hero-title"
    >
      <div
        className={cn(
          'surface-aurora on-deep relative isolate mx-auto flex w-full max-w-[86rem] overflow-hidden rounded-[1.75rem] text-white sm:rounded-[2rem]',
          'lg:max-h-[54rem] lg:min-h-[calc(100svh-var(--header-height)-2.25rem)]',
        )}
      >
        <HeroAmbient />
        <div
          aria-hidden="true"
          className="pattern-dots absolute inset-0 -z-10 opacity-60"
        />

        <Container width="wide" className="flex">
          <div className="grid w-full items-center gap-6 py-7 sm:gap-10 sm:py-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12 lg:py-8">
            <div className="stagger flex max-w-2xl flex-col gap-3.5 sm:gap-5">
              <p
                className="text-accent-300 text-2xs inline-flex items-center gap-2 font-semibold tracking-[0.16em] uppercase sm:gap-2.5 sm:tracking-[0.24em]"
                style={{ '--i': 0 } as CSSProperties}
              >
                <span className="bg-accent-400 inline-block size-2 rounded-full shadow-[0_0_0_4px_rgb(142_200_64/0.25)]" />
                {heroCopy.eyebrow}
              </p>

              <h1
                id="hero-title"
                className="text-4xl leading-[1.06] font-medium sm:text-6xl sm:leading-[1.02]"
                style={{ '--i': 1 } as CSSProperties}
              >
                {heroCopy.title}{' '}
                <span className="text-gradient-lime block pb-1">
                  {heroCopy.titleAccent}
                </span>
              </h1>

              <p
                className="text-ink-on-deep max-w-xl text-[0.95rem] leading-relaxed sm:text-lg"
                style={{ '--i': 2 } as CSSProperties}
              >
                {heroCopy.lead}
              </p>

              {/*
                Stacked and full width on a phone. Two pills of different
                lengths sitting on one ragged line is the single thing that
                made the hero look unfinished at 393px; from `sm` up there is
                room for them to sit side by side and they do.
              */}
              <div
                className="mt-0.5 flex flex-col items-stretch gap-2.5 sm:mt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
                style={{ '--i': 3 } as CSSProperties}
              >
                {actions}
              </div>

              {/*
                On a phone the assurance panel is not shown on the photograph,
                so the same three points appear here as a compact row and the
                hero still tells the whole story.
              */}
              <ul
                className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5 sm:hidden"
                style={{ '--i': 4 } as CSSProperties}
              >
                {heroAssurances.map((assurance) => (
                  <li
                    key={assurance.title}
                    className="text-ink-on-deep inline-flex items-center gap-2 text-[0.8rem]"
                  >
                    <span className="bg-accent-400 size-1.5 rounded-full" />
                    {assurance.title}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="stagger relative w-full lg:justify-self-end"
              style={{ '--stagger-base': '220ms' } as CSSProperties}
            >
              <div
                className="shadow-deep relative aspect-[5/4] w-full overflow-hidden rounded-[1.5rem] ring-1 ring-white/15 sm:aspect-[16/10] sm:rounded-[1.75rem] lg:aspect-auto lg:h-[clamp(24rem,58svh,36rem)]"
                style={{ '--i': 0 } as CSSProperties}
              >
                <div className="from-brand-700 via-brand-800 to-brand-950 absolute inset-0 bg-gradient-to-br" />
                {heroImage.src ? (
                  /*
                    Two independent movements on one photograph: the frame's
                    contents drift very slowly on their own (`ken-burns`), and
                    the whole layer leans a little against the scroll
                    (`Parallax`). The layer is taller than the frame so the
                    lean never uncovers an edge, and both stop completely
                    under `prefers-reduced-motion`.
                  */
                  <Parallax strength={16} className="absolute inset-x-0 -inset-y-[7%]">
                    <Image
                      src={heroImage.src}
                      alt={heroImage.alt}
                      width={heroImage.width}
                      height={heroImage.height}
                      priority
                      sizes="(min-width: 1024px) 44vw, 100vw"
                      className="ken-burns absolute inset-0 h-full w-full object-cover"
                    />
                  </Parallax>
                ) : null}
                <div
                  aria-hidden="true"
                  className="from-brand-950/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
                />

                {EVENTS_FIGURE ? (
                  <div className="motion-safe:animate-float absolute top-3 right-3 sm:top-4 sm:right-4">
                    <span className="bg-accent-500 text-brand-950 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold shadow-[0_12px_30px_-10px_rgb(142_200_64/0.9)] sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm">
                      <StarIcon className="size-3.5 sm:size-4" />
                      {EVENTS_FIGURE.value} {EVENTS_FIGURE.label.toLowerCase()}
                    </span>
                  </div>
                ) : null}

                <GlassPanel
                  tone="deep"
                  radius="2xl"
                  className="absolute inset-x-4 bottom-4 hidden p-1.5 sm:block"
                  aria-labelledby="hero-assurances"
                  as="aside"
                >
                  <h2 id="hero-assurances" className="sr-only">
                    What you can expect from us
                  </h2>
                  <ul className="grid gap-1 sm:grid-cols-3">
                    {heroAssurances.map((assurance, index) => {
                      const AssuranceIcon = ASSURANCE_ICONS[index] ?? GemIcon;
                      return (
                        <li
                          key={assurance.title}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        >
                          <IconChip tone="lime" size="sm">
                            <AssuranceIcon className="size-5" />
                          </IconChip>
                          <div className="flex min-w-0 flex-col">
                            <h3 className="text-sm leading-tight font-semibold text-white">
                              {assurance.title}
                            </h3>
                            <p className="text-ink-on-deep hidden text-xs leading-snug 2xl:block">
                              {assurance.body}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </GlassPanel>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
