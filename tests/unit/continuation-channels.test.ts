import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  designEnquiryMessage,
  enquiryContinuationMessage,
  telHref,
  whatsAppHref,
  whatsAppHrefWithMessage,
  whatsAppNumber,
} from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';

/**
 * WhatsApp and phone continuation — Requirements & SOW sections 11 and 12.
 *
 * VRK Decor follows up by phone and WhatsApp, and the website has to make that
 * the easy path rather than a dead end. Phase 1 is plain click-to-chat; the
 * WhatsApp Business API is explicitly out of scope.
 *
 * The security question for a prefilled link is what travels in the URL. It is
 * visible in the address bar, kept in browser history and read by WhatsApp, so
 * it may carry public facts and nothing else.
 */

const root = fileURLToPath(new URL('../../', import.meta.url));

/** Zero-width space, then a right-to-left override. */
const ZERO_WIDTH = '​';
const RTL_OVERRIDE = '‮';

describe('the continuation links', () => {
  it('dial and chat the approved business numbers', () => {
    expect(telHref).toBe(`tel:${siteConfig.contact.phone}`);
    expect(whatsAppNumber).toBe('919994072435');
    expect(whatsAppHref).toBe('https://wa.me/919994072435');
  });

  it('are always HTTPS click-to-chat, never an API endpoint', () => {
    expect(whatsAppHrefWithMessage('hello')).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  });

  it('percent-encode the whole message', () => {
    const href = whatsAppHrefWithMessage('a & b ? c # d');
    expect(href).toContain('text=a%20%26%20b%20%3F%20c%20%23%20d');
    // Nothing in the message can add a parameter or a fragment of its own.
    expect(href.split('?')).toHaveLength(2);
    expect(href).not.toContain('#');
  });

  it('cannot be turned into a different link by its own message', () => {
    const href = whatsAppHrefWithMessage('x\n\nhttps://evil.test?to=919999999999');
    expect(href.startsWith('https://wa.me/919994072435?text=')).toBe(true);
    expect(href).not.toContain('://evil.test');
  });

  it('strips control, zero-width and direction-override characters', () => {
    const href = whatsAppHrefWithMessage(
      `sa${ZERO_WIDTH}fe${ZERO_WIDTH}te${RTL_OVERRIDE}xt`,
    );
    expect(decodeURIComponent(href.split('text=')[1]!)).toBe('safetext');
  });

  it('falls back to the plain link when the message is empty', () => {
    expect(whatsAppHrefWithMessage('   ')).toBe(whatsAppHref);
    expect(whatsAppHrefWithMessage(ZERO_WIDTH)).toBe(whatsAppHref);
  });

  it('is bounded in length, so a long design name cannot produce a huge URL', () => {
    const href = whatsAppHrefWithMessage('x'.repeat(5000));
    expect(decodeURIComponent(href.split('text=')[1]!).length).toBeLessThanOrEqual(300);
  });
});

describe('what the prefilled message says', () => {
  it('names the design, which is published public content', () => {
    expect(enquiryContinuationMessage('Golden Mandap Setting')).toContain(
      'Golden Mandap Setting',
    );
    expect(designEnquiryMessage('Golden Mandap Setting')).toContain(
      'Golden Mandap Setting',
    );
  });

  it('works with no design at all', () => {
    expect(enquiryContinuationMessage(null)).toMatch(/quote request/i);
    expect(designEnquiryMessage(null)).toMatch(/quotation/i);
  });

  it('never carries the customer, their contact details or an enquiry id', () => {
    const messages = [
      enquiryContinuationMessage('Golden Mandap Setting'),
      designEnquiryMessage('Golden Mandap Setting'),
      enquiryContinuationMessage(null),
    ];

    for (const message of messages) {
      expect(message).not.toMatch(/@/);
      expect(message).not.toMatch(/\b\d{6,}\b/);
      expect(message).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/);
    }
  });
});

describe('the confirmation page', () => {
  const source = readFileSync(
    join(root, 'app/(site)/quote/submitted/page.tsx'),
    'utf8',
  );

  it('offers both continuation channels', () => {
    expect(source).toContain('continue-whatsapp');
    expect(source).toContain('continue-call');
  });

  it('reads only flags and a published design slug from the URL', () => {
    // A confirmation page that accepted an enquiry id would be a lookup surface.
    const params = [...source.matchAll(/params\.(\w+)/g)].map((match) => match[1]);
    expect(new Set(params)).toEqual(new Set(['repeat', 'email', 'images', 'design']));
  });

  it('resolves that slug through the published-only reader', () => {
    expect(source).toContain('resolveQuoteContext');
  });

  it('promises an email only when one was actually accepted', () => {
    expect(source).toContain("first(params.email) === 'sent'");
    expect(source).toMatch(/emailSent \?/);
  });
});
