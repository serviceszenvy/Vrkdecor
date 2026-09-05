import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { FounderPortrait as FounderPortraitModel } from '@/lib/content/founder';

/**
 * The founder's portrait frame.
 *
 * Renders the real photograph when `lib/content/founder.ts` supplies one, and
 * a designed placeholder until then: a tailored silhouette on the deep olive
 * stage with a lime rim light, inside the same frame the photograph will use.
 * The frame, the ring, the floating name plate and the proportions are all
 * fixed here, so swapping the placeholder for the photograph changes nothing
 * about the layout. The placeholder is `aria-hidden`; the name and role beside
 * it are the accessible content.
 */
export function FounderPortrait({
  portrait,
  name,
  role,
  className,
}: {
  portrait: FounderPortraitModel | null;
  name: string;
  role: string;
  className?: string;
}) {
  return (
    <figure className={cn('relative mx-auto w-full max-w-sm', className)}>
      <div className="from-brand-800 via-brand-900 to-brand-950 shadow-deep relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-gradient-to-br ring-1 ring-white/15">
        <span
          aria-hidden="true"
          className="ambient-blob bg-accent-500/40 -top-16 -right-10 size-64"
        />
        <span
          aria-hidden="true"
          className="ambient-blob ambient-blob-slow bg-brand-400/40 -bottom-20 -left-16 size-64"
        />
        <div aria-hidden="true" className="pattern-dots absolute inset-0 opacity-40" />

        {portrait ? (
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            sizes="(min-width: 1024px) 24rem, 90vw"
            className="object-cover"
            data-testid="founder-photo"
          />
        ) : (
          <PlaceholderSilhouette />
        )}

        <div
          aria-hidden="true"
          className="from-brand-950/80 absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent"
        />
      </div>

      <figcaption className="glass-surface-deep glass-edge motion-safe:animate-float absolute -bottom-5 left-1/2 flex w-[85%] -translate-x-1/2 flex-col items-center rounded-2xl px-4 py-3 text-center text-white">
        <span className="font-display text-lg leading-tight font-medium">{name}</span>
        <span className="text-accent-300 text-2xs font-semibold tracking-[0.2em] uppercase">
          {role}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * A tasteful, obviously designed placeholder: head and shoulders in sage,
 * a lime rim light along one side, and no face, so it never reads as a stock
 * photograph of somebody else.
 */
function PlaceholderSilhouette() {
  return (
    <svg
      viewBox="0 0 400 500"
      aria-hidden="true"
      focusable="false"
      data-testid="founder-placeholder"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="founder-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#85a06a" />
          <stop offset="100%" stopColor="#475637" />
        </linearGradient>
        <linearGradient id="founder-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c7e79d" stopOpacity="0" />
          <stop offset="100%" stopColor="#c7e79d" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="founder-halo" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#8ec840" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8ec840" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="210" r="190" fill="url(#founder-halo)" />

      {/* Shoulders */}
      <path
        d="M60 500 C60 380 120 330 200 320 C280 330 340 380 340 500 Z"
        fill="url(#founder-body)"
      />
      <path
        d="M150 340 C170 355 230 355 250 340"
        fill="none"
        stroke="#c7e79d"
        strokeOpacity="0.45"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Neck and head */}
      <rect x="176" y="250" width="48" height="70" rx="20" fill="#6d8455" />
      <ellipse cx="200" cy="200" rx="72" ry="86" fill="url(#founder-body)" />

      {/* Rim light */}
      <path
        d="M262 150 C282 190 280 240 258 276"
        fill="none"
        stroke="url(#founder-rim)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M300 380 C330 400 340 440 340 500"
        fill="none"
        stroke="url(#founder-rim)"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
