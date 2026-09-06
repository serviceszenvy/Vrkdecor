import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/ui/PageHero";
import LeafDivider from "@/components/ui/LeafDivider";
import ServiceAreas from "@/components/home/ServiceAreas";
import CtaQuote from "@/components/home/CtaQuote";
import Icon from "@/components/ui/Icon";
import { business, stats, whyUs } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "VRK Decor is an event design and coordination brand based in Nagercoil, Tamil Nadu, with 14 years of practice and a team of 35.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    title: "Personal before impressive",
    body: "A setup should look like your family and your occasion first. Scale is easy to buy. Getting the feeling right is the part that takes practice.",
    icon: "compass",
  },
  {
    title: "Designed to survive the venue",
    body: "A design only counts once it is standing in the hall. We plan around ceiling heights, entrance widths and what the venue allows before anything is promised.",
    icon: "arch",
  },
  {
    title: "One point of accountability",
    body: "You deal with our team from the first call to the final clearance, including the partner vendors we bring in around us.",
    icon: "team",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About VRK Decor"
        title="Premium event design and complete celebration solutions"
        lede="An event design and coordination brand based in Nagercoil, Tamil Nadu, working across the southern districts and further into the state when a celebration calls for it."
      />

      <section className="section-tight !pt-0">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_0.9fr] items-center">
          <div className="glass glass-raised glass-sheen overflow-hidden" data-reveal="scale">
            <div className="media aspect-[7/5]">
              <Image
                src="/images/about-team.svg"
                alt="The VRK Decor team on site before a celebration"
                fill
                sizes="(max-width:1024px) 92vw, 46vw"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="t-2" data-reveal>
              Built around the people who do the work
            </h2>
            <p className="lede mt-5" data-reveal style={{ ["--i" as string]: 1 }}>
              Thirty five people cover design, stage and mandap, florals, entrance, furniture and seating in house.
              Makeup, sound and lighting, photography and catering are arranged with partner vendors we have worked
              alongside for years, and we still run the timeline on the day.
            </p>
            <p className="lede mt-4" data-reveal style={{ ["--i" as string]: 2 }}>
              More than 600 celebrations have been set up for families and companies across Tamil Nadu. That is the
              reason we can walk into a hall and already know where the problems will be.
            </p>
            <div className="glass glass-sheen p-6 mt-7" data-reveal style={{ ["--i" as string]: 3 }}>
              <p className="text-[0.7rem] uppercase tracking-[0.18em] font-bold text-[var(--ink-3)]">
                {business.founderRole}
              </p>
              <p className="font-display text-xl mt-1.5">{business.founder}</p>
              <p className="text-sm text-[var(--ink-2)] mt-2.5 leading-relaxed">
                His brief to the team has not changed in fourteen years. Celebrations should feel personal, look
                beautifully designed and be executed with attention to the details nobody photographs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LeafDivider />

      <section className="section-tight">
        <div className="shell grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className="glass glass-sheen px-6 py-7 text-center lift" data-reveal style={{ ["--i" as string]: i }}>
              <p className="font-display text-[clamp(2rem,4vw,2.8rem)] leading-none">
                <span data-countup={s.value}>0</span>
                <span className="text-[var(--color-lime-600)]">{s.suffix}</span>
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.18em] font-bold text-[var(--ink-3)] mt-3">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-tight !pt-0">
        <div className="shell">
          <span className="eyebrow" data-reveal>
            How we work
          </span>
          <h2 className="t-1 mt-4 mb-10 max-w-3xl" data-reveal style={{ ["--i" as string]: 1 }}>
            Three things we hold to on every celebration
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {principles.map((p, i) => (
              <div key={p.title} className="glass glass-sheen p-7 lift" data-reveal style={{ ["--i" as string]: i }}>
                <span className="feature-icon">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                <h3 className="t-3 mt-5">{p.title}</h3>
                <p className="text-sm text-[var(--ink-2)] mt-2.5 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight !pt-0">
        <div className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item, i) => (
            <div key={item.title} className="glass glass-sheen p-6 lift" data-reveal style={{ ["--i" as string]: i }}>
              <span className="feature-icon">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <h3 className="t-3 mt-5">{item.title}</h3>
              <p className="text-sm text-[var(--ink-2)] mt-2.5 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ServiceAreas />
      <CtaQuote />
    </>
  );
}
