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
 * How It Works — required on the Home page by Requirements section 7.
 *
 * The steps are not invented: they are the approved customer journey from the
 * Master Implementation Specification section 5 and the quote flow in
 * Requirements section 11, stated in the customer's language.
 */
export const howItWorks = [
  {
    title: 'Browse our work',
    body: 'Explore designs by occasion, style and service to find the look you want for your celebration.',
  },
  {
    title: 'Request a quote',
    body: 'Send an enquiry from any design or photograph. The design you chose is captured automatically — you never have to describe it twice.',
  },
  {
    title: 'We get in touch',
    body: 'You receive a confirmation, and the VRK Decor team follows up by phone or WhatsApp to discuss your requirement.',
  },
  {
    title: 'We deliver your event',
    body: 'From stage and mandap to florals, furniture and complete event management, coordinated by one team.',
  },
] as const;

/**
 * Why Choose VRK Decor — required by Requirements section 7.
 * Every point restates an approved fact from sections 2, 3 or 6. No new claim
 * is made about quality, price, ranking or guarantees.
 */
export const whyChooseUs = [
  {
    title: '14+ years of event design',
    body: 'More than 600 celebrations delivered across Tamil Nadu.',
  },
  {
    title: 'A team of 35+',
    body: 'An in-house team for design, stage, florals, entrance, furniture and complete event management.',
  },
  {
    title: 'Complete celebration solutions',
    body: 'Specialist services such as makeup, sound and lighting, photography and catering are delivered with trusted partner vendors.',
  },
  {
    title: 'Across Tamil Nadu',
    body: 'Nagercoil, Tirunelveli, Trivandrum, Tuticorin and Madurai, and anywhere in Tamil Nadu based on requirement.',
  },
] as const;

/**
 * Pricing presentation rules — Requirements section 16.
 * Individual designs default to a custom quote, packages may show an approved
 * "starting from" price, customer budget ranges are never displayed, and the
 * website never calculates a final quotation.
 */
export const pricingNote =
  'Every celebration is different, so designs are quoted individually. Share your date, venue and requirement and the team will prepare a quotation for you.';
