import type { ComponentType, SVGProps } from 'react';
import { Container, CountUp, IconChip } from '@/components/ui';
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
 * approved. Nothing here is recalculated, rounded or inflated — `CountUp`
 * animates the leading digits of the approved string and prints the rest of it
 * untouched, and the approved string itself is what a crawler and a screen
 * reader receive.
 *
 * Two columns on a phone and four from `sm` up, which is the arrangement in the
 * approved mobile reference: four across a 390px screen would leave each figure
 * with about 80px and force the labels to wrap awkwardly.
 *
 * On a phone the cell stacks — plate above, figure and label below — rather
 * than sitting in a row. In a 172px cell a 48px plate beside the text left the
 * longest label ("Primary coverage areas") wrapping onto three lines and the
 * four cells at three different heights.
 */
export function StatBar({ stats }: { stats: readonly Stat[] }) {
  return (
    <section className="px-2.5 sm:px-5 lg:px-6" aria-labelledby="figures">
      <Container width="wide" flush>
        <h2 id="figures" className="sr-only">
          VRK Decor at a glance
        </h2>
        <dl
          className={cn(
            'glass-surface-strong glass-edge relative z-10 mx-auto -mt-5 grid rounded-[1.5rem] sm:rounded-3xl',
            'grid-cols-2 p-2.5 sm:grid-cols-4 sm:gap-y-2 sm:p-4 lg:-mt-10',
          )}
        >
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  'group flex flex-col items-center gap-1.5 px-2 py-3 text-center',
                  'sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:text-left',
                  // Hairlines between the cells, without a border on the edges.
                  index % 2 === 1 && 'border-line-soft border-l sm:border-l',
                  index === 2 && 'border-line-soft border-l-0 sm:border-l',
                  index >= 2 && 'border-line-soft border-t sm:border-t-0',
                  index === 3 && 'border-line-soft border-l',
                )}
              >
                <IconChip
                  tone="deep"
                  size="sm"
                  className="sm:size-12 [&>svg]:size-4 sm:[&>svg]:size-5"
                >
                  <StatIcon />
                </IconChip>
                {/*
                  The term comes first in the markup, as a definition list
                  requires, and `flex-col-reverse` puts the figure above it on
                  screen. Repeating the label in a visually hidden element
                  instead would make a screen reader read it twice.
                */}
                <div className="flex min-w-0 flex-col-reverse items-center sm:items-start">
                  <dt className="text-ink-muted text-[0.75rem] leading-tight text-balance sm:text-sm">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-gradient-sage text-xl leading-tight font-medium tabular-nums sm:text-3xl">
                    <CountUp value={stat.value} />
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
