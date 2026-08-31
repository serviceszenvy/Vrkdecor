import { siteConfig } from './site-config';

/**
 * Route map for the approved site structure
 * (Requirements & SOW section 4: Home, Our Work, Services, Occasions, Packages,
 * Gallery, About, Contact; primary CTA "Get a Quote").
 *
 * The shell links to these routes now; the pages themselves are created by
 * later phases — P4 (public pages), P5 (portfolio) and P6 (quote flow).
 */
export const routes = {
  home: '/',
  work: '/our-work',
  services: '/services',
  occasions: '/occasions',
  packages: '/packages',
  gallery: '/gallery',
  about: '/about',
  contact: '/contact',
  quote: '/quote',
  privacy: '/privacy-policy',
  terms: '/terms',
} as const;

export type NavItem = {
  label: string;
  href: string;
};

/** Primary navigation, in the order given by the approved site structure. */
export const primaryNav: readonly NavItem[] = [
  { label: 'Our Work', href: routes.work },
  { label: 'Services', href: routes.services },
  { label: 'Occasions', href: routes.occasions },
  { label: 'Packages', href: routes.packages },
  { label: 'Gallery', href: routes.gallery },
  { label: 'About', href: routes.about },
  { label: 'Contact', href: routes.contact },
];

export const legalNav: readonly NavItem[] = [
  { label: 'Privacy Policy', href: routes.privacy },
  { label: 'Terms & Conditions', href: routes.terms },
];

/** `tel:` href built from the approved business phone number. */
export const telHref = `tel:${siteConfig.contact.phone}`;

/**
 * WhatsApp click-to-chat href.
 *
 * Phase 1 uses plain click-to-chat; WhatsApp Business API automation is
 * explicitly out of scope (Requirements & SOW section 12). The prefilled
 * message and analytics instrumentation are added in P7 and P9.
 */
export const whatsAppHref = `https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`;

export const mailHref = `mailto:${siteConfig.contact.email}`;
