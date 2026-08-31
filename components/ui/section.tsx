import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Container } from './container';

type Spacing = 'compact' | 'default' | 'spacious';
type Tone = 'surface' | 'subtle' | 'muted' | 'inverse';

const spacings: Record<Spacing, string> = {
  compact: 'py-10 sm:py-12',
  default: 'py-14 sm:py-20',
  spacious: 'py-20 sm:py-28',
};

const tones: Record<Tone, string> = {
  surface: 'bg-surface text-ink',
  subtle: 'bg-surface-subtle text-ink',
  muted: 'bg-surface-muted text-ink',
  inverse: 'bg-surface-inverse text-ink-inverse',
};

export function Section({
  children,
  spacing = 'default',
  tone = 'surface',
  width = 'wide',
  className,
  id,
  'aria-labelledby': ariaLabelledBy,
}: {
  children: ReactNode;
  spacing?: Spacing;
  tone?: Tone;
  width?: 'narrow' | 'default' | 'wide' | 'full';
  className?: string;
  id?: string;
  'aria-labelledby'?: string;
}) {
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
 * Standard section heading: optional eyebrow, a heading and an optional lead
 * paragraph. Keeps heading rhythm and hierarchy consistent across the site.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  level = 2,
  align = 'start',
  tone = 'default',
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  id?: string;
  level?: 1 | 2 | 3;
  align?: 'start' | 'center';
  tone?: 'default' | 'inverse';
}) {
  const Heading = `h${level}` as 'h1' | 'h2' | 'h3';
  const sizes = {
    1: 'text-4xl sm:text-5xl',
    2: 'text-3xl sm:text-4xl',
    3: 'text-2xl',
  } as const;

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl',
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'text-xs font-semibold tracking-[0.18em] uppercase',
            tone === 'inverse' ? 'text-accent-300' : 'text-brand-700',
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Heading id={id} className={cn(sizes[level], 'font-medium')}>
        {title}
      </Heading>
      {lead ? (
        <p
          className={cn(
            'text-lg',
            tone === 'inverse' ? 'text-sand-200' : 'text-ink-muted',
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
