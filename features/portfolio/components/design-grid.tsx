import { Reveal } from '@/components/ui';
import { DesignCard } from './design-card';
import type { PortfolioDesign } from '../types';

/**
 * The portfolio grid.
 *
 * Two across on a phone, not one. A single column of 5:6 cards gave each
 * design most of a screen, so browsing twelve of them was a scroll of about
 * six thousand pixels; two across shows a pair at a time and makes the page
 * feel like a portfolio rather than a queue. The card's own type and chips
 * step down at the same breakpoint so nothing is cramped at half width.
 */
export function DesignGrid({ designs }: { designs: readonly PortfolioDesign[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {designs.map((design, index) => (
        <Reveal as="li" key={design.id} delay={(index % 2) * 100} effect="scale">
          <DesignCard
            design={design}
            priority={index < 4}
            sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 46vw"
          />
        </Reveal>
      ))}
    </ul>
  );
}
