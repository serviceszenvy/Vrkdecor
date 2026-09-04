import type { ComponentType, SVGProps } from 'react';
import { Container, IconChip } from '@/components/ui';
import { cn } from '@/lib/cn';

export type Stat = {
  value: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/**
 * The figures band under the hero.
 *
 * Values come from the approved Business Profile and are rendered exactly as
 * approved. Nothing here is recalculated, rounded or inflated.
 *
 * Two columns on a phone and four from `sm` up, which is the arrangement in the
 * approved mobile reference: four across a 390px screen would leave each figure
 * with about 80px and force the labels to wrap awkwardly.
 */
export function StatBar({ stats }: { stats: readonly Stat[] }) {
  return (
    <section className="px-3 sm:px-5 lg:px-6" aria-labelledby="figures">
      <Container width="wide" className="px-0">
        <h2 id="figures" className="sr-only">
          VRK Decor at a glance
        </h2>
        <dl
          className={cn(
            'glass-surface-strong glass-edge relative z-10 mx-auto -mt-6 grid rounded-3xl',
            'grid-cols-2 gap-y-2 p-3 sm:grid-cols-4 sm:p-4 lg:-mt-10',
          )}
        >
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 sm:px-5',
                  // Hairlines between the cells, without a border on the edges.
                  index % 2 === 1 && 'border-line-soft border-l sm:border-l',
                  index === 2 && 'border-line-soft border-l-0 sm:border-l',
                  index >= 2 && 'border-line-soft border-t sm:border-t-0',
                  index === 3 && 'border-line-soft border-l',
                )}
              >
                <IconChip tone="brand" size="md" className="hidden sm:inline-flex">
                  <StatIcon />
                </IconChip>
                {/*
                  The term comes first in the markup, as a definition list
                  requires, and `flex-col-reverse` puts the figure above it on
                  screen. Repeating the label in a visually hidden element
                  instead would make a screen reader read it twice.
                */}
                <div className="flex flex-col-reverse">
                  <dt className="text-ink-muted text-xs sm:text-sm">{stat.label}</dt>
                  <dd className="font-display text-ink text-2xl leading-tight font-medium sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </Container>
    </section>
  );
}
