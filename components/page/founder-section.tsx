import { GlassPanel } from '@/components/ui';
import { founder, founderPhoto } from '@/lib/content/founder';

/**
 * A tasteful, clearly-a-placeholder founder portrait.
 *
 * Redesign brief section 15: no real photograph exists yet, and the
 * placeholder must look intentional rather than broken. Rather than a fake
 * stock photo standing in for a real person, this is an abstract monogram
 * plate in the brand's own colours — unmistakably a placeholder, premium
 * rather than empty, and it is the single thing that changes (an `<Image>`
 * of the approved photograph in place of this component) once VRK Decor
 * supplies one; see `lib/content/founder.ts`.
 */
function FounderPortrait() {
  const initials = founder.name
    .split(' ')
    .filter((part) => /[A-Za-z]/.test(part))
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className="from-surface-tint via-canvas-deep to-brand-900 ambient-glow relative isolate flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br"
      role="img"
      aria-label={founderPhoto.isPlaceholder ? `${founder.name}, ${founder.role} (photograph coming soon)` : founderPhoto.alt}
    >
      <span className="font-display text-accent-300/70 text-[7rem] leading-none font-medium select-none sm:text-[8rem]">
        {initials}
      </span>
      {founderPhoto.isPlaceholder ? (
        <span className="border-line-soft bg-canvas-deep/80 text-ink-muted absolute bottom-4 left-4 rounded-full border px-3 py-1 text-2xs font-medium tracking-wide uppercase">
          Photograph coming soon
        </span>
      ) : null}
    </div>
  );
}

/** Founder & CEO section — redesign brief sections 13–14. */
export function FounderSection() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
      <div className="animate-fade-up mx-auto w-full max-w-sm lg:max-w-none">
        <FounderPortrait />
      </div>

      <GlassPanel
        tone="tint"
        radius="3xl"
        className="animate-fade-up stagger-2 flex flex-col gap-4 p-6 sm:p-8"
      >
        <p className="text-accent-300 text-2xs font-semibold tracking-[0.24em] uppercase">
          {founder.role}
        </p>
        <h3 className="font-display text-3xl font-medium">{founder.name}</h3>
        {founder.bio.map((paragraph) => (
          <p key={paragraph} className="text-ink-soft leading-relaxed">
            {paragraph}
          </p>
        ))}
      </GlassPanel>
    </div>
  );
}
