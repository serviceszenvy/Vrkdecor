import 'server-only';

import {
  buildConfirmationMessage,
  type ConfirmationDetails,
} from './confirmation-message';
import { resolveEmailTransport } from './transport';
import type { EmailDelivery, EmailTransport } from './types';

/**
 * Sends the customer's confirmation, and never lets that failure matter.
 *
 * Called only AFTER the enquiry has been persisted. The contract is:
 *
 *   - the enquiry is already stored and already in the Admin Panel before this
 *     function is entered, so nothing here can cost VRK Decor a lead
 *   - it never throws. Every outcome is a value the caller can act on
 *   - it is a no-op when the customer gave no email address (the field is
 *     optional) and when no provider is configured
 *   - only a `sent` result may set `confirmation_email_sent_at`, so that column
 *     never claims a message that was not accepted
 *
 * There is no retry queue in Phase 1. A failed confirmation is a courtesy the
 * customer did not receive, and the lead is followed up by phone and WhatsApp
 * regardless — which is how VRK Decor works anyway (Requirements section 11).
 */
export async function sendCustomerConfirmation(
  details: ConfirmationDetails,
  transport: EmailTransport = resolveEmailTransport(),
): Promise<EmailDelivery> {
  if (!details.email) return { status: 'skipped', reason: 'not_configured' };

  try {
    return await transport.send(buildConfirmationMessage(details));
  } catch {
    // A transport is supposed to return its failures rather than throw. If one
    // ever does throw, the customer's submission still succeeds.
    console.error('[email] The confirmation message could not be sent.');
    return { status: 'failed', reason: 'unreachable' };
  }
}
