import { sections, stats } from "@/lib/content/site";

export default function StatsStrip() {
  return (
    <section className="section-tight !pt-4" aria-labelledby="glance-title">
      <div className="shell">
        <div className="flex flex-col gap-3 mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow" data-reveal>
              {sections.glance.eyebrow}
            </span>
            <h2 id="glance-title" className="t-2 mt-3 max-w-2xl" data-reveal style={{ ["--i" as string]: 1 }}>
              {sections.glance.title}
            </h2>
          </div>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="glass glass-sheen px-6 py-7 text-center lift"
              data-reveal
              style={{ ["--i" as string]: i }}
            >
              <p className="font-display text-[clamp(2.1rem,4.4vw,3.1rem)] leading-none">
                <span data-countup={s.value}>0</span>
                <span className="text-[var(--color-lime-600)]">{s.suffix}</span>
              </p>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] font-bold text-[var(--ink-3)] mt-3">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
