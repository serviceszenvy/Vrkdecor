import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { sections, serviceAreas } from "@/lib/content/site";

export default function ServiceAreas() {
  return (
    <section className="section-tight" aria-labelledby="areas-title">
      <div className="shell">
        <SectionHeading
          eyebrow={sections.areas.eyebrow}
          title={<span id="areas-title">{sections.areas.title}</span>}
          lede={sections.areas.lede}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {serviceAreas.map((a, i) => (
            <div key={a.name} className="glass glass-sheen px-6 py-5 flex items-center justify-between gap-4 lift" data-reveal style={{ ["--i" as string]: i }}>
              <span className="flex items-center gap-3">
                <span className="mega-icon">
                  <Icon name="pin" className="h-4 w-4" />
                </span>
                <strong className="font-display text-lg">{a.name}</strong>
              </span>
              <span className="text-[0.7rem] uppercase tracking-[0.14em] font-bold text-[var(--ink-3)]">{a.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
