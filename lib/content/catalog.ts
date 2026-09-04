/**
 * Approved occasion and service catalogue.
 *
 * Source of truth: 01_REQUIREMENTS — Website Requirements & SOW, section 5
 * (Occasions) and section 6 (Services), including the partner-vendor markings.
 *
 * These are the same rows seeded into the database by
 * `supabase/migrations/20260831120300_seed_reference_data.sql`. This module is
 * what the public pages render when Supabase is not configured, and the
 * fallback when a query returns nothing, so the site is never blank.
 * `tests/unit/catalog-parity.test.ts` fails if the two ever disagree.
 *
 * Descriptions are intentionally absent: the requirements approve the names and
 * the delivery model, not marketing copy. Per-item descriptions are entered by
 * VRK Decor in the Admin Panel (P8) and will be preferred over these entries
 * once present.
 */

export type CatalogOccasion = {
  name: string;
  /** Tamil term paired with the English name in Requirements section 5. */
  secondaryTerm: string | null;
  slug: string;
};

export type CatalogService = {
  name: string;
  slug: string;
  /**
   * Requirements section 3 requires partner-vendor delivery to be represented
   * accurately, so this is displayed, not hidden.
   */
  deliveryModel: 'in_house' | 'partner_vendor';
};

export const occasions: readonly CatalogOccasion[] = [
  { name: 'Wedding', secondaryTerm: null, slug: 'wedding' },
  { name: 'Reception', secondaryTerm: null, slug: 'reception' },
  { name: 'Engagement', secondaryTerm: 'Nichayathartham', slug: 'engagement' },
  { name: 'Seer Varisai Ceremony', secondaryTerm: null, slug: 'seer-varisai' },
  {
    name: 'Puberty Ceremony',
    secondaryTerm: 'Manjal Neerattu Vizha',
    slug: 'puberty-ceremony',
  },
  { name: 'Ear-Piercing', secondaryTerm: 'Kaadhu Kuthu', slug: 'ear-piercing' },
  { name: 'Holy Communion', secondaryTerm: null, slug: 'holy-communion' },
  { name: 'Baby Shower', secondaryTerm: 'Valaikappu', slug: 'baby-shower' },
  { name: 'Housewarming', secondaryTerm: 'Gruhapravesam', slug: 'housewarming' },
  { name: 'Birthday', secondaryTerm: null, slug: 'birthday' },
  { name: 'Anniversary', secondaryTerm: null, slug: 'anniversary' },
  { name: 'Corporate Events', secondaryTerm: null, slug: 'corporate-events' },
  { name: 'College Events', secondaryTerm: null, slug: 'college-events' },
  { name: 'Other Celebrations', secondaryTerm: null, slug: 'other-celebrations' },
];

export const services: readonly CatalogService[] = [
  {
    name: 'Event & Wedding Decoration',
    slug: 'event-wedding-decoration',
    deliveryModel: 'in_house',
  },
  {
    name: 'Stage & Mandap Decoration',
    slug: 'stage-mandap-decoration',
    deliveryModel: 'in_house',
  },
  { name: 'Floral Decoration', slug: 'floral-decoration', deliveryModel: 'in_house' },
  {
    name: 'Entrance Decoration',
    slug: 'entrance-decoration',
    deliveryModel: 'in_house',
  },
  { name: 'Makeup & Styling', slug: 'makeup-styling', deliveryModel: 'partner_vendor' },
  {
    name: 'Sounds & Lightings',
    slug: 'sounds-lightings',
    deliveryModel: 'partner_vendor',
  },
  {
    name: 'Photography & Videography',
    slug: 'photography-videography',
    deliveryModel: 'partner_vendor',
  },
  { name: 'Food & Catering', slug: 'food-catering', deliveryModel: 'partner_vendor' },
  {
    name: 'Furniture & Seating',
    slug: 'furniture-seating',
    deliveryModel: 'in_house',
  },
  {
    name: 'LED / Display Solutions',
    slug: 'led-display-solutions',
    deliveryModel: 'partner_vendor',
  },
  {
    name: 'Return Gifts & Essentials',
    slug: 'return-gifts-essentials',
    deliveryModel: 'in_house',
  },
  {
    name: 'Complete Event Management',
    slug: 'complete-event-management',
    deliveryModel: 'in_house',
  },
];

/** Requirements section 8 — the approved style vocabulary used by portfolio filters (P5). */
export const styles: readonly { name: string; slug: string }[] = [
  { name: 'Traditional', slug: 'traditional' },
  { name: 'Royal', slug: 'royal' },
  { name: 'Floral', slug: 'floral' },
  { name: 'Modern', slug: 'modern' },
  { name: 'Minimal', slug: 'minimal' },
  { name: 'Luxury', slug: 'luxury' },
  { name: 'Pastel', slug: 'pastel' },
  { name: 'Heritage / Temple', slug: 'heritage-temple' },
  { name: 'Colourful', slug: 'colourful' },
  { name: 'Contemporary', slug: 'contemporary' },
];

export const PARTNER_VENDOR_LABEL = 'With partner vendors';
