import { DesignCard } from './design-card';
import type { PortfolioDesign } from '../types';

export function DesignGrid({ designs }: { designs: readonly PortfolioDesign[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design, index) => (
        <DesignCard key={design.id} design={design} priority={index < 3} />
      ))}
    </ul>
  );
}
