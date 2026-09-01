# Security baseline

Security is non-negotiable and is never weakened to make a feature work
(`CLAUDE.md`). This document records what is in place now and which phase owns
each remaining control.

## In place after P1

- **Secret isolation.** `.env*` is git-ignored except `.env.example`, which
  documents names only and is enforced by a unit test. No secret value exists in
  the repository or in the lockfile.
- **Server-only variable discipline.** The environment contract in
  `lib/validation/env.ts` separates `NEXT_PUBLIC_` variables from server-only
  variables. The service-role key is server-only by construction.
- **Safe error output.** Environment validation reports variable names and
  failure reasons, never values. A unit test asserts this.
- **Baseline security headers.** `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-DNS-Prefetch-Control: off`, and `X-Powered-By` removed. Asserted by an
  end-to-end test.
- **Strict TypeScript.** `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters` and `noFallthroughCasesInSwitch` are enabled.
- **Dependency hygiene.** `npm audit --audit-level=high` runs in CI. The
  installed dependency tree currently reports zero vulnerabilities.
- **CI gate.** Format, lint, typecheck, unit tests, production build and audit
  run on every pull request to `main`.
- **No secrets in the health endpoint.** `/api/health` returns a fixed payload.

## Added in P3

- **Row Level Security on every table**, deny by default, with policies proven
  by automated tests against a real PostgreSQL instance (79 as of P6). See
  [DATABASE.md](./DATABASE.md).
- **Anonymous users are refused enquiries, reference images and admin data** at
  the privilege level as well as the policy level.
- **Draft content cannot leak.** Unpublished designs and their media are
  invisible to anonymous and non-admin users even when the exact id is known
  (IDOR protection).
- **Authentication is separated from authorization.** A valid session grants
  nothing; `admin_users` with `status = 'active'` does. Disabling an admin
  revokes access immediately. No client role can grant admin rights.
- **Private reference images.** A private bucket with no anonymous policy, no
  public URL, server-generated unguessable keys and five-minute signed URLs
  issued only after `requireAdmin()`.
- **Upload hardening at the storage layer**: per-bucket size caps and an
  allow-list of raster image types only — no SVG, PDF, archives or executables.
- **Enquiries are never written from the browser**; they are created server-side
  after validation, so leads cannot be forged, enumerated or altered.
- **Parameterized access only.** All queries go through the Supabase client;
  no string-built SQL anywhere.
- **`SECURITY DEFINER` with a pinned `search_path`** on the one privileged
  helper function.
- **Secrets cannot reach the browser.** Server modules import `server-only`, and
  `npm run verify:bundle` builds with sentinel values and fails if any appears
  in a browser-downloadable asset. CI runs it on every pull request.
- **Secure session cookies**: `httpOnly`, `sameSite=lax`, `secure` in
  production.
- **Least privilege**: client roles cannot create objects in the `public`
  schema; write privileges are granted only where a policy could allow a write.

## Added in P6

The quote form is the first place the public can write to the application, so
the controls below are part of the feature, not deferred.

- **Server-side validation on every field.** `lib/validation/enquiry.ts` is the
  authority; nothing is persisted from unparsed input. The parser reads only the
  fields it declares, so `status`, `internal_notes`, `confirmation_email_sent_at`
  and `selected_design_id` cannot be smuggled in as extra form fields.
- **Closed vocabularies** for event type and required services: the value that
  reaches the database is always one of a fixed set of approved slugs.
- **The parent Design is server-resolved, not submitted.** The hidden field is a
  lookup key. `resolveQuoteContext` re-resolves it on submit against published
  designs only, and accepts a photograph only if it belongs to that Design — so
  a crafted link cannot attach a draft design or cross the parent relationship.
  A database trigger enforces the same rule independently.
- **A draft design and an invented slug are answered identically**, so the form
  cannot be used to discover whether unpublished work exists.
- **CSRF / request integrity.** Submission is a Next.js Server Action; the
  framework verifies the request Origin against the host before the action runs,
  and no public JSON endpoint exists to script against.
- **Rate limiting** per client, per phone number and per identical request
  (`lib/rate-limit.ts`). In-process for now — P10 moves it to a shared store.
  Client keys are stored as a hash, never as an address.
- **Duplicate submission is absorbed**, so one lead cannot be multiplied into
  many by a refresh or an impatient second click.
- **Input hygiene.** Control, zero-width and bidirectional formatting characters
  are stripped, and single-line fields cannot carry newlines into an admin list
  or a CSV export. React escapes on render; markup is stored as text, not
  rejected, so a customer writing `<` is never turned away.
- **Safe errors and minimal logging.** A storage failure logs a fixed message
  and never the error object or the customer's submitted values, and the visitor
  is offered phone and WhatsApp rather than a stack trace.
- **The confirmation page carries no identifier** and is `noindex`.
- **No internal notification email exists**, asserted by a test that scans the
  quote sources for mail transports and notification addresses.

## Owned by later phases

| Control                                                                                                            | Phase        |
| ------------------------------------------------------------------------------------------------------------------ | ------------ |
| Supabase Auth, session handling, secure cookies                                                                    | P3           |
| Row Level Security policies and tests                                                                              | P3           |
| Storage policies; private reference-image bucket                                                                   | P3, P7       |
| Server-side authorization and IDOR protection                                                                      | P3, P6, P8   |
| Server-side payload validation on every mutation                                                                   | P6 ✓, P7, P8 |
| Upload hardening: MIME/content/size/dimension validation, unique server-generated keys, no executables or archives | P7           |
| Maximum 3 private reference images per enquiry                                                                     | P7           |
| Rate limiting — shared store, remaining surfaces (quote form done in P6)                                           | P10          |
| Content Security Policy, HSTS, permissions policy                                                                  | P10          |
| CSRF / request-integrity review (quote form covered by Server Actions in P6)                                       | P10          |
| Sensitive logging minimisation and safe production errors                                                          | P10          |
| Privacy, retention and backup/recovery procedures                                                                  | P10, P12     |

## Standing rules

- Never commit `.env` values, API keys, service-role keys, Hostinger or email
  credentials, or private customer data.
- Never expose the service-role key to the browser.
- Never make reference images publicly readable.
- Only published Designs are publicly visible.
