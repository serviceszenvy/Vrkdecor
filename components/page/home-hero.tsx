import type { ReactNode } from 'react';
import Image from 'next/image';
import { Container, GlassPanel, IconChip } from '@/components/ui';
import { GemIcon, ShieldIcon, SparkIcon } from '@/components/layout/icons';
import { heroAssurances, heroCopy, heroImage } from '@/lib/content';

const ASSURANCE_ICONS = [GemIcon, SparkIcon, ShieldIcon] as const;

/**
 * The home page hero.
 *
 * Photography first: the picture is the section, and the copy and the floating
 * assurance panel sit on top of it. A dark green gradient is painted underneath
 * the photograph, so the section still reads as finished if the image is
 * missing — which is exactly what happens once `public/samples/` is deleted
 * before the production build and before approved photography has been
 * supplied.
 *
 * Legibility over photography is handled twice, not once: a dark scrim covers
 * the left of the image behind the headline, and it is stronger below `lg`,
 * where the text runs across the full width of the picture.
 *
 * VIEWPORT FIT (redesign brief section 1): from `lg` up, the panel's height is
 * clamped to `min(44rem, 100svh - 8rem)` — 8rem reserves the floating header
 * plus outer page margins — so the complete hero (heading, lead, CTAs, image
 * and assurance panel) sits inside the first screen on standard desktop and
 * laptop viewports without cropping anything. `svh` (small viewport height)
 * rather than `vh` is used deliberately: it already excludes a mobile
 * browser's collapsed chrome, so the same rule is safe to reuse at `sm` if the
 * layout ever needs it. Below `lg` the min-height is dropped entirely and the
 * hero is allowed to grow to whatever its content needs, per the brief's
 * explicit instruction not to force the desktop constraint onto mobile.
 *
 * The assurance panel appears from `sm` up. On a phone it is deliberately
 * absent: the approved mobile reference goes straight from the headline to the
 * figures, and the same three points are made again in the "why choose" band a
 * screen further down.
 *
 * `lib/content/hero-media.ts` is the single replacement point for the image.
 */
export function HomeHero({ actions }: { actions: ReactNode }) {
  return (
    <section className="px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6" aria-labelledby="hero-title">
      <div
        className={[
          'from-brand-900 via-canvas-deep to-surface-inverse relative isolate mx-auto w-full max-w-[86rem]',
          'overflow-hidden rounded-3xl bg-gradient-to-br',
          // Viewport-aware height on desktop only — see the note above.
          'lg:flex lg:min-h-[min(44rem,calc(100svh-8rem))] lg:items-center',
        ].join(' ')}
      >
        {heroImage.src ? (
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            priority
            sizes="100vw"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
        ) : null}

        {/* Ambient brand glow, dimmed under prefers-reduced-motion via the global rule. */}
        <div aria-hidden="true" className="ambient-glow absolute inset-0 -z-10 opacity-70" />

        {/*
          Two scrims, now dark rather than white: the vertical one keeps the
          floating header legible at the top of the page; the horizontal one
          sits behind the headline column and fades out before it reaches the
          assurance panel.
        */}
        <div
          aria-hidden="true"
          className="to-canvas/20 absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-transparent"
        />
        <div
          aria-hidden="true"
          className="from-canvas/92 via-canvas/70 to-canvas/15 lg:from-canvas/88 lg:via-canvas/35 absolute inset-0 -z-10 bg-gradient-to-r lg:to-transparent"
        />

        <Container width="wide" className="lg:w-full">
          <div className="grid gap-6 pt-20 pb-10 sm:grid-cols-[minmax(0,1fr)_19rem] sm:items-center sm:gap-8 sm:pt-24 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8 lg:py-10">
            <div className="animate-fade-up flex max-w-2xl flex-col gap-4 lg:gap-4">
              <p className="text-accent-300 text-2xs font-semibold tracking-[0.24em] uppercase">
                {heroCopy.eyebrow}
              </p>

              <h1
                id="hero-title"
                className="text-ink text-4xl leading-[1.08] font-medium sm:text-5xl lg:text-[clamp(2.5rem,2rem+2vw,3.5rem)]"
              >
                {heroCopy.title}{' '}
                <span className="text-accent-300 block">{heroCopy.titleAccent}</span>
              </h1>

              <p className="text-ink-soft max-w-xl text-base leading-relaxed sm:text-lg">
                {heroCopy.lead}
              </p>

              <div className="mt-1 flex flex-wrap gap-3">{actions}</div>
            </div>

            <GlassPanel
              tone="strong"
              radius="2xl"
              className="animate-fade-up stagger-2 hidden p-2 sm:block"
              aria-labelledby="hero-assurances"
              as="aside"
            >
              <h2 id="hero-assurances" className="sr-only">
                What you can expect from us
              </h2>
              <ul>
                {heroAssurances.map((assurance, index) => {
                  const AssuranceIcon = ASSURANCE_ICONS[index] ?? GemIcon;
                  return (
                    <li
                      key={assurance.title}
                      className="border-line-soft flex gap-3.5 border-b px-4 py-3.5 last:border-b-0 lg:py-4"
                    >
                      <IconChip tone="tint" size="md">
                        <AssuranceIcon />
                      </IconChip>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-ink text-base font-semibold">
                          {assurance.title}
                        </h3>
                        <p className="text-ink-soft text-sm leading-relaxed">
                          {assurance.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </GlassPanel>
          </div>
        </Container>
      </div>
    </section>
  );
}
