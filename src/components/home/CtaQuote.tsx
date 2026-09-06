import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { business, sections } from "@/lib/content/site";

export default function CtaQuote() {
  return (
    <section className="section relative" aria-labelledby="cta-title">
      <div className="shell">
        <div className="band-dark grain glass glass-sheen relative overflow-hidden px-7 py-14 md:px-16 md:py-20 text-center" data-reveal="scale">
          <div className="aura aura-lime" style={{ width: 620, height: 620, left: "-8%", top: "-40%", opacity: 0.45 }} />
          <div className="aura aura-warm" style={{ width: 520, height: 520, right: "-6%", bottom: "-46%", opacity: 0.3 }} />

          <div className="relative z-10">
            <span className="eyebrow justify-center">{sections.cta.eyebrow}</span>
            <h2 id="cta-title" className="t-1 mt-5 max-w-3xl mx-auto">
              {sections.cta.title}
            </h2>
            <p className="lede mx-auto mt-5">{sections.cta.lede}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/quote" className="btn btn-primary" data-magnetic="0.3">
                Get a Quote
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <a href={business.whatsappHref} className="btn btn-glass" data-magnetic="0.22">
                <Icon name="whatsapp" className="h-4 w-4" />
                WhatsApp
              </a>
              <a href={business.phoneHref} className="btn btn-glass" data-magnetic="0.22">
                <Icon name="phone" className="h-4 w-4" />
                {business.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
