import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';
import { IconChip, Reveal } from '@/components/ui';
import {
  BuildingIcon,
  CakeIcon,
  CalendarIcon,
  FlowerIcon,
  GiftIcon,
  HeartIcon,
  HomeIcon,
  LampIcon,
  LeafIcon,
  RingsIcon,
  SparkIcon,
  StarIcon,
  TeamIcon,
} from '@/components/layout/icons';
import { routes } from '@/lib/navigation';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * One icon per approved occasion slug (Requirements section 5). Slugs come from
 * the seeded reference data, so an occasion added later simply falls back to
 * the calendar glyph rather than breaking the grid.
 */
const OCCASION_ICONS: Record<string, Icon> = {
  wedding: FlowerIcon,
  reception: LampIcon,
  engagement: RingsIcon,
  'seer-varisai': GiftIcon,
  'puberty-ceremony': SparkIcon,
  'ear-piercing': StarIcon,
  'holy-communion': LeafIcon,
  'baby-shower': HeartIcon,
  housewarming: HomeIcon,
  birthday: CakeIcon,
  anniversary: HeartIcon,
  'corporate-events': BuildingIcon,
  'college-events': TeamIcon,
  'other-celebrations': CalendarIcon,
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
    <ul className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
      {occasions.map((occasion, index) => {
        const OccasionIcon = OCCASION_ICONS[occasion.slug] ?? CalendarIcon;
        return (
          <Reveal key={occasion.slug} as="li" delay={Math.min(index * 40, 240)}>
            <Link
              href={`${routes.work}?occasion=${encodeURIComponent(occasion.slug)}`}
              className="border-line-soft bg-surface hover:border-brand-300 hover:bg-brand-50/60 hover:shadow-card group flex h-full min-h-[7.5rem] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-1.5 py-5 text-center transition-[background-color,border-color,box-shadow] duration-300 sm:px-3"
            >
              <IconChip
                tone="brand"
                size="md"
                className="group-hover:bg-brand-100 transition-colors"
              >
                <OccasionIcon className="size-6" />
              </IconChip>
              <span className="text-ink w-full text-xs leading-tight font-medium text-balance wrap-anywhere sm:text-sm">
                {occasion.name}
              </span>
              {occasion.secondaryTerm ? (
                <span className="text-ink-muted w-full text-[0.66rem] leading-tight text-balance wrap-anywhere">
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
