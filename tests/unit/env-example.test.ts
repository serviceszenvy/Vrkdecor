import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { envSchema } from '@/lib/validation/env';

const envExample = readFileSync(
  fileURLToPath(new URL('../../.env.example', import.meta.url)),
  'utf8',
);

const documentedNames = envExample
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith('#'))
  .map((line) => line.split('=')[0]?.trim())
  .filter((name): name is string => Boolean(name));

describe('.env.example', () => {
  it('documents every variable in the environment contract except NODE_ENV', () => {
    const schemaNames = Object.keys(envSchema.shape).filter(
      (name) => name !== 'NODE_ENV',
    );

    for (const name of schemaNames) {
      expect(documentedNames, `${name} must be documented`).toContain(name);
    }
  });

  it('contains variable names only and never secret values', () => {
    for (const line of envExample.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#')) continue;
      const [, ...rest] = trimmed.split('=');
      expect(rest.join('=').trim(), `${trimmed} must have an empty value`).toBe('');
    }
  });
});
