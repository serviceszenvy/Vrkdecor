import { describe, expect, it } from 'vitest';
import {
  legalNav,
  mailHref,
  primaryNav,
  routes,
  telHref,
  whatsAppHref,
} from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';

describe('navigation', () => {
  it('matches the approved site structure in the order specified', () => {
    expect(primaryNav.map((item) => item.label)).toEqual([
      'Our Work',
      'Services',
      'Occasions',
      'Packages',
      'Gallery',
      'About',
      'Contact',
    ]);
  });

  it('uses clean, lowercase, hyphenated internal routes', () => {
    for (const item of [...primaryNav, ...legalNav]) {
      expect(item.href, item.label).toMatch(/^\/[a-z0-9-]*$/);
    }
  });

  it('builds a tel: href from the approved phone number', () => {
    expect(telHref).toBe(`tel:${siteConfig.contact.phone}`);
  });

  it('builds a digits-only WhatsApp click-to-chat href', () => {
    expect(whatsAppHref).toBe('https://wa.me/919994072435');
  });

  it('builds a mailto: href from the approved email address', () => {
    expect(mailHref).toBe(`mailto:${siteConfig.contact.email}`);
  });

  it('exposes the quote route used by every call to action', () => {
    expect(routes.quote).toBe('/quote');
  });
});
