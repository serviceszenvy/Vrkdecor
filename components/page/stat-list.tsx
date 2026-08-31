/**
 * Credential figures from the approved Business Profile.
 * Values are rendered exactly as approved and never recalculated or rounded.
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
        <div key={stat.label} className="flex flex-col gap-1">
          <dt className="sr-only">{stat.label}</dt>
          <dd
            className={
              tone === 'inverse'
                ? 'font-display text-accent-300 text-3xl font-medium sm:text-4xl'
                : 'font-display text-brand-700 text-3xl font-medium sm:text-4xl'
            }
          >
            {stat.value}
          </dd>
          <p
            className={
              tone === 'inverse' ? 'text-sand-300 text-sm' : 'text-ink-muted text-sm'
            }
          >
            {stat.label}
          </p>
        </div>
      ))}
    </dl>
  );
}
