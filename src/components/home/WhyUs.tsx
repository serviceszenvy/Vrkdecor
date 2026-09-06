import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { sections, whyUs } from "@/lib/content/site";

export default function WhyUs() {
  return (
    <section className="section-tight" aria-labelledby="why-title">
      <div className="shell">
        <SectionHeading
          eyebrow={sections.why.eyebrow}
          title={<span id="why-title">{sections.why.title}</span>}
          align="center"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item, i) => (
            <div key={item.title} className="glass glass-sheen p-6 lift" data-reveal style={{ ["--i" as string]: i }}>
              <span className="feature-icon">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <h3 className="t-3 mt-5">{item.title}</h3>
              <p className="text-sm text-[var(--ink-2)] mt-2.5 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
