/**
 * SAMPLE portfolio content — not VRK Decor's real work.
 *
 * The images in `public/samples/` are procedurally generated placeholders, and
 * the text below is illustrative, not approved marketing copy. This dataset
 * exists so the portfolio listing, filters, design detail, gallery and lightbox
 * can be built and reviewed before VRK Decor's own photography and designs are
 * entered through the Admin Panel (P8).
 *
 * SAFETY INVARIANT: this data is only ever used when Supabase is NOT
 * configured. In staging and production Supabase is configured, so real
 * published Designs are shown and nothing here can appear.
 * `tests/unit/sample-portfolio.test.ts` asserts that invariant, and the UI
 * displays a visible notice whenever sample content is active.
 *
 * Delete this module and `public/samples/` before the production build.
 */

export type SampleImage = {
  id: string;
  /** Local path under /public. Real images use a Supabase storage key. */
  storageKey: string;
  altText: string;
  isCover: boolean;
  sortOrder: number;
  width: number;
  height: number;
};

export type SampleVideo = {
  id: string;
  provider: 'youtube' | 'instagram' | 'vimeo';
  url: string;
  caption: string | null;
  sortOrder: number;
};

export type SampleDesign = {
  id: string;
  name: string;
  slug: string;
  occasionSlug: string;
  styleSlugs: string[];
  serviceSlugs: string[];
  location: string;
  description: string;
  featured: boolean;
  images: SampleImage[];
  videos: SampleVideo[];
};

function images(prefix: string, alts: string[]): SampleImage[] {
  return alts.map((altText, index) => ({
    id: `${prefix}-image-${index + 1}`,
    storageKey: `/samples/${prefix}-${index + 1}.webp`,
    altText,
    isCover: index === 0,
    sortOrder: index,
    width: index === 2 ? 1050 : 1400,
    height: index === 2 ? 1400 : 1050,
  }));
}

export const sampleDesigns: readonly SampleDesign[] = [
  {
    id: 'sample-design-1',
    name: 'Golden Mandap Setting',
    slug: 'golden-mandap-setting',
    occasionSlug: 'wedding',
    styleSlugs: ['traditional', 'royal', 'luxury'],
    serviceSlugs: [
      'stage-mandap-decoration',
      'floral-decoration',
      'entrance-decoration',
    ],
    location: 'Nagercoil',
    description:
      'A warm gold and ivory mandap with layered drapery, floral pillars and a lit entrance walkway.',
    featured: true,
    images: images('wedding-royal', [
      'Gold and ivory mandap with draped fabric and floral pillars',
      'Close view of the floral pillar detailing',
      'Entrance walkway lit with warm lighting',
      'Wide view of the mandap and seating',
    ]),
    videos: [],
  },
  {
    id: 'sample-design-2',
    name: 'Garden Reception Stage',
    slug: 'garden-reception-stage',
    occasionSlug: 'reception',
    styleSlugs: ['modern', 'floral', 'contemporary'],
    serviceSlugs: [
      'event-wedding-decoration',
      'floral-decoration',
      'led-display-solutions',
    ],
    location: 'Tirunelveli',
    description:
      'An open-air reception stage in greens and white, with a foliage backdrop and soft uplighting.',
    featured: true,
    images: images('reception-modern', [
      'Reception stage with a green foliage backdrop',
      'Seating arrangement in front of the stage',
      'Detail of the foliage and lighting',
      'Stage viewed from the guest entrance',
    ]),
    videos: [
      {
        id: 'sample-video-1',
        provider: 'youtube',
        url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        caption: 'Sample reel placeholder',
        sortOrder: 0,
      },
    ],
  },
  {
    id: 'sample-design-3',
    name: 'Pastel Engagement Backdrop',
    slug: 'pastel-engagement-backdrop',
    occasionSlug: 'engagement',
    styleSlugs: ['pastel', 'minimal', 'contemporary'],
    serviceSlugs: [
      'event-wedding-decoration',
      'floral-decoration',
      'furniture-seating',
    ],
    location: 'Trivandrum',
    description:
      'A soft pastel backdrop in blush and cream with a low floral arrangement and simple seating.',
    featured: false,
    images: images('engagement-pastel', [
      'Blush and cream engagement backdrop',
      'Low floral arrangement on the table',
      'Seating detail beside the backdrop',
      'Full view of the engagement setting',
    ]),
    videos: [],
  },
  {
    id: 'sample-design-4',
    name: 'Valaikappu Floral Corner',
    slug: 'valaikappu-floral-corner',
    occasionSlug: 'baby-shower',
    styleSlugs: ['floral', 'traditional', 'colourful'],
    serviceSlugs: [
      'floral-decoration',
      'entrance-decoration',
      'return-gifts-essentials',
    ],
    location: 'Nagercoil',
    description:
      'A floral corner for a valaikappu ceremony, with a seating swing and a garland entrance.',
    featured: true,
    images: images('baby-shower-floral', [
      'Floral corner with a decorated seating swing',
      'Garland entrance detail',
      'Close view of the floral arrangement',
      'Wide view of the ceremony corner',
    ]),
    videos: [],
  },
  {
    id: 'sample-design-5',
    name: 'Temple-Style Gruhapravesam',
    slug: 'temple-style-gruhapravesam',
    occasionSlug: 'housewarming',
    styleSlugs: ['heritage-temple', 'traditional', 'royal'],
    serviceSlugs: [
      'entrance-decoration',
      'floral-decoration',
      'complete-event-management',
    ],
    location: 'Madurai',
    description:
      'A heritage-inspired house warming entrance with banana stems, mango leaves and brass lamps.',
    featured: false,
    images: images('housewarming-temple', [
      'Traditional entrance with banana stems and mango leaves',
      'Brass lamps along the walkway',
      'Detail of the entrance garland',
      'Entrance viewed from the street',
    ]),
    videos: [],
  },
  {
    id: 'sample-design-6',
    name: 'Birthday Celebration Setup',
    slug: 'birthday-celebration-setup',
    occasionSlug: 'birthday',
    styleSlugs: ['colourful', 'modern'],
    serviceSlugs: [
      'event-wedding-decoration',
      'furniture-seating',
      'led-display-solutions',
    ],
    location: 'Tuticorin',
    description:
      'A birthday celebration with a balloon arch over the cake table, a name backdrop, a dessert corner and warm coloured lighting for the evening.',
    // Featured so the home page's four signature cards include a birthday
    // celebration alongside the wedding, reception and baby shower.
    featured: true,
    images: images('birthday-colourful', [
      'Balloon arch above the birthday cake table',
      'Dessert corner beside the name backdrop',
      'Warm coloured lighting across the birthday setup',
      'Full view of the birthday celebration setup',
    ]),
    videos: [],
  },
];
