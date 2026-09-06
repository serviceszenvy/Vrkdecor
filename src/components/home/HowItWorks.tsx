import { howItWorks, sections } from "@/lib/content/site";
import SectionHeading from "@/components/ui/SectionHeading";

export default function HowItWorks() {
  return (
    <section className="band-dark grain section relative overflow-hidden" aria-labelledby="how-title">
      <div className="aura aura-lime" style={{ width: 640, height: 640, left: "10%", top: "-24%", opacity: 0.32 }} />
      <div className="aura aura-warm" style={{ width: 480, height: 480, right: "-8%", bottom: "-20%", opacity: 0.2 }} />

      <div className="shell relative z-10">
        <SectionHeading
          eyebrow={sections.process.eyebrow}
          title={<span id="how-title">{sections.process.title}</span>}
          align="center"
        />

        <div className="relative">
          <svg
            className="hidden lg:block absolute left-0 right-0 top-[52px] w-full h-16 text-[var(--color-lime-300)] opacity-50"
            viewBox="0 0 1200 60"
            fill="none"
            aria-hidden="true"
            data-reveal
          >
            <path
              className="draw-path"
              style={{ ["--len" as string]: 1300 }}
              d="M60 30 C 260 -6 340 66 540 30 C 740 -6 820 66 1140 30"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeDasharray="1300"
            />
          </svg>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 relative">
            {howItWorks.map((s, i) => (
              <li key={s.step} className="glass glass-sheen p-7 lift" data-reveal style={{ ["--i" as string]: i }}>
                <span className="step-node">{s.step}</span>
                <h3 className="t-3 mt-6">{s.title}</h3>
                <p className="text-sm text-[var(--ink-2)] mt-2.5 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
