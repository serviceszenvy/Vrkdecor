# lib/db

Database types and query helpers.

- `types.ts` — the `Database` type mirroring `supabase/migrations/`. Kept honest
  by `tests/db/schema-types.test.ts`, which introspects the migrated database
  and fails on drift.
- `queries/public.ts` — read helpers for public content. They run through the
  caller's Supabase client, so Row Level Security applies; the `status` filters
  they add are defence in depth, not the security boundary.

Migrations live in `supabase/migrations/` and are applied with the Supabase CLI.
See [`docs/DATABASE.md`](../../docs/DATABASE.md).

All access is parameterized through the Supabase client — no string-built SQL.
