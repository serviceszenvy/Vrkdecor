import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CtaQuote from "@/components/home/CtaQuote";
import { occasions, styles, workServiceFilters, works } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Our Work",
  description: "Wedding, reception, engagement and family-function setups built by VRK Decor across Tamil Nadu.",
  alternates: { canonical: "/our-work" },
};

export default function OurWorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Find the setting that feels right for your day"
        lede="Browse by occasion, style or service. When you find a setting you like, ask for a quote and the design comes with your request."
      />

      <section className="section-tight !pt-0">
        <div className="shell space-y-4">
          <div className="glass glass-sheen p-5 md:p-6" data-reveal>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] font-bold text-[var(--ink-3)] mb-3">Occasion</p>
            <div className="flex flex-wrap gap-2">
              <span className="pill" data-active="true">All</span>
              {occasions.map((o) => (
                <span key={o.slug} className="pill">{o.name}</span>
              ))}
            </div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] font-bold text-[var(--ink-3)] mt-6 mb-3">Style</p>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <span key={s} className="pill">{s}</span>
              ))}
            </div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] font-bold text-[var(--ink-3)] mt-6 mb-3">Service</p>
            <div className="flex flex-wrap gap-2">
              {workServiceFilters.map((s) => (
                <span key={s} className="pill">{s}</span>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {works.map((w, i) => (
              <article key={w.slug} className="glass glass-sheen overflow-hidden tilt" data-tilt="6" data-reveal style={{ ["--i" as string]: i % 3 }}>
                <div className="media aspect-[4/3]">
                  <Image src={w.image} alt={w.title} fill sizes="(max-width:1024px) 92vw, 33vw" loading="lazy" className="object-cover" />
                  <span className="tag-chip">{w.occasion}</span>
                </div>
                <div className="p-6">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] font-bold text-[var(--ink-3)]">
                    {w.style} · {w.place}
                  </p>
                  <h2 className="t-3 mt-2">{w.title}</h2>
                  <p className="text-sm text-[var(--ink-2)] mt-2.5 leading-relaxed">{w.blurb}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaQuote />
    </>
  );
}
