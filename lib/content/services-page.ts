/**
 * Services page content.
 *
 * The Services page is now the single home for both services and occasions
 * (refinement brief of 2026-09-05, sections 5 and 6; the separate Occasions
 * page was removed). Two things are described here:
 *
 *   1. `serviceGroups` — the twelve APPROVED services (Requirements section 6)
 *      arranged into three groups so the page reads as a structure rather than
 *      a list. Only approved slugs appear; the names still come from the
 *      catalogue or the database, never from here.
 *
 *   2. `celebrationGroups` — the celebrations VRK Decor decorates, grouped the
 *      way a customer thinks about them. Every entry points into the portfolio
 *      through one of the fourteen APPROVED occasions (Requirements section 5),
 *      so the links can never reach a filter that does not exist. Where the
 *      brief asked for a more specific celebration than the approved list
 *      names (haldi, destination weddings, church decor, openings, car decor),
 *      it is presented as a kind of celebration and linked to the closest
 *      approved occasion. These are presentation labels, not new catalogue
 *      rows: the database, the quote form's event types and the admin panel are
 *      unchanged. See 09_DECISIONS/DECISIONS.md.
 *
 * Every sentence below is original copy written for VRK Decor. Nothing states
 * a figure, a rank or a guarantee.
 */

export type ServiceGroup = {
  id: string;
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
  serviceSlugs: readonly string[];
};

export const serviceGroups: readonly ServiceGroup[] = [
  {
    id: 'design-decoration',
    eyebrow: 'Our own team',
    title: 'Design and',
    accent: 'decoration',
    lead: 'The setting itself: the stage and mandap, the florals, the entrance and the overall look of the venue, planned and built by our own team.',
    serviceSlugs: [
      'event-wedding-decoration',
      'stage-mandap-decoration',
      'floral-decoration',
      'entrance-decoration',
    ],
  },
  {
    id: 'setup-experience',
    eyebrow: 'Our own team',
    title: 'Setup and',
    accent: 'guest experience',
    lead: 'Everything that makes the day run: seating and furniture, return gifts, and the coordination that ties it all together.',
    serviceSlugs: [
      'furniture-seating',
      'return-gifts-essentials',
      'complete-event-management',
    ],
  },
  {
    id: 'specialist-partners',
    eyebrow: 'With trusted partner vendors',
    title: 'Specialists,',
    accent: 'arranged for you',
    lead: 'Makeup, sound and lighting, photography, catering and LED displays are delivered with trusted partner vendors. We arrange and coordinate them, so you still have one point of contact.',
    serviceSlugs: [
      'makeup-styling',
      'sounds-lightings',
      'photography-videography',
      'food-catering',
      'led-display-solutions',
    ],
  },
];

/**
 * One line per approved service, shown only when the Admin Panel has not
 * supplied a description of its own (the database description is preferred).
 */
export const serviceBlurbs: Record<string, string> = {
  'event-wedding-decoration':
    'The complete look of your celebration, from the theme and colours to the finishing touches on the day.',
  'stage-mandap-decoration':
    'Stages and mandaps built for the ceremony, with drapery, florals, lighting and a backdrop that photographs well.',
  'floral-decoration':
    'Fresh and artificial florals for pillars, arches, tables, garlands and the little corners guests notice.',
  'entrance-decoration':
    'Arches, walkways, name boards and welcome arrangements that set the mood before anyone steps inside.',
  'makeup-styling':
    'Bridal and family makeup and styling, arranged with partner artists we have worked with before.',
  'sounds-lightings':
    'Sound systems, stage lighting and ambient lighting arranged with partner vendors and coordinated by us.',
  'photography-videography':
    'Photography and video coverage arranged with partner studios, briefed on the setting we have built.',
  'food-catering':
    'Catering arranged with partner caterers, coordinated with the layout, timings and seating plan.',
  'furniture-seating':
    'Chairs, tables, lounge seating and covers, laid out to suit the venue and the number of guests.',
  'led-display-solutions':
    'LED walls, screens and displays for names, photographs, live video and stage visuals.',
  'return-gifts-essentials':
    'Return gifts, welcome kits and the small essentials that are easy to forget until the day.',
  'complete-event-management':
    'One team planning, setting up, running and clearing the whole event so you can be a guest at your own celebration.',
};

export type CelebrationItem = {
  name: string;
  /** Tamil term where the approved requirements pair one with the name. */
  secondaryTerm?: string;
  blurb: string;
  /** One of the fourteen approved occasion slugs; decides the portfolio link. */
  occasionSlug: string;
  icon:
    | 'arch'
    | 'garland'
    | 'stage'
    | 'rings'
    | 'palm'
    | 'sun'
    | 'balloon'
    | 'rattle'
    | 'gift'
    | 'spark'
    | 'star'
    | 'home'
    | 'toast'
    | 'confetti'
    | 'building'
    | 'team'
    | 'ribbon'
    | 'car'
    | 'church'
    | 'leaf'
    | 'flower'
    | 'heart';
};

export type CelebrationGroup = {
  id: string;
  title: string;
  accent: string;
  lead: string;
  items: readonly CelebrationItem[];
};

