import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { business } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How VRK Decor collects, uses and stores the information you send through this website.",
  alternates: { canonical: "/privacy-policy" },
};

const sections = [
  ["What we collect", "When you send an enquiry we keep your name, phone number, the date and venue of your function, any email address you give us, and any reference images you upload. Nothing else."],
  ["Why we keep it", "So we can call you back, prepare a quote, and plan the setup. We do not sell it, rent it or share it with anyone outside the people working on your event."],
  ["Reference images", "Images you upload with an enquiry are private. They are visible only to our own team inside the admin panel and are never published on this website or anywhere else."],
  ["How long we keep it", "Enquiries stay in our system while we are talking to you and for two years afterwards, so we can find your file if you come back to us. Ask us and we will delete it sooner."],
  ["Cookies and analytics", "This website uses a small number of cookies to keep the site working and to measure traffic in aggregate. No advertising trackers."],
  ["Your choices", "Write to us at the email below and we will show you what we hold, correct it, or delete it."],
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" lede="Last updated 5 September 2026." />
      <section className="section-tight !pt-0">
        <div className="shell-narrow space-y-5">
          {sections.map(([h, b], i) => (
            <div key={h} className="glass glass-sheen p-7" data-reveal style={{ ["--i" as string]: i % 3 }}>
              <h2 className="t-3">{h}</h2>
              <p className="lede mt-3 text-[0.98rem]">{b}</p>
            </div>
          ))}
          <p className="muted text-sm">
            Questions about any of this go to <a href={business.emailHref} className="underline-sweep">{business.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
