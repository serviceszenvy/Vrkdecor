# Environment contract

Variable names come from the Technical Development Specification section 14.
`.env.example` is the committed record of those names and contains no values.

| Variable                        | Exposure    | Owning phase | Purpose                                              |
| ------------------------------- | ----------- | ------------ | ---------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | Browser     | P1           | Canonical base URL for the environment               |
| `NEXT_PUBLIC_SUPABASE_URL`      | Browser     | P3           | Supabase project URL                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser     | P3           | Supabase anon key; safe only because RLS is enforced |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Browser     | P9           | Google Analytics measurement ID                      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only | P3           | Bypasses RLS; must never reach the browser           |
| `WHATSAPP_PHONE_NUMBER`         | Server only | P7           | Click-to-chat number                                 |
| `EMAIL_PROVIDER_API_KEY`        | Server only | P7           | Transactional email provider credential              |
| `EMAIL_FROM_ADDRESS`            | Server only | P7           | Verified sender address                              |

## Rules

- Only variables prefixed `NEXT_PUBLIC_` may be read in browser code. Anything
  else is server-only.
- The service-role key is never imported into a client component, never logged,
  and never included in an error response.
- Local, staging and production use separate configuration and preferably
  separate Supabase projects.
- Production customer data is never used in automated tests.
- Validation lives in `lib/validation/env.ts`. Variables owned by later phases
  are optional there so the foundation builds without credentials; each phase
  asserts the variables it consumes at its own boundary.
- `tests/unit/env-example.test.ts` fails the build if a contract variable is
  missing from `.env.example` or if `.env.example` ever gains a value.
- Supabase configuration is read at call time, never at module load, so the
  application builds and the public shell runs without credentials
  (`lib/auth/config.ts`). Accessors fail with the variable name and never echo a
  value.
- `npm run verify:bundle` builds with sentinel values in the server-only
  variables and fails if any of them appears in a browser-downloadable asset.
- The database test suite additionally uses `TEST_DATABASE_URL`, which must
  never point at staging or production.
