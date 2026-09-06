import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { sections } from "@/lib/content/site";

/**
 * The live site has no published reviews yet, so this is an honest empty
 * state rather than invented quotes.
 */
export default function Testimonials() {
  return (
    <section className="section-tight relative" aria-labelledby="testimonials-title">
      <div className="shell">
        <SectionHeading
          eyebrow={sections.testimonials.eyebrow}
          title={<span id="testimonials-title">{sections.testimonials.title}</span>}
          align="center"
        />
        <div className="glass glass-sheen p-10 md:p-14 text-center max-w-3xl mx-auto" data-reveal="scale">
          <span className="feature-icon mx-auto">
            <Icon name="quote" className="h-5 w-5" />
          </span>
          <p className="lede mt-6 mx-auto">{sections.testimonials.lede}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/our-work" className="btn btn-outline btn-sm">
              See the work instead
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <a href="https://wa.me/919994072435" className="btn btn-glass btn-sm">
              <Icon name="whatsapp" className="h-4 w-4" />
              Ask us for references
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
