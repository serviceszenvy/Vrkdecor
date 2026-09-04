import type { ReactNode } from 'react';
import Image from 'next/image';
import { Container, GlassPanel, IconChip } from '@/components/ui';
import { GemIcon, ShieldIcon, SparkIcon } from '@/components/layout/icons';
import { heroAssurances, heroCopy, heroImage } from '@/lib/content';

const ASSURANCE_ICONS = [GemIcon, SparkIcon, ShieldIcon] as const;

/**
 * The home page hero.
 *
 * A deliberate dark, rich-branded section — the one place on the site this
 * strong before the eye settles into the lighter pages that follow. Photography
 * first: the picture is the section, and the copy and the floating assurance
 * panel sit on top of it. A dark green-to-near-black gradient is painted
 * underneath the photograph, so the section still reads as finished (and still
 * dark) if the image is missing — which is exactly what happens once
 * `public/samples/` is deleted before the production build and before approved
 * photography has been supplied.
 *
 * Legibility over photography is handled twice, not once: a dark scrim covers
 * the left of the image behind the headline, and it is stronger below `lg`,
 * where the text runs across the full width of the picture. Every inverse text
 * colour here (`text-white`, `text-accent-300`, `text-sand-200`) is asserted in
 * `contrastContract` (`lib/design-tokens.ts`), not chosen by eye.
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
      <div className="dark-surface from-brand-950 via-brand-800 to-brand-900 motion-safe:animate-gradient-pan relative isolate mx-auto w-full max-w-[86rem] overflow-hidden rounded-3xl bg-gradient-to-br bg-[length:200%_200%]">
        {heroImage.src ? (
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            priority
            sizes="100vw"
            className="hero-parallax absolute inset-0 -z-10 h-full w-full object-cover"
          />
        ) : null}

        {/*
          Ambient colour, above the photograph but under the legibility scrims
          below so it reads as a glow rather than reducing headline contrast.
          Contained by the panel's own overflow-hidden.
        */}
        <div
          aria-hidden="true"
          className="ambient-blob bg-accent-400/35 motion-safe:animate-drift-slow -top-16 right-10 -z-10 size-72"
        />
        <div
          aria-hidden="true"
          className="ambient-blob bg-accent-300/20 motion-safe:animate-drift-slower -bottom-24 left-1/3 -z-10 size-96"
        />

        {/*
          Two scrims, dark rather than light so the section stays dark even
          where the photograph is bright. The vertical one keeps the floating
          header's dark-on-light-glass legible at the top of the page; the
          horizontal one sits behind the headline column and fades out before
          it reaches the assurance panel.
        */}
        <div
          aria-hidden="true"
          className="to-brand-950/15 absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/70 via-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/90 via-brand-950/55 to-brand-950/15 lg:from-brand-950/85 lg:via-brand-950/40 lg:to-transparent"
        />

        <Container width="wide">
          <div className="grid gap-8 pt-24 pb-14 sm:grid-cols-[minmax(0,1fr)_20rem] sm:items-center sm:pt-28 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 lg:pt-40 lg:pb-28">
            {/*
              A choreographed entrance, not one fade: eyebrow, headline, lead
              and actions arrive in sequence (docs/ui-audit.md finding MO3).
              Each element sets its own `animation-delay` inline — a class-only
              approach would need a bespoke Tailwind utility per delay value.
            */}
            <div className="flex max-w-2xl flex-col gap-5">
              <p
                className="text-accent-300 motion-safe:animate-fade-in-up text-2xs font-semibold tracking-[0.24em] uppercase"
                style={{ animationDelay: '0ms' }}
              >
                {heroCopy.eyebrow}
              </p>

              <h1
                id="hero-title"
                className="motion-safe:animate-fade-in-up text-4xl leading-[1.08] font-semibold text-white sm:text-5xl"
                style={{ animationDelay: '90ms' }}
              >
                {heroCopy.title}{' '}
                <span className="text-accent-300 block">{heroCopy.titleAccent}</span>
              </h1>

              <p
                className="text-sand-200 motion-safe:animate-fade-in-up max-w-xl text-base leading-relaxed sm:text-lg"
                style={{ animationDelay: '180ms' }}
              >
                {heroCopy.lead}
              </p>

              <div
                className="motion-safe:animate-fade-in-up mt-2 flex flex-wrap gap-3"
                style={{ animationDelay: '270ms' }}
              >
                {actions}
              </div>
            </div>

            <GlassPanel
              tone="strong"
              radius="2xl"
              className="hidden p-2 sm:block"
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
                      className="border-line-soft flex gap-4 border-b px-4 py-5 last:border-b-0"
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
