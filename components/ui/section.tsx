import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Container } from './container';
import { LeafRule } from './glass';

type Spacing = 'compact' | 'default' | 'spacious' | 'panel';
type Tone =
  | 'surface'
  | 'canvas'
  | 'subtle'
  | 'muted'
  | 'tint'
  | 'inverse'
  | 'panel'
  | 'panel-deep'
  | 'panel-bloom';

const spacings: Record<Spacing, string> = {
  compact: 'py-10 sm:py-12',
  default: 'py-14 sm:py-20',
  spacious: 'py-20 sm:py-28',
  panel: 'py-12 sm:py-16',
};

const tones: Record<Tone, string> = {
  surface: 'bg-surface text-ink',
  canvas: 'text-ink',
  subtle: 'bg-surface-subtle text-ink',
  muted: 'bg-surface-muted text-ink',
  tint: 'bg-surface-tint text-ink',
  inverse: 'bg-surface-inverse text-ink-inverse',
  panel: 'text-ink',
  'panel-deep': 'text-ink-inverse',
  'panel-bloom': 'text-ink',
};

/** The surface each rounded panel tone paints. */
const panelSurfaces: Record<'panel' | 'panel-deep' | 'panel-bloom', string> = {
  panel: 'bg-surface border-line-soft shadow-panel',
  /* The dark olive band, lit by lime and sage; white text and lime focus. */
  'panel-deep': 'surface-aurora on-deep border-white/10 shadow-deep text-white',
  /* The tinted, more colourful light panel. */
  'panel-bloom': 'surface-bloom border-brand-200/60 shadow-panel',
};

/**
 * A page section.
 *
 * `tone="panel"` is the composition the approved reference design uses: a
 * rounded surface inset from the page ground, rather than a full-bleed band.
 * The panel keeps its own inset on small screens so the rounding is never
 * clipped by the viewport edge.
 */
export function Section({
  children,
  spacing = 'default',
  tone = 'canvas',
  width = 'wide',
  className,
  panelClassName,
  id,
  'aria-labelledby': ariaLabelledBy,
}: {
  children: ReactNode;
  spacing?: Spacing;
  tone?: Tone;
  width?: 'narrow' | 'default' | 'wide' | 'full';
  className?: string;
  /** Applied to the rounded panel itself when `tone="panel"`. */
  panelClassName?: string;
  id?: string;
  'aria-labelledby'?: string;
}) {
  if (tone === 'panel' || tone === 'panel-deep' || tone === 'panel-bloom') {
    return (
      <section
        id={id}
        aria-labelledby={ariaLabelledBy}
        className={cn('px-3 sm:px-5 lg:px-6', className)}
      >
        <div
          className={cn(
            'relative isolate mx-auto w-full max-w-[86rem]',
            'overflow-hidden rounded-3xl border',
            panelSurfaces[tone],
            spacings[spacing],
            panelClassName,
          )}
        >
          <Container width={width} className="relative">
            {children}
          </Container>
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(spacings[spacing], tones[tone], className)}
    >
      <Container width={width}>{children}</Container>
    </section>
  );
}

/**
 * Standard section heading.
 *
 * `accent` renders one word of the title in the brand green, which is the
 * device the approved reference design uses to give a heading its emphasis
 * ("Our *Signature* Work"). It is applied with a `<span>` inside the same
 * heading element, so the heading is still one string to a screen reader.
 */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  tail,
  lead,
  id,
  level = 2,
  align = 'start',
  tone = 'default',
  rule = false,
}: {
  eyebrow?: string;
  /** Rendered before `accent`. */
  title: string;
  /** Emphasised continuation of the title, in brand green. */
  accent?: string;
  /** The remainder of the title after the emphasised words. */
  tail?: string;
  lead?: string;
  id?: string;
  level?: 1 | 2 | 3;
  align?: 'start' | 'center';
  tone?: 'default' | 'inverse' | 'tint';
  /** The small leaf rule the reference design places under a centred heading. */
  rule?: boolean;
}) {
  const Heading = `h${level}` as 'h1' | 'h2' | 'h3';
  const sizes = {
    1: 'text-4xl sm:text-5xl',
    2: 'text-3xl sm:text-4xl',
    3: 'text-2xl',
  } as const;

  const eyebrowTone = {
    default: 'text-brand-700',
    inverse: 'text-accent-300',
    tint: 'text-brand-800',
  } as const;

  const leadTone = {
    default: 'text-ink-muted',
    inverse: 'text-ink-on-deep',
    tint: 'text-ink-soft',
  } as const;

  const accentTone = {
    default: 'text-gradient-sage',
    inverse: 'text-gradient-lime',
    tint: 'text-brand-800',
  } as const;

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'mx-auto max-w-2xl items-center text-center' : 'max-w-2xl',
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'text-2xs font-semibold tracking-[0.22em] uppercase',
            eyebrowTone[tone],
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <Heading id={id} className={cn(sizes[level], 'font-medium')}>
        {title}
        {accent ? <span className={accentTone[tone]}> {accent}</span> : null}
        {tail ? <span> {tail}</span> : null}
      </Heading>

      {rule ? <LeafRule className="mt-1" /> : null}

      {lead ? <p className={cn('text-lg', leadTone[tone])}>{lead}</p> : null}
    </div>
  );
}
