export default function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={
        centered
          ? "flex flex-col items-center text-center gap-4 mb-12 md:mb-16"
          : "flex flex-col gap-4 mb-12 md:mb-16 md:flex-row md:items-end md:justify-between"
      }
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        <span className="eyebrow" data-reveal>
          {eyebrow}
        </span>
        <h2 className="t-1 mt-4" data-reveal style={{ ["--i" as string]: 1 }}>
          {title}
        </h2>
        {lede ? (
          <p className={`lede mt-5 ${centered ? "mx-auto" : ""}`} data-reveal style={{ ["--i" as string]: 2 }}>
            {lede}
          </p>
        ) : null}
      </div>
      {action ? (
        <div data-reveal style={{ ["--i" as string]: 3 }}>
          {action}
        </div>
      ) : null}
    </div>
  );
}
