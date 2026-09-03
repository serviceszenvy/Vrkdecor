/**
 * Transactional email contract.
 *
 * ONE message is ever sent by this application: the confirmation that goes to
 * the CUSTOMER when they supplied an email address. VRK Decor is never a
 * recipient. The internal inbox is the Admin Panel (Requirements & SOW
 * section 11, Master Implementation Specification section 9, CLAUDE.md).
 */

export type EmailMessage = {
  /** Exactly one recipient: the customer who made the enquiry. */
  to: string;
  subject: string;
  text: string;
  html: string;
  /**
   * Where a customer's reply goes. A reply is something the customer chooses
   * to send; it is not a notification, and nothing is delivered to this address
   * unless they write to it.
   */
  replyTo?: string;
};

export type EmailDelivery =
  /** The provider accepted the message. */
  | { status: 'sent' }
  /** No provider is configured, so nothing was attempted. */
  | { status: 'skipped'; reason: 'not_configured' }
  /** The provider refused, timed out or was unreachable. */
  | { status: 'failed'; reason: 'rejected' | 'unreachable' | 'timeout' };

export type EmailTransport = {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailDelivery>;
};
