import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { sections, styles } from "@/lib/content/site";

export default function BrowseByStyle() {
  return (
    <section className="section-tight" aria-labelledby="styles-title">
      <div className="shell">
        <SectionHeading
          eyebrow={sections.stylesSection.eyebrow}
          title={<span id="styles-title">{sections.stylesSection.title}</span>}
          lede={sections.stylesSection.lede}
          align="center"
        />
        <div className="flex flex-wrap justify-center gap-2.5" data-reveal>
          {styles.map((s, i) => (
            <Link key={s} href="/our-work" className="pill !px-5 !py-3 !text-[0.95rem]" data-active={i === 0} style={{ ["--i" as string]: i }}>
              {s}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
