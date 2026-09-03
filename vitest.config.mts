import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      /*
        `server-only` throws on import by design, which is exactly what keeps
        the service-role client and the email transport out of a browser
        bundle. Vitest runs in Node, where those modules are legitimately
        importable, so the marker resolves to the package's own empty build —
        the same file the React Server Components condition resolves to.

        This changes nothing about the application: `next build` still applies
        the real marker, and `npm run verify:bundle` independently proves that
        no server-only value reaches a client asset.
      */
      'server-only': fileURLToPath(
        new URL('./node_modules/server-only/empty.js', import.meta.url),
      ),
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
