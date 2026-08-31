import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/lib/site-config';

describe('site configuration', () => {
  it('uses the approved production domain', () => {
    expect(siteConfig.url).toBe('https://vrkdecor.com');
  });

  it('exposes the approved contact details from the requirements baseline', () => {
    expect(siteConfig.contact.phone).toBe('+919994072435');
    expect(siteConfig.contact.whatsapp).toBe(siteConfig.contact.phone);
    expect(siteConfig.contact.email).toBe('vrk.groups@gmail.com');
    expect(siteConfig.contact.address.city).toBe('Nagercoil');
  });

  it('lists the approved primary coverage areas', () => {
    expect(siteConfig.coverage).toEqual([
      'Nagercoil',
      'Tirunelveli',
      'Trivandrum',
      'Tuticorin',
      'Madurai',
    ]);
  });
});
