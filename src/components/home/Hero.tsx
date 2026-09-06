import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { business, hero, stats } from "@/lib/content/site";

const chips = [stats[1], stats[0], stats[2]];

export default function Hero() {
  return (
    <section
      className="relative overflow-x-clip pt-[calc(var(--header-h)+1.75rem)] pb-14 md:pt-[calc(var(--header-h)+2.75rem)] md:pb-20"
      aria-labelledby="hero-title"
    >
      <div className="aura aura-lime" style={{ width: 720, height: 720, left: "-18%", top: "-24%", opacity: 0.5 }} />
      <div className="aura aura-warm" style={{ width: 560, height: 560, right: "4%", bottom: "-26%", opacity: 0.4 }} />

      <div className="shell relative z-10 grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        {/* ---------- Copy column ---------- */}
        <div>
          <span className="pill !py-2 !px-4 !text-[0.72rem] !tracking-[0.14em] !uppercase !font-bold" data-reveal>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-lime-500)]" />
            {hero.eyebrow} · {business.city}, {business.state}
          </span>

          <h1 id="hero-title" className="t-display mt-7">
            {hero.headline.map((w, i) => (
              <span key={w + i} className="word" style={{ ["--w" as string]: i }}>
                {i >= hero.highlightFrom ? (
                  <em className="not-italic bg-[linear-gradient(120deg,var(--color-lime-600),var(--color-olive-500))] bg-clip-text text-transparent">
                    {w}
                  </em>
                ) : (
                  w
                )}
              </span>
            ))}
          </h1>

          <p className="lede mt-7" data-reveal style={{ ["--i" as string]: 4 }}>
            {hero.lede}
          </p>

          <div className="mt-9 flex flex-wrap gap-3" data-reveal style={{ ["--i" as string]: 5 }}>
            <Link href={hero.primaryCta.href} className="btn btn-primary" data-magnetic="0.3">
              {hero.primaryCta.label}
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href={hero.secondaryCta.href} className="btn btn-glass" data-magnetic="0.22">
              {hero.secondaryCta.label}
            </Link>
          </div>

          <div
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[var(--ink-3)]"
            data-reveal
            style={{ ["--i" as string]: 6 }}
          >
            {hero.assurances.map((a) => (
              <span key={a} className="flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-[var(--color-lime-600)]" />
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* ---------- Media column ---------- */}
        <div className="relative" data-reveal="scale" style={{ ["--i" as string]: 2 }}>
          <div className="glass glass-raised glass-sheen overflow-hidden rounded-[28px]" data-parallax="10">
            <div className="media aspect-[4/5] sm:aspect-[16/11] lg:aspect-[5/6]">
              <Image
                src="/images/hero.svg"
                alt="A VRK Decor mandap setting lit for an evening ceremony"
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="object-cover kenburns"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(200deg, rgba(20,26,17,0) 45%, rgba(20,26,17,0.55))" }}
              />
            </div>
          </div>

          {chips.map((s, i) => (
            <div
              key={s.label}
              className={`glass glass-float absolute px-5 py-3.5 float-soft ${
                ["-left-3 top-[16%] sm:-left-6", "-right-2 top-[46%] sm:-right-5", "left-[8%] -bottom-5"][i]
              }`}
              style={{ animationDelay: `${0.4 + i * 0.5}s` }}
              data-parallax={[26, 18, 32][i]}
            >
              <p className="font-display text-2xl leading-none">
                <span data-countup={s.value}>0</span>
                {s.suffix}
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.16em] font-bold text-[var(--ink-3)] mt-1.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
