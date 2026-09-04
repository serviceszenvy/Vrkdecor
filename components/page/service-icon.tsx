import type { ComponentType, SVGProps } from 'react';
import {
  CakeIcon,
  CameraIcon,
  FlowerIcon,
  GiftIcon,
  GridIcon,
  HomeIcon,
  LampIcon,
  LeafIcon,
  SparkIcon,
  StarIcon,
  TeamIcon,
} from '@/components/layout/icons';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * One glyph per approved service slug (Requirements section 6). Slugs come from
 * the seeded reference data, so a service added later falls back to the leaf
 * rather than breaking the layout.
 */
const SERVICE_ICONS: Record<string, Icon> = {
  'event-wedding-decoration': SparkIcon,
  'stage-mandap-decoration': HomeIcon,
  'floral-decoration': FlowerIcon,
  'entrance-decoration': LeafIcon,
  'makeup-styling': StarIcon,
  'sounds-lightings': LampIcon,
  'photography-videography': CameraIcon,
  'food-catering': CakeIcon,
  'furniture-seating': TeamIcon,
  'led-display-solutions': GridIcon,
  'return-gifts-essentials': GiftIcon,
  'complete-event-management': SparkIcon,
};

export function serviceIcon(slug: string): Icon {
  return SERVICE_ICONS[slug] ?? LeafIcon;
}
