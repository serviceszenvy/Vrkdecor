import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    // Playwright specs are run by `npm run test:e2e`, not by Vitest.
    exclude: ['node_modules/**', '.next/**', 'tests/e2e/**'],
    reporters: ['default'],
  },
});
