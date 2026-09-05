import type { ComponentType, SVGProps } from 'react';
import {
  ArchIcon,
  BalloonIcon,
  BrushIcon,
  BuildingIcon,
  CameraIcon,
  CarIcon,
  ChairIcon,
  ChurchIcon,
  ClipboardIcon,
  ClocheIcon,
  ConfettiIcon,
  FlowerIcon,
  GarlandIcon,
  GiftIcon,
  HeartIcon,
  HomeIcon,
  LeafIcon,
  MicIcon,
  PalmIcon,
  RattleIcon,
  RibbonIcon,
  RingsIcon,
  ScreenIcon,
  SparkIcon,
  StageIcon,
  StarIcon,
  SunIcon,
  TeamIcon,
  ToastIcon,
} from '@/components/layout/icons';
import type { CelebrationItem } from '@/lib/content/services-page';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * One glyph per approved service slug (Requirements section 6). Slugs come from
 * the seeded reference data, so a service added later falls back to the leaf
 * rather than breaking the layout.
 *
 * Each glyph is specific to its service (a mandap arch, a stage, a chair, a
 * cloche) rather than a generic symbol, so the twelve read as twelve different
 * things at a glance.
 */
const SERVICE_ICONS: Record<string, Icon> = {
  'event-wedding-decoration': GarlandIcon,
  'stage-mandap-decoration': ArchIcon,
  'floral-decoration': FlowerIcon,
  'entrance-decoration': StageIcon,
  'makeup-styling': BrushIcon,
  'sounds-lightings': MicIcon,
  'photography-videography': CameraIcon,
  'food-catering': ClocheIcon,
  'furniture-seating': ChairIcon,
  'led-display-solutions': ScreenIcon,
  'return-gifts-essentials': GiftIcon,
  'complete-event-management': ClipboardIcon,
};

export function serviceIcon(slug: string): Icon {
  return SERVICE_ICONS[slug] ?? LeafIcon;
}

const CELEBRATION_ICONS: Record<CelebrationItem['icon'], Icon> = {
  arch: ArchIcon,
  garland: GarlandIcon,
  stage: StageIcon,
  rings: RingsIcon,
  palm: PalmIcon,
  sun: SunIcon,
  balloon: BalloonIcon,
  rattle: RattleIcon,
  gift: GiftIcon,
  spark: SparkIcon,
  star: StarIcon,
  home: HomeIcon,
  toast: ToastIcon,
  confetti: ConfettiIcon,
  building: BuildingIcon,
  team: TeamIcon,
  ribbon: RibbonIcon,
  car: CarIcon,
  church: ChurchIcon,
  leaf: LeafIcon,
  flower: FlowerIcon,
  heart: HeartIcon,
};

export function celebrationIcon(key: CelebrationItem['icon']): Icon {
  return CELEBRATION_ICONS[key] ?? SparkIcon;
}
