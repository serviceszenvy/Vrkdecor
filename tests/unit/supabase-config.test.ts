import { afterEach, describe, expect, it, vi } from 'vitest';
import { requirePublicSupabaseConfig, requireServiceRoleKey } from '@/lib/auth/config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Supabase configuration', () => {
  it('reads public configuration at call time, not at import time', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    expect(requirePublicSupabaseConfig()).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    });
  });

  it('fails with the variable name when configuration is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    expect(() => requirePublicSupabaseConfig()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('never includes a secret value in the error it throws', () => {
    const secret = 'super-secret-service-role-value';
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', secret);

    try {
      requireServiceRoleKey();
      throw new Error('expected requireServiceRoleKey to throw');
    } catch (error) {
      expect((error as Error).message).toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect((error as Error).message).not.toContain(secret);
    }
  });
});
