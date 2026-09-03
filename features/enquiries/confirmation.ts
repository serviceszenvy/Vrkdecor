import 'server-only';

import { sendCustomerConfirmation } from '@/lib/email/send-confirmation';
import type { EnquiryInput } from '@/lib/validation/enquiry';
import { markConfirmationEmailSent } from './data';

/**
 * The customer's confirmation, attempted after the enquiry is safely stored.
 *
 * Requirements & SOW section 11: the customer receives an automatic
 * confirmation when they supply an email address. VRK Decor receives nothing;
 * the Admin Panel is the internal inbox, which is why this module has exactly
 * one recipient and it is the person who filled in the form.
 *
 * The ordering is the whole point:
 *
 *   createEnquiry → 'created'      the lead exists and is in the inbox
 *   sendConfirmation                a courtesy that may fail
 *   markConfirmationEmailSent       only when the provider accepted it
 *
 * Nothing below can return a failure that undoes the step above it. The worst
 * outcome is a customer who was not written to, and VRK Decor follows up by
 * phone and WhatsApp regardless.
 *
 * The send is awaited rather than left running. It is bounded by the
 * transport's own timeout, and awaiting it is what lets the confirmation page
 * tell the customer the truth about whether an email is coming.
 */
export type ConfirmationOutcome = 'sent' | 'not_sent' | 'no_email';

export async function sendEnquiryConfirmation(
  enquiryId: string,
  enquiry: EnquiryInput,
  context: { designName: string | null; referenceImageCount: number },
): Promise<ConfirmationOutcome> {
  if (!enquiry.email) return 'no_email';

  const delivery = await sendCustomerConfirmation({
    enquiryId,
    name: enquiry.name,
    email: enquiry.email,
    eventType: enquiry.eventType,
    eventDate: enquiry.eventDate,
    venue: enquiry.venue,
    city: enquiry.city,
    requiredServices: enquiry.requiredServices,
    designName: context.designName,
    referenceImageCount: context.referenceImageCount,
  });

  if (delivery.status !== 'sent') return 'not_sent';

  // Best effort. A lost timestamp is a reporting gap, never a lost lead.
  await markConfirmationEmailSent(enquiryId);

  return 'sent';
}
