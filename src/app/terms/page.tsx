import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { business } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that apply when you book decoration services from VRK Decor.",
  alternates: { canonical: "/terms" },
};

const sections = [
  ["Quotes", "A quote holds for thirty days and is based on the venue, guest count and design agreed at the time. If any of those change, the price changes with them and we will tell you before we proceed."],
  ["Booking and advance", "A date is held only once the advance is received. The advance is adjusted against the final bill."],
  ["Changes", "Design changes are welcome up to seven days before the function. After that we can usually still adjust colours and florals, but structural changes may not be possible."],
  ["Cancellation", "Cancel more than thirty days ahead and the advance is refunded less any materials already bought for you. Inside thirty days the advance is retained."],
  ["Venue conditions", "We work within what the venue allows. Where a venue refuses a fixing, a load or a timing, we will propose the nearest alternative at no extra design cost."],
  ["Photography", "We photograph our own setups and may use those images in our portfolio. Tell us if you would rather we did not, and we will not."],
  ["Partner vendors", "Makeup, sound and lighting are delivered by partner vendors. We coordinate them and stand behind the schedule, and their own terms apply to their work."],
];

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" lede="Last updated 5 September 2026." />
      <section className="section-tight !pt-0">
        <div className="shell-narrow space-y-5">
          {sections.map(([h, b], i) => (
            <div key={h} className="glass glass-sheen p-7" data-reveal style={{ ["--i" as string]: i % 3 }}>
              <h2 className="t-3">{h}</h2>
              <p className="lede mt-3 text-[0.98rem]">{b}</p>
            </div>
          ))}
          <p className="muted text-sm">
            Anything unclear, ask us at <a href={business.emailHref} className="underline-sweep">{business.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
