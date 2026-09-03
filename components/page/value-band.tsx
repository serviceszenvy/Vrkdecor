import { Container, IconChip } from '@/components/ui';
import { FlowerIcon, LeafIcon, SparkIcon, TeamIcon } from '@/components/layout/icons';
import { LeafRule } from '@/components/ui';
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
 * A soft green panel with botanical corners rather than four separate cards:
 * the four points belong together, and one surface reads calmer than four.
 */
export function ValueBand() {
  return (
    <section className="px-3 sm:px-5 lg:px-6" aria-labelledby="why-vrk">
      <div className="from-brand-50 via-surface-tint to-accent-50 border-brand-200/50 relative isolate mx-auto w-full max-w-[86rem] overflow-hidden rounded-3xl border bg-gradient-to-br">
        <LeafDecor className="text-brand-500/25 -top-6 -left-10 size-56" />
        <LeafDecor className="text-brand-500/25 -right-10 -bottom-8 size-56" flip />

        <Container width="wide">
          <div className="py-12 sm:py-16">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
              <h2 id="why-vrk" className="text-3xl font-medium sm:text-4xl">
                Why choose <span className="text-brand-800">VRK Decor</span>
              </h2>
              <LeafRule />
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-0">
              {whyChooseUs.map((reason, index) => {
                const ValueIcon = VALUE_ICONS[index] ?? FlowerIcon;
                return (
                  <li
                    key={reason.title}
                    className="bg-surface/70 border-brand-200/50 lg:not-first:border-l-brand-300/50 flex h-full flex-col items-center gap-2.5 rounded-2xl border px-3 py-6 text-center lg:rounded-none lg:border-transparent lg:bg-transparent lg:px-6 lg:py-2"
                  >
                    <IconChip tone="tint" size="lg">
                      <ValueIcon className="size-6" />
                    </IconChip>
                    <h3 className="text-ink text-sm font-semibold text-pretty sm:text-base lg:text-lg">
                      {reason.title}
                    </h3>
                    <p className="text-ink-soft text-xs leading-relaxed text-pretty sm:text-sm">
                      {reason.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </div>
    </section>
  );
}
