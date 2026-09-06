import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import Icon from "@/components/ui/Icon";
import LeafDivider from "@/components/ui/LeafDivider";
import CtaQuote from "@/components/home/CtaQuote";
import HowItWorks from "@/components/home/HowItWorks";
import { occasions, services } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Stage and mandap builds, florals, entrances, makeup and lighting, coordinated by one team.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Four things we build ourselves, two we coordinate"
        lede="The difference matters to your budget, so we label it plainly rather than hiding it in a package."
      />

      <section className="section-tight !pt-0">
        <div className="shell grid gap-5 md:grid-cols-2">
          {services.map((s, i) => (
            <article key={s.slug} className="glass glass-sheen p-7 md:p-9 lift" data-reveal style={{ ["--i" as string]: i % 2 }}>
              <div className="flex items-start justify-between gap-4">
                <span className="feature-icon">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                {s.partner ? <span className="partner-badge !mt-0">with partner vendors</span> : null}
              </div>
              <h2 className="t-2 mt-6">{s.name}</h2>
              <p className="lede mt-3 text-[0.98rem]">{s.blurb}</p>
              <ul className="mt-6 grid gap-2 border-t pt-5">
                {s.includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-2.5 text-sm text-[var(--ink-2)]">
                    <Icon name="check" className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-lime-600)]" />
                    {inc}
                  </li>
                ))}
              </ul>
              <Link href="/quote" className="btn btn-outline btn-sm mt-7">
                Ask about this
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <LeafDivider />

      <section className="section-tight">
        <div className="shell">
          <span className="eyebrow" data-reveal>Occasions we cover</span>
          <h2 className="t-1 mt-4 mb-10 max-w-3xl" data-reveal>The same team, whatever the function is called</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {occasions.map((o, i) => (
              <div key={o.slug} className="glass glass-sheen px-6 py-5 lift" data-reveal style={{ ["--i" as string]: i % 3 }}>
                <strong className="font-display text-lg">{o.name}</strong>
                <p className="text-sm text-[var(--ink-3)] mt-1.5">{o.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <CtaQuote />
    </>
  );
}
