import { Reveal } from '@/components/ui';
import { DesignCard } from './design-card';
import type { PortfolioDesign } from '../types';

export function DesignGrid({ designs }: { designs: readonly PortfolioDesign[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {designs.map((design, index) => (
        <Reveal key={design.id} as="li" delay={Math.min((index % 6) * 60, 240)}>
          <DesignCard
            design={design}
            priority={index < 3}
            sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 92vw"
          />
        </Reveal>
      ))}
    </ul>
  );
}
