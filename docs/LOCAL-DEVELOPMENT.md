# Local development

## Prerequisites

- Node.js >= 20.9 (the repository pins the major version in `.nvmrc`; run
  `nvm use` if you use nvm)
- npm 10 or newer
- Git

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with values for your own local environment. Never commit
`.env.local` or any real secret. `.env.example` documents variable names only.

The P1 foundation runs with no Supabase or email credentials configured; every
variable belonging to a later phase is optional until that phase asserts it.

## Commands

| Command                                   | Purpose                                               |
| ----------------------------------------- | ----------------------------------------------------- |
| `npm run dev`                             | Start the development server on http://localhost:3000 |
| `npm run build`                           | Production build                                      |
| `npm start`                               | Serve the production build                            |
| `npm run lint`                            | ESLint                                                |
| `npm run typecheck`                       | TypeScript, no emit                                   |
| `npm run format` / `npm run format:check` | Prettier                                              |
| `npm test`                                | Vitest unit and integration tests                     |
| `npm run test:e2e`                        | Playwright end-to-end tests                           |
| `npm run verify`                          | Format check, lint, typecheck, unit tests and build   |

`npm run verify` is the gate to run before every commit; it mirrors the CI
workflow in `.github/workflows/ci.yml`.

## End-to-end tests

Playwright builds are not started automatically by `npm run test:e2e` in a clean
checkout — the browsers must be installed once:

```bash
npx playwright install --with-deps chromium
npm run build
npm run test:e2e
```

The Playwright configuration starts `next start` on port 3100 unless
`PLAYWRIGHT_BASE_URL` is set. Never point end-to-end tests at production data.

## Health check

`GET /api/health` returns `{"status":"ok"}` and is used for staging and
production smoke tests. It intentionally exposes no environment detail.
