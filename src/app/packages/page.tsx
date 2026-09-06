import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import Icon from "@/components/ui/Icon";
import CtaQuote from "@/components/home/CtaQuote";
import { business, packagesIntro, quotationCovers, services } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Packages are being finalised. Every VRK Decor celebration is quoted on its own, around your date, your venue and the look you have in mind.",
  alternates: { canonical: "/packages" },
};

export default function PackagesPage() {
  return (
    <>
      <PageHero
        eyebrow="Packages"
        title="Every celebration is quoted on its own"
        lede={packagesIntro.body}
      />

      <section className="section-tight !pt-0">
        <div className="shell">
          <div className="glass glass-raised glass-sheen p-8 md:p-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" data-reveal>
            <div className="max-w-2xl">
              <span className="partner-badge !mt-0">{packagesIntro.status}</span>
              <p className="t-2 mt-4">{packagesIntro.callout}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/quote" className="btn btn-primary" data-magnetic="0.28">
                Get a Quote
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <a href={business.whatsappHref} className="btn btn-glass">
                <Icon name="whatsapp" className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight !pt-0">
        <div className="shell">
          <span className="eyebrow" data-reveal>
            What a quotation covers
          </span>
          <h2 className="t-1 mt-4 mb-10 max-w-3xl" data-reveal style={{ ["--i" as string]: 1 }}>
            Priced by what your day actually needs
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quotationCovers.map((c, i) => (
              <div key={c.title} className="glass glass-sheen p-7 lift" data-reveal style={{ ["--i" as string]: i }}>
                <span className="feature-icon">
                  <Icon name={c.icon} className="h-5 w-5" />
                </span>
                <h3 className="t-3 mt-5">{c.title}</h3>
                <p className="text-sm text-[var(--ink-2)] mt-2.5 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight !pt-0">
        <div className="shell">
          <div className="glass glass-recessed glass-sheen p-7 md:p-9" data-reveal>
            <p className="eyebrow mb-5">Included in most setups</p>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <div key={s.slug} className="flex items-start gap-2.5 text-sm text-[var(--ink-2)]">
                  <Icon name="check" className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-lime-600)]" />
                  <span>
                    {s.name}
                    {s.partner ? <em className="not-italic text-[var(--ink-3)]"> (partner vendor)</em> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaQuote />
    </>
  );
}
