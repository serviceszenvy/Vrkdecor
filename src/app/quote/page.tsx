import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import QuoteForm from "@/components/forms/QuoteForm";
import Icon from "@/components/ui/Icon";
import { howItWorks } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Get a quote",
  description: "Send your date, venue and the look you want. Three fields is enough to start.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Get a Quote"
        title="Send us your date, your venue and the look you want"
        lede="You get a confirmation straight away, and our team follows up on the phone or on WhatsApp to talk through what you need."
      />

      <section className="section-tight !pt-0">
        <div className="shell grid gap-6 lg:grid-cols-[1fr_0.7fr] items-start">
          <QuoteForm />

          <aside className="glass glass-sheen p-7" data-reveal style={{ ["--i" as string]: 1 }}>
            <h2 className="t-3">What happens next</h2>
            <ol className="mt-5 space-y-5">
              {howItWorks.map((s) => (
                <li key={s.step} className="flex gap-4">
                  <span className="mega-icon shrink-0">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <strong className="block text-[0.95rem]">{s.title}</strong>
                    <small className="block text-sm text-[var(--ink-3)] mt-0.5">{s.body}</small>
                  </span>
                </li>
              ))}
            </ol>
            <p className="muted text-xs mt-7 border-t pt-5">
              Reference images you send stay private. They are visible only to our own team, never on the website.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
