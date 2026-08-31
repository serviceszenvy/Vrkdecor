import { z } from 'zod';

/**
 * Environment contract.
 *
 * Source of truth: 02_TECHNICAL — Technical Development Specification §14.
 * Variable NAMES are documented in `.env.example`. Secret VALUES are never
 * committed and are supplied per environment (local / staging / production).
 *
 * Variables required by later phases are declared optional here so that the P1
 * foundation builds and runs without Supabase or email credentials. Each phase
 * that consumes a variable must assert it at its own boundary.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Public — safe to expose to the browser.
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().min(1).optional(),

  // Server-only — must never be exposed to the browser.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  WHATSAPP_PHONE_NUMBER: z.string().min(1).optional(),
  EMAIL_PROVIDER_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM_ADDRESS: z.email().optional(),
});

export type Env = z.infer<typeof envSchema>;

export type EnvParseResult =
  | { success: true; data: Env }
  | { success: false; errors: string[] };

/** Parses an environment record without throwing. Used by tests and tooling. */
export function parseEnv(source: Record<string, string | undefined>): EnvParseResult {
  const result = envSchema.safeParse(source);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    ),
  };
}

/**
 * Validates `process.env` and throws a redacted error on failure.
 * Never logs or echoes environment values.
 */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = parseEnv(source);

  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${result.errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }

  return result.data;
}
