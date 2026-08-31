import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Database suite. Separate from the unit suite because it requires a real
 * PostgreSQL instance (TEST_DATABASE_URL). See docs/DATABASE.md.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/db/**/*.test.ts'],
    globalSetup: ['tests/db/global-setup.ts'],
    // Policy tests share one database; run files sequentially.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
