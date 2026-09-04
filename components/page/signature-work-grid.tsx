import { DesignCard } from '@/features/portfolio/components';
import type { PortfolioDesign } from '@/features/portfolio';

/**
 * "Our Signature Work" — home page (redesign brief section 2).
 *
 * A deliberate 2x2 desktop composition for four designs, rather than the
 * horizontal scroll rail used on the wider "Our Work" listing: four cards is a
 * small, curated set, and a rail with arrows and snap points reads as a device
 * built for many more items than it holds. `sm` steps to two columns and one
 * column on a phone, per the brief's responsive progression.
 *
 * Cards are staggered fade-up on scroll for the "alive" motion direction
 * (section 17); each is a plain CSS animation so it costs nothing beyond the
 * shared keyframes already defined in globals.css.
 */
export function SignatureWorkGrid({
  designs,
}: {
  designs: readonly PortfolioDesign[];
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
      {designs.map((design, index) => (
        <li
          key={design.id}
          className={`animate-fade-up stagger-${Math.min(index + 1, 4)}`}
        >
          <DesignCard
            design={design}
            priority={index < 2}
            showFeatured={false}
            sizes="(min-width: 1024px) 46vw, (min-width: 640px) 46vw, 92vw"
          />
        </li>
      ))}
    </ul>
  );
}
