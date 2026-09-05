import type { CSSProperties } from 'react';
import { Container, IconChip, LeafRule, Reveal } from '@/components/ui';
import { FlowerIcon, LeafIcon, SparkIcon, TeamIcon } from '@/components/layout/icons';
import { whyChooseUs } from '@/lib/content';
import { LeafDecor } from './leaf-decor';

const VALUE_ICONS = [FlowerIcon, TeamIcon, LeafIcon, SparkIcon] as const;

/**
 * "Why choose VRK Decor" — Requirements section 7.
 *
 * Every point restates an approved fact from Requirements sections 2, 3 and 6.
 * No claim about ranking, price or a guarantee is made here, because none is
 * approved.
 *
 * The band is the first dark moment after the hero: the same olive stage, lit
 * by lime, with four glass cards that rise one after another as the section
 * scrolls into view.
 */
export function ValueBand() {
  return (
    <section className="px-2.5 sm:px-5 lg:px-6" aria-labelledby="why-vrk">
      <div className="surface-aurora on-deep shadow-deep relative isolate mx-auto w-full max-w-[86rem] overflow-hidden rounded-[1.75rem] border border-white/10 text-white sm:rounded-3xl">
        <span
          className="ambient-blob bg-accent-500/35 -top-24 right-[10%] size-80"
          aria-hidden="true"
        />
        <span
          className="ambient-blob ambient-blob-slow bg-brand-400/40 -bottom-32 -left-16 size-96"
          aria-hidden="true"
        />
        <LeafDecor className="text-accent-200/20 -top-6 -left-10 size-56" />
        <LeafDecor className="text-accent-200/20 -right-10 -bottom-8 size-56" flip />

        <Container width="wide">
          <div className="py-9 sm:py-16">
            <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
              <p className="text-accent-300 text-2xs font-semibold tracking-[0.24em] uppercase">
                Why families choose us
              </p>
              <h2 id="why-vrk" className="text-3xl font-medium sm:text-4xl">
                Why choose <span className="text-gradient-lime">VRK Decor</span>
              </h2>
              <LeafRule />
            </Reveal>

            <ul className="mt-7 grid grid-cols-1 gap-2.5 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {whyChooseUs.map((reason, index) => {
                const ValueIcon = VALUE_ICONS[index] ?? FlowerIcon;
                return (
                  <Reveal
                    as="li"
                    key={reason.title}
                    delay={index * 110}
                    effect="scale"
                    className="group glass-surface-deep glass-edge lift shine press flex h-full flex-row items-start gap-3.5 rounded-2xl p-4 sm:flex-col sm:gap-3 sm:p-6"
                    style={{ '--i': index } as CSSProperties}
                  >
                    <IconChip tone="deep" size="md" className="sm:size-14">
                      <ValueIcon className="size-6" />
                    </IconChip>
                    {/*
                      On a phone the four cards sit one under another, so the
                      plate moves beside the copy rather than above it. Four
                      stacked cards each with a 56px plate on its own line was
                      most of a screen of nothing but plates.
                    */}
                    <div className="flex min-w-0 flex-col gap-1.5 sm:contents">
                      <h3 className="text-base font-semibold text-pretty text-white sm:text-lg">
                        {reason.title}
                      </h3>
                      <p className="text-ink-on-deep text-sm leading-relaxed text-pretty">
                        {reason.body}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </Container>
      </div>
    </section>
  );
}