export const celebrationGroups: readonly CelebrationGroup[] = [
  {
    id: 'weddings',
    title: 'Weddings and',
    accent: 'receptions',
    lead: 'From the mandap to the reception stage, styled for the ceremony you are holding and the venue you have chosen.',
    items: [
      {
        name: 'Wedding Decor',
        blurb:
          'Mandap, florals, entrance and seating designed as one complete setting for the day.',
        occasionSlug: 'wedding',
        icon: 'arch',
      },
      {
        name: 'Reception Decor',
        blurb:
          'A reception stage and hall styled for the evening, with lighting that photographs well.',
        occasionSlug: 'reception',
        icon: 'stage',
      },
      {
        name: 'Engagement and Betrothal',
        secondaryTerm: 'Nichayathartham',
        blurb:
          'A backdrop, seating and florals for the exchange, sized for a home, a hall or a lawn.',
        occasionSlug: 'engagement',
        icon: 'rings',
      },
      {
        name: 'Traditional Weddings',
        blurb:
          'Temple style and heritage settings with garlands, brass, banana leaf and marigold.',
        occasionSlug: 'wedding',
        icon: 'garland',
      },
      {
        name: 'Destination and Beach Weddings',
        blurb:
          'Outdoor and coastal weddings across Tamil Nadu, planned around the light and the weather.',
        occasionSlug: 'wedding',
        icon: 'palm',
      },
      {
        name: 'Haldi and Pre-wedding',
        blurb:
          'Bright, relaxed settings in yellow and marigold for the haldi, mehendi and sangeet.',
        occasionSlug: 'wedding',
        icon: 'sun',
      },
    ],
  },
  {
    id: 'family',
    title: 'Family and',
    accent: 'personal celebrations',
    lead: 'The milestones a family gathers for, each decorated for what the day means rather than from a template.',
    items: [
      {
        name: 'Birthday Decor',
        blurb:
          'Balloon arches, name backdrops, cake tables and themed corners for children and adults alike.',
        occasionSlug: 'birthday',
        icon: 'balloon',
      },
      {
        name: 'Baby Shower',
        secondaryTerm: 'Valaikappu',
        blurb:
          'Soft florals, a bangle ceremony corner and a comfortable seat of honour for the mother to be.',
        occasionSlug: 'baby-shower',
        icon: 'rattle',
      },
      {
        name: 'Seer Varisai Ceremony',
        blurb:
          'Displays and trays for the seer, arranged so every gift is seen and the ceremony flows.',
        occasionSlug: 'seer-varisai',
        icon: 'gift',
      },
      {
        name: 'Puberty Ceremony',
        secondaryTerm: 'Manjal Neerattu Vizha',
        blurb:
          'A traditional stage with florals and turmeric tones, styled with the respect the occasion deserves.',
        occasionSlug: 'puberty-ceremony',
        icon: 'spark',
      },
      {
        name: 'Ear-Piercing Ceremony',
        secondaryTerm: 'Kaadhu Kuthu',
        blurb:
          'A small, warm setting with a decorated seat and backdrop for the family and the photographs.',
        occasionSlug: 'ear-piercing',
        icon: 'star',
      },
      {
        name: 'Housewarming',
        secondaryTerm: 'Gruhapravesam',
        blurb:
          'Entrance arches, mango leaf and floral touches that welcome guests into a new home.',
        occasionSlug: 'housewarming',
        icon: 'home',
      },
      {
        name: 'Anniversaries and Surprises',
        blurb:
          'Intimate setups for anniversaries, proposals and surprise celebrations at home or a venue.',
        occasionSlug: 'anniversary',
        icon: 'toast',
      },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate and',
    accent: 'special events',
    lead: 'Openings, company celebrations and campus events that need a polished setting and a team that keeps to the schedule.',
    items: [
      {
        name: 'Corporate Events',
        blurb:
          'Stage, branding, seating and screens for launches, annual days and company celebrations.',
        occasionSlug: 'corporate-events',
        icon: 'building',
      },
      {
        name: 'Opening Ceremonies and Showroom Openings',
        blurb:
          'Ribbon cutting setups, entrance arches, florals and signage for the first day of a new business.',
        occasionSlug: 'corporate-events',
        icon: 'ribbon',
      },
      {
        name: 'College Events',
        blurb:
          'Culturals, graduation days and campus festivals with stages and backdrops built to scale.',
        occasionSlug: 'college-events',
        icon: 'team',
      },
      {
        name: 'Parties and Get-togethers',
        blurb:
          'Themed decoration, lighting and seating for parties, reunions and family get-togethers.',
        occasionSlug: 'other-celebrations',
        icon: 'confetti',
      },
      {
        name: 'Car Decor',
        blurb:
          'The wedding car and the welcome vehicle dressed with florals and ribbons to match the setting.',
        occasionSlug: 'wedding',
        icon: 'car',
      },
    ],
  },
  {
    id: 'cultural',
    title: 'Cultural and',
    accent: 'religious celebrations',
    lead: 'Ceremonies with their own traditions, decorated with care for what each one calls for.',
    items: [
      {
        name: 'Church Decor',
        blurb:
          'Altar florals, aisle arrangements and entrance decoration for church weddings and services.',
        occasionSlug: 'wedding',
        icon: 'church',
      },
      {
        name: 'Holy Communion and Baptism',
        blurb:
          'Gentle white and pastel settings for the church and the celebration that follows at home.',
        occasionSlug: 'holy-communion',
        icon: 'heart',
      },
      {
        name: 'Kerala Weddings',
        blurb:
          'Kerala style settings with white and gold, jasmine, coconut leaf and brass lamps.',
        occasionSlug: 'wedding',
        icon: 'leaf',
      },
      {
        name: 'Temple-Style Ceremonies',
        blurb:
          'Heritage settings with pillars, brass, garlands and traditional lamps for temple and home rituals.',
        occasionSlug: 'other-celebrations',
        icon: 'flower',
      },
    ],
  },
];
