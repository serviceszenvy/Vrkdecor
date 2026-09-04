/**
 * Approved business facts used as page copy.
 *
 * Source of truth: 01_REQUIREMENTS — Website Requirements & SOW, sections 2
 * (Business Profile), 3 (Positioning) and 18 (Location Coverage).
 *
 * Nothing in this file may be added, embellished or rounded without a
 * corresponding requirements change. `tests/unit/content.test.ts` asserts these
 * values against the approved figures.
 */

export const positioning = {
  /** Requirements section 3, verbatim. */
  headline: 'Premium Event Design & Complete Celebration Solutions',
  /**
   * Requirements section 3 also states that VRK Decor is the main event
   * design/coordination brand and that specialist services may be fulfilled
   * through trusted partner vendors, which "must be represented accurately".
   */
  brandRole:
    'VRK Decor is the main event design and coordination brand. Specialist services are delivered with trusted partner vendors.',
} as const;

/** Requirements section 2. Displayed exactly as approved — never rounded up. */
export const credentials = [
  { value: '14+', label: 'Years of experience' },
  { value: '600+', label: 'Events delivered' },
  { value: '35+', label: 'Team members' },
] as const;

/** Requirements sections 2 and 18. */
export const coverage = {
  primaryAreas: ['Nagercoil', 'Tirunelveli', 'Trivandrum', 'Tuticorin', 'Madurai'],
  wider: 'Anywhere in Tamil Nadu based on requirement.',
} as const;

/**
 * The home page hero.
 *
 * Written for someone planning a celebration, not for a search engine. Every
 * claim in it restates an approved fact: the services named are the in-house
 * services in Requirements section 6, and the coverage is section 18.
 */
export const heroCopy = {
  eyebrow: 'Premium event design',
  title: 'Your celebration,',
  titleAccent: 'exactly as you pictured it',
  lead: 'We design and set up weddings, receptions and family celebrations across Tamil Nadu, from the stage and mandap to the florals, the entrance and the seating.',
} as const;

/**
 * The three assurances in the hero panel.
 *
 * Each one restates an approved fact rather than making a new promise: the
 * services are from Requirements section 6, the team size is section 2, and
 * "designed around your occasion" is the quote-per-event rule in section 16.
 */
export const heroAssurances = [
  {
    title: 'Premium decoration',
    body: 'Stage, mandap, florals and entrance styled to a careful finish.',
  },
  {
    title: 'Designed for you',
    body: 'Themes and colours chosen around your occasion and your venue.',
  },
  {
    title: 'A team you can rely on',
    body: 'A team of 35 who set up, run and clear the whole event.',
  },
] as const;

/**
 * How It Works — required on the Home page by Requirements section 7.
 *
 * The steps are not invented: they are the approved customer journey from the
 * Master Implementation Specification section 5 and the quote flow in
 * Requirements section 11, stated in the customer's language.
 */
export const howItWorks = [
  {
    title: 'Find a look you like',
    body: 'Browse our work by occasion, style or service until you find a setting that feels right for your day.',
  },
  {
    title: 'Ask for a quote',
    body: 'Send us the design you like along with your date and venue. The design stays attached to your request, so there is nothing to describe twice.',
  },
  {
    title: 'We call you back',
    body: 'You get a confirmation straight away, and our team follows up on the phone or on WhatsApp to talk through what you need.',
  },
  {
    title: 'We set up your day',
    body: 'Stage and mandap, florals, entrance, furniture and full event management, all looked after by one team.',
  },
] as const;

/**
 * Why Choose VRK Decor — required by Requirements section 7.
 * Every point restates an approved fact from sections 2, 3 or 6. No new claim
 * is made about quality, price, ranking or guarantees.
 */
export const whyChooseUs = [
  {
    title: 'Designed around your day',
    body: 'Every setup is planned for your occasion, your venue and the look you have in mind.',
  },
  {
    title: 'One team, start to finish',
    body: 'Thirty five people covering design, stage and mandap, florals, entrance, furniture and seating.',
  },
  {
    title: 'Fourteen years of practice',
    body: 'More than 600 celebrations set up for families and companies across Tamil Nadu.',
  },
  {
    title: 'Specialists when you need them',
    body: 'Makeup, sound and lighting, photography and catering are arranged with trusted partner vendors.',
  },
] as const;

/**
 * Pricing presentation rules — Requirements section 16.
 * Individual designs default to a custom quote, packages may show an approved
 * "starting from" price, customer budget ranges are never displayed, and the
 * website never calculates a final quotation.
 */
export const pricingNote =
  'No two celebrations are the same, so every design is quoted on its own. Tell us your date, your venue and what you have in mind, and we will prepare a quotation for you.';

/**
 * The closing call to action, used on the Home page and reused as the default
 * on the other public pages.
 */
export const closingCta = {
  eyebrow: 'Let us plan it together',
  title: 'Have a celebration coming up?',
  titleAccent: 'Tell us what you have in mind.',
  lead: 'Share your date, your venue and the look you are after. We will come back to you on the phone or on WhatsApp and put a quotation together.',
} as const;
