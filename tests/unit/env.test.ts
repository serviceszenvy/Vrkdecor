import { describe, expect, it } from 'vitest';
import { parseEnv } from '@/lib/validation/env';

describe('environment contract', () => {
  it('applies safe defaults when optional variables are absent', () => {
    const result = parseEnv({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe('development');
      expect(result.data.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
      expect(result.data.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    }
  });

  it('accepts a fully configured production-shaped environment', () => {
    const result = parseEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: 'https://vrkdecor.com',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-placeholder',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-placeholder',
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-XXXXXXXXXX',
      WHATSAPP_PHONE_NUMBER: '+919994072435',
      EMAIL_PROVIDER_API_KEY: 'email-key-placeholder',
      EMAIL_FROM_ADDRESS: 'no-reply@vrkdecor.com',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a malformed site URL', () => {
    const result = parseEnv({ NEXT_PUBLIC_SITE_URL: 'not-a-url' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.join(' ')).toContain('NEXT_PUBLIC_SITE_URL');
    }
  });

  it('rejects an invalid NODE_ENV', () => {
    const result = parseEnv({ NODE_ENV: 'staging' });

    expect(result.success).toBe(false);
  });

  it('does not echo secret values in error output', () => {
    const secret = 'super-secret-service-role-value';
    const result = parseEnv({
      NEXT_PUBLIC_SITE_URL: 'not-a-url',
      SUPABASE_SERVICE_ROLE_KEY: secret,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.join(' ')).not.toContain(secret);
    }
  });
});
