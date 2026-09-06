import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { occasions, sections } from "@/lib/content/site";

export default function OccasionsRail() {
  return (
    <section className="section-tight" aria-labelledby="occasions-title">
      <div className="shell">
        <SectionHeading
          eyebrow={sections.occasions.eyebrow}
          title={<span id="occasions-title">{sections.occasions.title}</span>}
          action={
            <Link href="/our-work" className="btn btn-outline btn-sm">
              {sections.occasions.cta}
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          }
        />
      </div>
      <div className="shell">
        <div className="rail" data-reveal>
          {occasions.map((o) => (
            <Link
              key={o.slug}
              href={`/our-work?occasion=${o.slug}`}
              className="glass glass-sheen lift px-6 py-5 min-w-[248px] max-w-[268px]"
            >
              <span className="flex items-start gap-2.5">
                <span className="mega-icon shrink-0">
                  <Icon name="sparkle" className="h-3.5 w-3.5" />
                </span>
                <strong className="font-display text-[1.05rem] leading-snug">{o.name}</strong>
              </span>
              <p className="text-sm text-[var(--ink-3)] mt-3">{o.note}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
