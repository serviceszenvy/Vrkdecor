# Local Development

The local development setup was created in P1.

See **[`docs/LOCAL-DEVELOPMENT.md`](../docs/LOCAL-DEVELOPMENT.md)** for
prerequisites, setup and the full command reference, and
**[`docs/ENVIRONMENT.md`](../docs/ENVIRONMENT.md)** for the environment variable
contract.

Quick start:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Never commit real `.env` values.
Use `.env.example` for documented variable names only.
