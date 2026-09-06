export default function PageHero({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <section className="page-hero">
      <div className="aura aura-lime" style={{ width: 620, height: 620, left: "-16%", top: "-40%", opacity: 0.42 }} />
      <div className="aura aura-warm" style={{ width: 460, height: 460, right: "-6%", top: "-30%", opacity: 0.28 }} />
      <div className="shell relative z-10">
        <span className="eyebrow" data-reveal>
          {eyebrow}
        </span>
        <h1 className="t-1 mt-4 max-w-4xl" data-reveal style={{ ["--i" as string]: 1 }}>
          {title}
        </h1>
        {lede ? (
          <p className="lede mt-5" data-reveal style={{ ["--i" as string]: 2 }}>
            {lede}
          </p>
        ) : null}
      </div>
    </section>
  );
}
