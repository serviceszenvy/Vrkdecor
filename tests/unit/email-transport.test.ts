import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  EMAIL_SEND_TIMEOUT_MS,
  buildRequestBody,
  createHttpEmailTransport,
  noopEmailTransport,
  readEmailProviderConfig,
  resolveEmailTransport,
} from '@/lib/email/transport';
import type { EmailMessage } from '@/lib/email/types';

/**
 * The transactional email transport.
 *
 * The provider is still an open client decision, so the transport is
 * configuration rather than code. What has to be true regardless of which
 * provider is chosen:
 *
 *   - it never throws, because the enquiry is already stored by the time it runs
 *   - it never sends credentials over plain HTTP
 *   - it gives up rather than holding a customer's submission open
 *   - it never logs the message, the recipient or the key
 */

const message: EmailMessage = {
  to: 'meena@example.test',
  subject: 'We have your enquiry',
  text: 'plain',
  html: '<p>rich</p>',
  replyTo: 'vrk.groups@gmail.com',
};

const config = {
  endpoint: 'https://provider.test/emails',
  apiKey: 'secret-key',
  from: 'hello@vrkdecor.com',
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('configuration', () => {
  it('is complete only when all three variables are present', () => {
    expect(
      readEmailProviderConfig({
        EMAIL_PROVIDER_API_URL: config.endpoint,
        EMAIL_PROVIDER_API_KEY: config.apiKey,
        EMAIL_FROM_ADDRESS: config.from,
      }),
    ).toEqual(config);

    expect(
      readEmailProviderConfig({
        EMAIL_PROVIDER_API_URL: config.endpoint,
        EMAIL_PROVIDER_API_KEY: config.apiKey,
      }),
    ).toBeNull();

    expect(readEmailProviderConfig({})).toBeNull();
  });

  it('refuses a plain-HTTP endpoint, because the key travels with the request', () => {
    expect(
      readEmailProviderConfig({
        EMAIL_PROVIDER_API_URL: 'http://provider.test/emails',
        EMAIL_PROVIDER_API_KEY: config.apiKey,
        EMAIL_FROM_ADDRESS: config.from,
      }),
    ).toBeNull();
  });

  it('falls back to a transport that sends nothing when unconfigured', async () => {
    const transport = resolveEmailTransport({});
    expect(transport).toBe(noopEmailTransport);
    await expect(transport.send(message)).resolves.toEqual({
      status: 'skipped',
      reason: 'not_configured',
    });
  });
});

describe('the request', () => {
  it('names exactly one recipient, the customer', () => {
    const body = buildRequestBody(config, message);
    expect(body.to).toEqual(['meena@example.test']);
    expect(body.from).toBe(config.from);
    expect(body.reply_to).toBe('vrk.groups@gmail.com');
  });

  it('omits reply_to when there is none', () => {
    const body = buildRequestBody(config, { ...message, replyTo: undefined });
    expect(body).not.toHaveProperty('reply_to');
  });

  it('sends the key as a bearer token over HTTPS, and nothing else', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    await createHttpEmailTransport(config).send(message);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(config.endpoint);
    expect(String(url).startsWith('https://')).toBe(true);
    expect(init.headers.Authorization).toBe('Bearer secret-key');
    expect(init.method).toBe('POST');
    expect(init.signal).toBeDefined();
  });
});

describe('failure', () => {
  it('reports a refusal without throwing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('no', { status: 422 })),
    );

    await expect(createHttpEmailTransport(config).send(message)).resolves.toEqual({
      status: 'failed',
      reason: 'rejected',
    });
  });

  it('reports an unreachable provider without throwing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    await expect(createHttpEmailTransport(config).send(message)).resolves.toEqual({
      status: 'failed',
      reason: 'unreachable',
    });
  });

  it('gives up rather than holding the submission open', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const timeout = new Error('timed out');
    timeout.name = 'TimeoutError';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeout));

    await expect(createHttpEmailTransport(config).send(message)).resolves.toEqual({
      status: 'failed',
      reason: 'timeout',
    });
    expect(EMAIL_SEND_TIMEOUT_MS).toBeLessThanOrEqual(10_000);
  });

  it('never logs the key, the recipient or the message', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error(`secret-key rejected meena@example.test`)),
    );

    await createHttpEmailTransport(config).send(message);

    const logged = JSON.stringify(error.mock.calls);
    expect(logged).not.toContain('secret-key');
    expect(logged).not.toContain('meena@example.test');
    expect(logged).not.toContain('We have your enquiry');
  });
});
