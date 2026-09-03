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
 * assurance panel sit on top of it. A green gradient is painted underneath the
 * photograph, so the section still reads as finished if the image is missing —
 * which is exactly what happens once `public/samples/` is deleted before the
 * production build and before approved photography has been supplied.
 *
 * Legibility over photography is handled twice, not once: a light scrim covers
 * the left of the image behind the headline, and it is stronger below `lg`,
 * where the text runs across the full width of the picture.
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
      <div className="from-brand-800 via-brand-700 to-brand-900 relative isolate mx-auto w-full max-w-[86rem] overflow-hidden rounded-3xl bg-gradient-to-br">
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

        {/*
          Two scrims. The vertical one keeps the floating header legible at the
          top of the page; the horizontal one sits behind the headline column
          and fades out before it reaches the assurance panel.
        */}
        <div
          aria-hidden="true"
          className="to-brand-900/15 absolute inset-0 -z-10 bg-gradient-to-b from-white/60 via-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-white/88 via-white/55 to-white/10 lg:from-white/80 lg:via-white/25 lg:to-transparent"
        />

        <Container width="wide">
          <div className="grid gap-8 pt-24 pb-14 sm:grid-cols-[minmax(0,1fr)_20rem] sm:items-center sm:pt-28 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 lg:pt-40 lg:pb-28">
            <div className="flex max-w-2xl flex-col gap-5">
              <p className="text-brand-800 text-2xs font-semibold tracking-[0.24em] uppercase">
                {heroCopy.eyebrow}
              </p>

              <h1
                id="hero-title"
                className="text-ink text-4xl leading-[1.08] font-medium sm:text-5xl"
              >
                {heroCopy.title}{' '}
                <span className="text-brand-700 block">{heroCopy.titleAccent}</span>
              </h1>

              <p className="text-ink-soft max-w-xl text-base leading-relaxed sm:text-lg">
                {heroCopy.lead}
              </p>

              <div className="mt-2 flex flex-wrap gap-3">{actions}</div>
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
