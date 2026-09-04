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

/**
 * Primary navigation, in the order given by the approved site structure.
 *
 * Occasions is deliberately absent: it is no longer a distinct destination —
 * the Services page now leads with "styled for every occasion" content
 * (`app/(site)/services/page.tsx`), and `/occasions` redirects there
 * (`next.config.ts`) so no existing link ever 404s.
 */
export const primaryNav: readonly NavItem[] = [
  { label: 'Our Work', href: routes.work },
  { label: 'Services', href: routes.services },
  { label: 'Packages', href: routes.packages },
  { label: 'Gallery', href: routes.gallery },
  { label: 'About', href: routes.about },
  { label: 'Contact', href: routes.contact },
];

/**
 * The navigation rendered in the site header and the mobile menu.
 *
 * Identical to `primaryNav` with Home in front of it. Home is part of the
 * approved site structure but is deliberately not in `primaryNav`, which is
 * also used for the footer's "Explore" column, where a link back to the page
 * the logo already goes to would be noise.
 */
export const headerNav: readonly NavItem[] = [
  { label: 'Home', href: routes.home },
  ...primaryNav,
];

export const legalNav: readonly NavItem[] = [
  { label: 'Privacy Policy', href: routes.privacy },
  { label: 'Terms & Conditions', href: routes.terms },
];

/** `tel:` href built from the approved business phone number. */
export const telHref = `tel:${siteConfig.contact.phone}`;

/** Digits only, as wa.me requires. */
export const whatsAppNumber = siteConfig.contact.whatsapp.replace(/[^0-9]/g, '');

/**
 * WhatsApp click-to-chat href.
 *
 * Phase 1 uses plain click-to-chat; WhatsApp Business API automation is
 * explicitly out of scope (Requirements & SOW section 12). Analytics
 * instrumentation is added in P9.
 */
export const whatsAppHref = `https://wa.me/${whatsAppNumber}`;

/** How long a prefilled WhatsApp message may be before it is dropped. */
const WHATSAPP_MESSAGE_MAX = 300;

/**
 * WhatsApp click-to-chat with a message already typed for the customer.
 *
 * This is the "continuation" path: a customer who has just sent an enquiry, or
 * who would rather not fill a form at all, opens WhatsApp with the context
 * already written so VRK Decor knows what they are asking about.
 *
 * The message is built by the server from PUBLIC facts only — the name of a
 * published design. It never carries the customer's own details, an enquiry
 * identifier or anything about their private reference images: the URL is
 * visible in the address bar, in browser history and to WhatsApp itself.
 *
 * Control characters are stripped and the whole value is percent-encoded, so
 * nothing in it can alter the link.
 */
export function whatsAppHrefWithMessage(message: string): string {
  const cleaned = message
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, WHATSAPP_MESSAGE_MAX);

  if (cleaned.length === 0) return whatsAppHref;

  return `${whatsAppHref}?text=${encodeURIComponent(cleaned)}`;
}

/**
 * The message a customer carries into WhatsApp after using the website.
 *
 * `designName` is the name of a published Design, which is public content.
 * Nothing else is included.
 */
export function enquiryContinuationMessage(designName?: string | null): string {
  return designName
    ? `Hello VRK Decor, I have just sent a quote request from your website for "${designName}". I would like to continue on WhatsApp.`
    : 'Hello VRK Decor, I have just sent a quote request from your website. I would like to continue on WhatsApp.';
}

/**
 * The message a customer carries into WhatsApp INSTEAD of using the form.
 */
export function designEnquiryMessage(designName?: string | null): string {
  return designName
    ? `Hello VRK Decor, I am interested in "${designName}" and would like a quotation.`
    : 'Hello VRK Decor, I would like a quotation for an upcoming celebration.';
}

export const mailHref = `mailto:${siteConfig.contact.email}`;

/**
 * Links for reaching a CUSTOMER, used by the Admin Panel (P8).
 *
 * The links above dial VRK Decor; these dial the person who sent an enquiry.
 * Requirements & SOW section 11 says the team follows up by phone and WhatsApp,
 * and section 14 puts that inside the enquiry inbox, so the admin gets both
 * without copying a number between applications.
 *
 * The number is whatever `lib/validation/enquiry.ts` normalised to E.164 when
 * the enquiry was submitted, so it is already dialable. It is reduced to digits
 * again here because `wa.me` accepts nothing else, and because a stored value
 * should never be pasted into a URL unexamined.
 */
export function customerTelHref(phoneE164: string): string {
  const digits = phoneE164.replace(/[^0-9]/g, '');
  return digits.length > 0 ? `tel:+${digits}` : telHref;
}

export function customerWhatsAppHref(phoneE164: string, message?: string): string {
  const digits = phoneE164.replace(/[^0-9]/g, '');
  if (digits.length === 0) return whatsAppHref;

  const base = `https://wa.me/${digits}`;
  if (!message) return base;

  const cleaned = message
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, WHATSAPP_MESSAGE_MAX);

  return cleaned.length === 0 ? base : `${base}?text=${encodeURIComponent(cleaned)}`;
}

/**
 * The opening message an admin sends a customer.
 *
 * Written from VRK Decor to a person who has already given their number and
 * consented to being contacted about this enquiry, so it may use their name and
 * the design they asked about. It deliberately quotes no price: every quotation
 * is prepared by the team (Requirements section 16).
 */
export function adminFollowUpMessage(
  customerName: string,
  designName?: string | null,
): string {
  const first = customerName.trim().split(/\s+/)[0] || 'there';
  return designName
    ? `Hello ${first}, this is VRK Decor about your enquiry for "${designName}". Is now a good time to talk through the details?`
    : `Hello ${first}, this is VRK Decor about the enquiry you sent through our website. Is now a good time to talk through the details?`;
}
