import { cn } from '@/lib/cn';

/**
 * Credential figures from the approved Business Profile, in a simple row.
 * Values are rendered exactly as approved and never recalculated or rounded.
 *
 * The home page uses the richer `StatBar`; this stays for the inner pages,
 * where a quieter treatment is right.
 */
export function StatList({
  stats,
  tone = 'default',
}: {
  stats: readonly { value: string; label: string }[];
  tone?: 'default' | 'inverse';
}) {
  return (
    <dl className="grid grid-cols-3 gap-4 sm:gap-8">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse gap-1">
          <dt
            className={cn(
              'text-sm',
              tone === 'inverse' ? 'text-sand-300' : 'text-ink-muted',
            )}
          >
            {stat.label}
          </dt>
          <dd
            className={cn(
              'font-display text-3xl font-medium sm:text-4xl',
              tone === 'inverse' ? 'text-accent-300' : 'text-brand-300',
            )}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
