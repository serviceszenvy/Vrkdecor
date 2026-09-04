import 'server-only';

import type { EmailDelivery, EmailMessage, EmailTransport } from './types';

/**
 * The transactional email transport.
 *
 * The provider itself is still an open client decision (09_DECISIONS), so this
 * is deliberately provider-agnostic: an HTTPS JSON API described entirely by
 * environment variables. Choosing one later is configuration, not a code change
 * and not a new dependency, and nothing Vercel-specific is introduced.
 *
 *   EMAIL_PROVIDER_API_URL   the provider's send endpoint
 *   EMAIL_PROVIDER_API_KEY   sent as `Authorization: Bearer <key>`
 *   EMAIL_FROM_ADDRESS       the verified sender
 *
 * The request body is the shape used by the mainstream JSON send APIs:
 *
 *   { "from": "...", "to": ["..."], "subject": "...",
 *     "text": "...", "html": "...", "reply_to": "..." }
 *
 * If the chosen provider wants a different envelope, `buildRequestBody` below
 * is the single function to change.
 *
 * Behaviour that matters:
 *   - it never throws; every outcome is a value, because a delivery problem
 *     must not cost a lead that is already stored
 *   - it times out, so a hanging provider cannot hold a customer's request open
 *   - it never logs the message, the recipient or the API key
 */

/** A provider that hangs must not hold the customer's submission open. */
export const EMAIL_SEND_TIMEOUT_MS = 8000;

export type EmailProviderConfig = {
  endpoint: string;
  apiKey: string;
  from: string;
};

/** Reads the provider configuration, or null when email is not set up. */
export function readEmailProviderConfig(
  env: Record<string, string | undefined> = process.env,
): EmailProviderConfig | null {
  const endpoint = env.EMAIL_PROVIDER_API_URL?.trim();
  const apiKey = env.EMAIL_PROVIDER_API_KEY?.trim();
  const from = env.EMAIL_FROM_ADDRESS?.trim();

  if (!endpoint || !apiKey || !from) return null;
  // Credentials must never travel in clear text.
  if (!endpoint.startsWith('https://')) return null;

  return { endpoint, apiKey, from };
}

export function buildRequestBody(config: EmailProviderConfig, message: EmailMessage) {
  return {
    from: config.from,
    to: [message.to],
    subject: message.subject,
    text: message.text,
    html: message.html,
    ...(message.replyTo ? { reply_to: message.replyTo } : {}),
  };
}

export function createHttpEmailTransport(config: EmailProviderConfig): EmailTransport {
  return {
    name: 'https-json',
    async send(message: EmailMessage): Promise<EmailDelivery> {
      try {
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(buildRequestBody(config, message)),
          signal: AbortSignal.timeout(EMAIL_SEND_TIMEOUT_MS),
          cache: 'no-store',
        });

        if (!response.ok) {
          // The status alone. A provider's error body can echo the recipient
          // address and, with some providers, part of the message.
          console.error(
            `[email] The provider refused the confirmation message (${response.status}).`,
          );
          return { status: 'failed', reason: 'rejected' };
        }

        return { status: 'sent' };
      } catch (error) {
        const timedOut =
          error instanceof Error &&
          (error.name === 'TimeoutError' || error.name === 'AbortError');

        console.error(
          timedOut
            ? '[email] The provider did not respond in time.'
            : '[email] The provider could not be reached.',
        );

        return { status: 'failed', reason: timedOut ? 'timeout' : 'unreachable' };
      }
    },
  };
}

/** Used when no provider is configured: nothing is attempted, nothing throws. */
export const noopEmailTransport: EmailTransport = {
  name: 'not-configured',
  async send(): Promise<EmailDelivery> {
    return { status: 'skipped', reason: 'not_configured' };
  },
};

export function resolveEmailTransport(
  env: Record<string, string | undefined> = process.env,
): EmailTransport {
  const config = readEmailProviderConfig(env);
  return config ? createHttpEmailTransport(config) : noopEmailTransport;
}
