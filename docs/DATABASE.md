# Database, authentication and storage

Supabase PostgreSQL, Supabase Auth and Supabase Storage. Migrations are
versioned SQL in `supabase/migrations/` and applied with the Supabase CLI.

## Migrations

| File                                     | Contents                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `20260831120000_initial_schema.sql`      | All ten entities, constraints, indexes, triggers                                           |
| `20260831120100_row_level_security.sql`  | RLS on every table, the `is_active_admin()` predicate, all policies, privilege revocations |
| `20260831120200_storage.sql`             | `portfolio` and `references` buckets and their policies                                    |
| `20260831120300_seed_reference_data.sql` | Approved occasions, services and styles (idempotent)                                       |

Apply them to a Supabase project:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Never edit a migration that has been applied to staging or production. Add a new
one. Never make untracked changes in the Supabase dashboard.

## Schema

`Design` is the parent portfolio entity. `design_images` and `design_videos` are
children sharing `design_id`; related images are never separate Designs and
inherit the parent's occasion, styles, services, location and description. Only
`alt_text` may be overridden per image.

| Table                              | Notes                                                                |
| ---------------------------------- | -------------------------------------------------------------------- |
| `admin_users`                      | Mirrors `auth.users`; carries authorization state only               |
| `occasions`                        | Approved list, with Tamil secondary terms                            |
| `services`                         | Approved list, with `delivery_model` marking partner-vendor services |
| `styles`                           | Approved style vocabulary                                            |
| `designs`                          | Parent entity; unique slug; `status` drives public visibility        |
| `design_styles`, `design_services` | Many-to-many classification for filtering                            |
| `design_images`                    | Child media; unique `storage_key`; at most one cover per design      |
| `design_videos`                    | External URLs only in Phase 1                                        |
| `packages`                         | May carry an approved "starting from" price                          |
| `testimonials`                     | Public only when `approval_status = 'approved'`                      |
| `enquiries`                        | Leads; the approved pipeline in `status`; `consent` must be true     |
| `reference_images`                 | **Private** customer uploads, max 3 per enquiry                      |

Rules the database enforces itself, so no application path can break them:

- At most one cover image per design (partial unique index).
- At most three reference images per enquiry (trigger).
- `consent` must be `true` on every enquiry (check constraint).
- A "starting from" price requires a price; a custom-quote record must not have
  one (check constraint).
- Deleting a design cascades to its media, but is **refused** while an enquiry
  references it — a lead never silently loses the Design it came from. Archive
  such designs instead of deleting them.
- Reference images accept only JPEG, PNG and WebP.

Money is stored in paise (`bigint`), never floating point.

## Row Level Security

Deny by default. RLS is enabled on every table in `public`; a table with no
matching policy is unreadable and unwritable by `anon` and `authenticated`.

| Role                          | Can read                                                                                                       | Can write                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `anon`                        | Published designs and their media, active occasions/services/styles, published packages, approved testimonials | Nothing                                     |
| `authenticated`, not an admin | The same public content only                                                                                   | Nothing                                     |
| `authenticated`, active admin | Everything, including drafts, enquiries and reference images                                                   | Portfolio, content and the enquiry pipeline |
| `service_role`                | Everything (bypasses RLS)                                                                                      | Everything — server-side only               |

Details that matter:

- **Draft media cannot leak.** A `design_images` row is readable only when its
  parent design is published, so knowing an image id or storage key reveals
  nothing (IDOR protection).
- **Authentication is not authorization.** A signed-in user who is not in
  `admin_users` with `status = 'active'` sees exactly what an anonymous visitor
  sees. Disabling an admin revokes access immediately.
- **No client role can grant admin rights.** `admin_users` has no INSERT, UPDATE
  or DELETE policy at all; provisioning is a server/service-role operation.
- **Enquiries are never written from the browser.** There is deliberately no
  anonymous INSERT policy. Enquiries are created server-side with the service
  role after validation and rate limiting (P6/P7/P10), so leads cannot be
  enumerated, forged or altered from a client.
- `is_active_admin()` is `SECURITY DEFINER` with a pinned `search_path`, so a
  policy on `admin_users` can consult `admin_users` without recursion and cannot
  be redirected by a caller-controlled search path.
- RLS is `FORCE`d on `enquiries`, `reference_images` and `admin_users`, so even
  an owner-privileged connection cannot bypass the policies by accident.

## Storage

| Bucket       | Visibility  | Limit | Types                 |
| ------------ | ----------- | ----- | --------------------- |
| `portfolio`  | Public read | 10 MB | JPEG, PNG, WebP, AVIF |
| `references` | **Private** | 5 MB  | JPEG, PNG, WebP       |

- Object keys are generated on the server and never derived from a user-supplied
  filename. The original filename is stored in the database for display only.
- Reference images have no public URL. Admins read them through signed URLs with
  a five-minute lifetime, issued server-side after `requireAdmin()`.
- Buckets reject anything that is not an approved raster image — no SVG
  (scriptable), no PDF, no archives, no executables — independently of
  application-level validation (P7).
- No client role has INSERT on the `references` bucket.

Upload size limits are a developer decision documented in
`09_DECISIONS/DECISIONS.md`, per Master Implementation Specification section 18.

## Authentication and authorization

See [`lib/auth/README.md`](../lib/auth/README.md). Three clients: browser
(`anon`), server (acts as the signed-in user, subject to RLS) and service role
(bypasses RLS, `server-only`).

Authorization is two independent layers, and neither is sufficient alone:

1. `requireAdmin()` in every admin route and mutation.
2. RLS policies on every table.

Authorization decisions use `auth.getUser()`, which revalidates the token with
Supabase Auth. `auth.getSession()` is never trusted for an authorization
decision.

## Running the database tests

The suite applies the real migrations to a throwaway database and then exercises
the policies as `anon`, as a signed-in non-admin, as a disabled admin and as an
active admin.

```bash
# any PostgreSQL 16 instance; never staging or production
export TEST_DATABASE_URL="postgresql://postgres@127.0.0.1:5432/vrk_test"
npm run test:db
```

`tests/db/global-setup.ts` drops and recreates the target database on every run,
applies `tests/db/supabase-shim.sql` (a local stand-in for the `auth` and
`storage` schemas and the Supabase roles, never applied to a real project), then
applies every migration in order. It refuses to run against a database whose
name looks like production.

CI runs this suite against a `postgres:16` service container.

## Environment

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public.
`SUPABASE_SERVICE_ROLE_KEY` is server-only and bypasses RLS.

`npm run verify:bundle` builds with sentinel values in the server-only variables
and scans every browser-downloadable asset for them, failing the build if one
appears. CI runs it on every pull request.

## Still to come

- Enquiry creation, validation and rate limiting — P6, P7, P10
- Upload content and dimension validation, signed-upload flow — P7
- Admin CRUD, ordering, cover selection and the enquiry pipeline UI — P8
- Retention policy and backup/recovery procedures — P10, P12
