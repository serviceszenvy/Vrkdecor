import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { sections, works } from "@/lib/content/site";

export default function SignatureWork() {
  const featured = works.filter((w) => w.featured).slice(0, 4);
  const [lead, ...rest] = featured;
  return (
    <section className="section relative" aria-labelledby="work-title">
      <div className="aura aura-olive" style={{ width: 520, height: 520, right: "-12%", top: "10%", opacity: 0.28 }} />
      <div className="shell relative z-10">
        <SectionHeading
          eyebrow={sections.work.eyebrow}
          title={<span id="work-title">{sections.work.title}</span>}
          lede={sections.work.lede}
          action={
            <Link href="/our-work" className="btn btn-outline">
              {sections.work.cta}
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-5 lg:grid-cols-12">
          <article className="glass glass-sheen overflow-hidden lg:col-span-7 lg:row-span-2 tilt" data-tilt="5" data-reveal>
            <Link href="/our-work" className="block h-full">
              <div className="media aspect-[16/12] lg:aspect-[16/13]">
                <Image src={lead.image} alt={lead.title} fill sizes="(max-width: 1024px) 92vw, 55vw" loading="lazy" className="object-cover" />
                <span className="tag-chip">{lead.occasion}</span>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-[0.72rem] uppercase tracking-[0.18em] font-bold text-[var(--ink-3)]">
                  {lead.style} · {lead.place}
                </p>
                <h3 className="t-2 mt-2.5">{lead.title}</h3>
                <p className="lede mt-3 text-[0.98rem]">{lead.blurb}</p>
              </div>
            </Link>
          </article>

          {rest.map((w, i) => (
            <article
              key={w.slug}
              className="glass glass-sheen overflow-hidden lg:col-span-5 tilt"
              data-tilt="6"
              data-reveal
              style={{ ["--i" as string]: i + 1 }}
            >
              <Link href="/our-work" className="flex h-full flex-col sm:flex-row lg:flex-row">
                <div className="media aspect-[16/10] sm:aspect-auto sm:w-2/5 sm:min-h-[150px] relative">
                  <Image src={w.image} alt={w.title} fill sizes="(max-width: 1024px) 92vw, 22vw" loading="lazy" className="object-cover" />
                </div>
                <div className="p-5 md:p-6 flex-1">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] font-bold text-[var(--color-lime-600)]">
                    {w.occasion} · {w.place}
                  </p>
                  <h3 className="t-3 mt-2">{w.title}</h3>
                  <p className="text-sm text-[var(--ink-3)] mt-2 line-clamp-2">{w.blurb}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
