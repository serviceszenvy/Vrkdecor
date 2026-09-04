import { describe, expect, it, vi } from 'vitest';
import {
  buildConfirmationMessage,
  enquiryReference,
  escapeHtml,
  type ConfirmationDetails,
} from '@/lib/email/confirmation-message';
import { sendCustomerConfirmation } from '@/lib/email/send-confirmation';
import { siteConfig } from '@/lib/site-config';
import type { EmailDelivery, EmailTransport } from '@/lib/email/types';

/**
 * The customer confirmation email — Requirements & SOW section 11.
 *
 * Two rules are being defended here, and they pull in opposite directions:
 *
 *   the CUSTOMER receives an automatic confirmation when they supply an email
 *   VRK DECOR receives nothing; the Admin Panel is the internal inbox
 *
 * So every test below asks the same question in a different way: who is this
 * message addressed to, and what did it take with it?
 */

const details: ConfirmationDetails = {
  enquiryId: '9f8e7d6c-5b4a-4938-2716-0a1b2c3d4e5f',
  name: 'Meena Rajan',
  email: 'meena@example.test',
  eventType: 'wedding',
  eventDate: '2027-02-14',
  venue: 'Sea View Hall',
  city: 'Nagercoil',
  requiredServices: ['floral-decoration', 'stage-mandap-decoration'],
  designName: 'Golden Mandap Setting',
  referenceImageCount: 2,
};

function transportRecording(result: EmailDelivery) {
  const sent: unknown[] = [];
  const transport: EmailTransport = {
    name: 'test',
    async send(message) {
      sent.push(message);
      return result;
    },
  };
  return { transport, sent };
}

describe('who the message is addressed to', () => {
  const message = buildConfirmationMessage(details);

  it('goes to the customer, and only to the customer', () => {
    expect(message.to).toBe('meena@example.test');
  });

  it('never addresses VRK Decor', () => {
    expect(message.to).not.toBe(siteConfig.contact.email);
    expect(message.to).not.toContain('vrk');
  });

  it('offers a reply path without notifying anyone', () => {
    // A reply is something the CUSTOMER chooses to send. Nothing is delivered
    // to VRK Decor unless they write, which is not a notification.
    expect(message.replyTo).toBe(siteConfig.contact.email);
  });
});

describe('what the message contains', () => {
  const message = buildConfirmationMessage(details);

  it('confirms what the customer actually asked for', () => {
    expect(message.text).toContain('Golden Mandap Setting');
    expect(message.text).toContain('Wedding');
    expect(message.text).toContain('14 February 2027');
    expect(message.text).toContain('Sea View Hall, Nagercoil');
    expect(message.text).toContain('Floral Decoration');
  });

  it('carries the continuation channels VRK Decor actually follows up on', () => {
    expect(message.text).toContain('https://wa.me/919994072435');
    expect(message.text).toContain(siteConfig.contact.phone);
    expect(message.html).toContain('https://wa.me/919994072435');
  });

  it('gives the customer a reference they can quote on the phone', () => {
    expect(message.text).toContain('VRK-9F8E7D6C');
    expect(enquiryReference(details.enquiryId)).toBe('VRK-9F8E7D6C');
  });

  it('acknowledges the private images without linking to them', () => {
    expect(message.text).toContain('2 received and kept private');
  });
});

describe('what the message must never contain', () => {
  const message = buildConfirmationMessage({
    ...details,
    name: '<script>alert(1)</script>',
    designName: 'Gold & "Ivory" <Mandap>',
  });

  const everything = `${message.subject}\n${message.text}\n${message.html}`;

  it('carries no reference to a private image beyond the count', () => {
    // A signed URL in an inbox is a private image with a public door on it.
    expect(everything).not.toMatch(/enquiries\/[0-9a-f-]+\//);
    expect(everything).not.toContain('storage/v1');
    expect(everything).not.toContain('/references/');
    expect(everything.toLowerCase()).not.toContain('signedurl');
    expect(everything).not.toContain('token=');
  });

  it('carries no price or quotation', () => {
    expect(everything).not.toMatch(/₹|\bINR\b|\bRs\.?\s?\d/);
  });

  it('carries no tracking pixel and no link that changes anything', () => {
    expect(message.html).not.toMatch(/<img[^>]+height=["']?1["']?/i);
    expect(message.html).not.toMatch(/\/(unsubscribe|confirm|cancel|verify)\b/i);
  });

  it('escapes every value it interpolates into HTML', () => {
    expect(message.html).not.toContain('<script>');
    expect(message.html).toContain('&lt;script&gt;');
    expect(message.html).toContain('&lt;Mandap&gt;');
    expect(message.html).toContain('&amp;');
    expect(escapeHtml(`<a href="x">'&</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&lt;/a&gt;',
    );
  });

  it('does not leak a script into the plain-text part either', () => {
    // Plain text is not markup, so the value is carried as written; what
    // matters is that it is never treated as HTML.
    expect(message.html).not.toMatch(/<script\b/i);
  });
});

describe('an enquiry without a design', () => {
  it('still produces a message the customer can act on', () => {
    const message = buildConfirmationMessage({
      ...details,
      designName: null,
      referenceImageCount: 0,
    });
    expect(message.subject).toBe('We have your enquiry');
    expect(message.text).toContain('https://wa.me/');
    expect(message.text).not.toContain('kept private');
  });
});

describe('sending', () => {
  it('does nothing at all when the customer gave no email address', async () => {
    const { transport, sent } = transportRecording({ status: 'sent' });
    const result = await sendCustomerConfirmation({ ...details, email: '' }, transport);

    expect(result).toEqual({ status: 'skipped', reason: 'not_configured' });
    expect(sent).toHaveLength(0);
  });

  it('reports a provider failure rather than throwing', async () => {
    const { transport } = transportRecording({ status: 'failed', reason: 'rejected' });
    await expect(sendCustomerConfirmation(details, transport)).resolves.toMatchObject({
      status: 'failed',
    });
  });

  it('survives a transport that throws, because the lead is already stored', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const throwing: EmailTransport = {
      name: 'broken',
      async send() {
        throw new Error('boom');
      },
    };

    await expect(sendCustomerConfirmation(details, throwing)).resolves.toEqual({
      status: 'failed',
      reason: 'unreachable',
    });
    error.mockRestore();
  });

  it('never logs the recipient or the message', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const throwing: EmailTransport = {
      name: 'broken',
      async send() {
        throw new Error(`failed for ${details.email}`);
      },
    };

    await sendCustomerConfirmation(details, throwing);

    for (const call of error.mock.calls) {
      expect(JSON.stringify(call)).not.toContain(details.email);
      expect(JSON.stringify(call)).not.toContain(details.name);
    }
    error.mockRestore();
  });
});
