import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import { IconChip, Reveal } from '@/components/ui';
import {
  ArchIcon,
  BalloonIcon,
  BuildingIcon,
  CalendarIcon,
  ConfettiIcon,
  GiftIcon,
  HeartIcon,
  HomeIcon,
  RattleIcon,
  RingsIcon,
  SparkIcon,
  StageIcon,
  StarIcon,
  TeamIcon,
  ToastIcon,
} from '@/components/layout/icons';
import { routes } from '@/lib/navigation';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * One icon per approved occasion slug (Requirements section 5). Slugs come from
 * the seeded reference data, so an occasion added later simply falls back to
 * the calendar glyph rather than breaking the grid.
 */
const OCCASION_ICONS: Record<string, Icon> = {
  wedding: ArchIcon,
  reception: StageIcon,
  engagement: RingsIcon,
  'seer-varisai': GiftIcon,
  'puberty-ceremony': SparkIcon,
  'ear-piercing': StarIcon,
  'holy-communion': HeartIcon,
  'baby-shower': RattleIcon,
  housewarming: HomeIcon,
  birthday: BalloonIcon,
  anniversary: ToastIcon,
  'corporate-events': BuildingIcon,
  'college-events': TeamIcon,
  'other-celebrations': ConfettiIcon,
};

export type OccasionTile = {
  name: string;
  slug: string;
  secondaryTerm?: string | null;
};

/**
 * The occasions grid.
 *
 * Each tile links straight into the portfolio filtered by that occasion, which
 * is what a visitor actually wants from this section: the tiles are a way into
 * the work, not decoration. Three across on a phone and six on a desktop, as in
 * the approved reference design.
 *
 * The Tamil secondary term is shown wherever the requirements pair one with the
 * English name, because that is how these ceremonies are usually spoken about.
 */
export function OccasionGrid({ occasions }: { occasions: readonly OccasionTile[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {occasions.map((occasion, index) => {
        const OccasionIcon = OCCASION_ICONS[occasion.slug] ?? CalendarIcon;
        return (
          <Reveal as="li" key={occasion.slug} delay={index * 70} effect="scale">
            <Link
              href={`${routes.work}?occasion=${encodeURIComponent(occasion.slug)}`}
              className="border-brand-200/70 hover:border-accent-500/70 lift shine press group shadow-card flex h-full min-h-[7.25rem] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border bg-white/85 px-2.5 py-4 text-center transition-colors sm:min-h-[7.5rem] sm:px-3 sm:py-5"
            >
              <IconChip tone="deep" size="md">
                <OccasionIcon className="size-6" />
              </IconChip>
              {/*
                `wrap-anywhere` used to be on both of these. At three tiles
                across a 393px screen it was splitting the Tamil terms through
                the middle of a word — "Nichayathartha / m" — which is worse
                than a tile that is a line taller. Two across gives every term
                room to break at a space, and `hyphens: auto` handles the one
                that still cannot.
              */}
              <span className="text-ink w-full text-xs leading-tight font-medium text-pretty hyphens-auto sm:text-sm">
                {occasion.name}
              </span>
              {occasion.secondaryTerm ? (
                <span className="text-ink-muted w-full text-[0.75rem] leading-tight text-pretty hyphens-auto">
                  {occasion.secondaryTerm}
                </span>
              ) : null}
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}
