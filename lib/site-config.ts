/**
 * Approved business facts for VRK Decor.
 *
 * Source of truth: 01_REQUIREMENTS — "VRK Decor Website Requirements & SOW"
 * (sections 2, 18 and 22). Do not add or alter business facts here without a
 * corresponding requirements change.
 */
export const siteConfig = {
  name: 'VRK Decor',
  url: 'https://vrkdecor.com',
  description:
    'Premium event design and complete celebration solutions across Tamil Nadu.',
  contact: {
    phone: '+919994072435',
    whatsapp: '+919994072435',
    email: 'vrk.groups@gmail.com',
    address: {
      street: '301 M.S Road, Vettunimadam',
      city: 'Nagercoil',
      state: 'Tamil Nadu',
      postalCode: '629003',
      country: 'IN',
    },
  },
  coverage: ['Nagercoil', 'Tirunelveli', 'Trivandrum', 'Tuticorin', 'Madurai'],
  locale: 'en',
} as const;

export type SiteConfig = typeof siteConfig;
