import { occasions, services } from '@/lib/content';
import {
  enquiryContinuationMessage,
  telHref,
  whatsAppHrefWithMessage,
} from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';
import type { EmailMessage } from './types';

/**
 * The customer confirmation email.
 *
 * Requirements & SOW section 11: the customer receives an automatic
 * confirmation when they supply an email address. It is the ONLY message this
 * application sends, and it goes to exactly one recipient, the customer.
 *
 * What it deliberately does NOT contain:
 *   - any reference to the customer's private reference images, and no signed
 *     URL, storage key or thumbnail of one. Those images are private, and an
 *     inbox is not a place to put a link to them
 *   - a price, a quotation or anything that reads like one. Every quotation is
 *     prepared by the team (Requirements section 16)
 *   - a tracking pixel or a click-tracked link
 *   - a link that changes anything. There is no "cancel", "confirm" or "view"
 *     URL, so there is nothing here that an attacker could use if the mailbox
 *     were ever read by someone else
 *
 * `Reply-To` is the approved business address so a customer's REPLY reaches
 * VRK Decor. That is the customer writing to the business; it is not a
 * notification, and nothing is delivered to VRK Decor unless the customer
 * chooses to write.
 */

export type ConfirmationDetails = {
  enquiryId: string;
  name: string;
  email: string;
  eventType: string;
  eventDate: string;
  venue: string | null;
  city: string;
  requiredServices: string[];
  designName: string | null;
  referenceImageCount: number;
};

const occasionNames = new Map(occasions.map((o) => [o.slug, o.name]));
const serviceNames = new Map(services.map((s) => [s.slug, s.name]));

/**
 * A short human reference for the enquiry.
 *
 * Derived from the identifier rather than being it, so a customer can quote it
 * on the phone without the full identifier travelling through an inbox. There
 * is no public endpoint that accepts either value.
 */
export function enquiryReference(enquiryId: string): string {
  return `VRK-${enquiryId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** A friendly first name, or a neutral greeting when we cannot find one. */
function greetingName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? '';
  return first.length > 0 ? first : 'there';
}

function formatEventDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function summaryRows(details: ConfirmationDetails): [string, string][] {
  const rows: [string, string][] = [];

  if (details.designName) rows.push(['Design you chose', details.designName]);
  rows.push(['Occasion', occasionNames.get(details.eventType) ?? details.eventType]);
  rows.push(['Date', formatEventDate(details.eventDate)]);
  rows.push([
    details.venue ? 'Venue' : 'Location',
    details.venue ? `${details.venue}, ${details.city}` : details.city,
  ]);
  rows.push([
    'Services',
    details.requiredServices.map((slug) => serviceNames.get(slug) ?? slug).join(', ') ||
      'To be confirmed',
  ]);

  if (details.referenceImageCount > 0) {
    rows.push([
      'Your inspiration images',
      `${details.referenceImageCount} received and kept private to your enquiry`,
    ]);
  }

  rows.push(['Your reference', enquiryReference(details.enquiryId)]);

  return rows;
}

export function buildConfirmationMessage(details: ConfirmationDetails): EmailMessage {
  const rows = summaryRows(details);
  const whatsApp = whatsAppHrefWithMessage(
    enquiryContinuationMessage(details.designName),
  );

  const subject = details.designName
    ? `We have your enquiry for ${details.designName}`
    : 'We have your enquiry';

  const text = [
    `Hello ${greetingName(details.name)},`,
    '',
    `Thank you for your enquiry. The VRK Decor team has it and will call or message you on WhatsApp to talk through the details.`,
    '',
    'What you told us:',
    ...rows.map(([label, value]) => `  ${label}: ${value}`),
    '',
    'Every quotation is prepared by our team, so nothing is priced automatically.',
    '',
    'If you would like to reach us sooner:',
    `  WhatsApp: ${whatsApp}`,
    `  Phone: ${siteConfig.contact.phone}`,
    '',
    'You do not need to reply to this message, but you can if you would like to add anything.',
    '',
    siteConfig.name,
    `${siteConfig.contact.address.street}, ${siteConfig.contact.address.city}, ${siteConfig.contact.address.state} ${siteConfig.contact.address.postalCode}`,
    siteConfig.url,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;background:#f6f5f2;font-family:Helvetica,Arial,sans-serif;color:#23241f;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;">
<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#3f4a33;">${escapeHtml(subject)}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hello ${escapeHtml(greetingName(details.name))},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Thank you for your enquiry. The VRK Decor team has it and will call or message you on WhatsApp to talk through the details.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:8px 0;color:#6b6f63;width:42%;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0;vertical-align:top;">${escapeHtml(value)}</td></tr>`,
  )
  .join('\n')}
</table>
<p style="margin:20px 0;font-size:14px;line-height:1.6;color:#6b6f63;">Every quotation is prepared by our team, so nothing is priced automatically.</p>
<p style="margin:0 0 20px;">
<a href="${escapeHtml(whatsApp)}" style="display:inline-block;padding:12px 18px;background:#3f4a33;color:#ffffff;border-radius:8px;text-decoration:none;font-size:15px;">Continue on WhatsApp</a>
<a href="${escapeHtml(telHref)}" style="display:inline-block;padding:12px 18px;margin-left:8px;border:1px solid #3f4a33;color:#3f4a33;border-radius:8px;text-decoration:none;font-size:15px;">Call ${escapeHtml(siteConfig.contact.phone)}</a>
</p>
<p style="margin:0;font-size:13px;line-height:1.6;color:#6b6f63;">${escapeHtml(siteConfig.name)}<br>${escapeHtml(siteConfig.contact.address.street)}, ${escapeHtml(siteConfig.contact.address.city)}, ${escapeHtml(siteConfig.contact.address.state)} ${escapeHtml(siteConfig.contact.address.postalCode)}<br>${escapeHtml(siteConfig.url)}</p>
</div>
</body></html>`;

  return {
    to: details.email,
    subject,
    text,
    html,
    replyTo: siteConfig.contact.email,
  };
}
