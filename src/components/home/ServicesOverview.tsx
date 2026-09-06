import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { sections, services, supportServices } from "@/lib/content/site";

export default function ServicesOverview() {
  return (
    <section className="section relative" aria-labelledby="services-title">
      <div className="aura aura-lime" style={{ width: 560, height: 560, left: "-14%", top: "18%", opacity: 0.3 }} />
      <div className="shell relative z-10">
        <SectionHeading
          eyebrow={sections.services.eyebrow}
          title={<span id="services-title">{sections.services.title}</span>}
          lede={sections.services.lede}
          action={
            <Link href="/services" className="btn btn-outline">
              {sections.services.cta}
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Link key={s.slug} href="/services" className="glass glass-sheen p-7 lift group" data-reveal style={{ ["--i" as string]: i }}>
              <div className="flex items-start justify-between gap-4">
                <span className="feature-icon">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                {s.partner ? <span className="partner-badge !mt-0">with partner vendors</span> : null}
              </div>
              <h3 className="t-3 mt-5">{s.name}</h3>
              <p className="text-sm text-[var(--ink-2)] mt-2.5 leading-relaxed">{s.blurb}</p>
              <ul className="mt-5 space-y-1.5 border-t pt-4">
                {s.includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-2 text-[0.82rem] text-[var(--ink-3)]">
                    <Icon name="check" className="h-3.5 w-3.5 mt-1 shrink-0 text-[var(--color-lime-600)]" />
                    {inc}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        <div className="glass glass-recessed glass-sheen mt-5 p-6 md:p-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" data-reveal>
          <p className="text-sm font-semibold">Also arranged by our team</p>
          <div className="flex flex-wrap gap-2">
            {supportServices.map((s) => (
              <span key={s} className="pill">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
