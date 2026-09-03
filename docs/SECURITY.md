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

## Added in P7

Customers can now attach files and receive email, which adds two new classes of
risk: hostile content arriving, and private content leaving.

### Secure uploads

- **Files are validated by their bytes, not their labels.**
  `lib/uploads/image-signature.ts` reads the magic bytes and header of every
  attachment and reports what it actually is. A `.jpg` that is really HTML, PHP,
  SVG, a ZIP or a GIF is refused, and so is a genuine PNG announced as a JPEG.
- **Headers only, never a decode.** The probe parses the first bytes of the
  file. Decoding attacker-supplied images is itself an attack surface, and no
  image library is pulled into the deployment for three header reads.
- **Dimension limits.** 200 px minimum per edge, 12000 px maximum per edge and
  40 megapixels overall, so a decompression bomb — a few hundred bytes on disk
  declaring a canvas of hundreds of megapixels — cannot be stored and later
  opened by an admin's browser.
- **Size limits at three layers**: 5 MB per file and 15 MB per request in the
  validator, 16 MB at the Server Action body limit, and 5 MB again on the bucket
  itself in Supabase Storage.
- **Count limit at four layers**: the file input, the validator, the linking
  code and a database trigger. Never more than three per enquiry.
- **`accept` and `multiple` are conveniences, never controls.** Both are
  trivially bypassed and neither is trusted anywhere.
- **The whole submission is refused when any file fails**, rather than accepting
  some, so a customer is never left believing three images arrived when two did.
- **Server-generated keys.** The object key is `enquiries/<enquiry id>/<random
UUID>.<extension>`, built from the type proven by the bytes. The customer's
  filename is sanitised and kept for display only. No path traversal, no
  collision, no overwrite (`upsert: false`), nothing guessable.
- **A rejected file never consumes the duplicate window**, so a customer who
  fixes an attachment and resends is not told we already have a request that was
  never created.

### Private reference-image protection

- The bucket is private and grants `anon` nothing, so an exact key is not enough
  to read an object.
- `resolveImageUrl` refuses a reference key outright rather than building a
  public URL from it, even though that URL would already fail.
- `lib/storage/reference-upload.ts` and `lib/storage/urls.ts` import
  `server-only` and are not exported from the shared storage index, so they
  cannot reach a browser bundle.
- The enquiry summary the Admin Panel reads carries a COUNT of reference images,
  never a key or a URL.
- An admin reads an image through a five-minute signed URL issued server-side
  after `requireAdmin()`, and by no other route.
- An end-to-end test loads the public pages after an upload and asserts that no
  bucket name, object key or customer filename appears anywhere in the HTML.
- Reference rows are deleted with their enquiry, so a deleted lead does not
  leave private images behind with nothing pointing at them.

### Customer confirmation email

- **The enquiry is persisted first.** The confirmation is attempted only after
  `createEnquiry` has returned `created`, so a provider outage cannot cost a
  lead. `confirmation_email_sent_at` is written only when the provider accepted
  the message.
- **Nothing throws.** Every failure is a value: rejected, unreachable or timed
  out. A send that fails leaves the customer unwritten-to and the lead
  untouched, and VRK Decor follows up by phone and WhatsApp exactly as before.
- **Bounded.** An eight-second timeout means a hanging provider cannot hold a
  customer's submission open.
- **HTTPS only.** A plain-HTTP endpoint is refused, because the API key travels
  with the request.
- **One recipient, always the customer.** VRK Decor is never a recipient. The
  business address appears once, as `Reply-To`, which delivers nothing unless
  the customer chooses to write.
- **The message carries no private image, no signed URL, no storage key, no
  price, no tracking pixel and no link that changes anything**, so a mailbox
  read by someone else grants nothing.
- **Every interpolated value is HTML-escaped.**
- **Minimal logging.** A delivery failure logs a fixed message and, for a
  refusal, the status code. Never the recipient, the message or the key.

### Continuation links

- Prefilled WhatsApp messages are built server-side from public content only —
  the name of a published design. They never carry the customer's name, number,
  email or an enquiry identifier, because the URL is visible in the address bar,
  kept in browser history and read by WhatsApp.
- Control, zero-width and direction-override characters are stripped, the whole
  message is percent-encoded and its length is bounded, so nothing inside it can
  alter the link.
- The confirmation page reads only flags and a published design slug from its
  URL, and resolves that slug through the same published-only reader, so an
  invented or unpublished slug reveals nothing.

## Added in P8

The Admin Panel is the first authenticated surface, and the first place a
mistake would be quiet rather than loud.

### Two checks on every operation, always

- **`requireAdmin()` on every admin page and every admin mutation.** A unit test
  walks `app/admin` and `features/admin/actions` and fails the build if one
  loses its guard, or if a write appears before the guard in a module.
- **Every admin read and write goes through the CALLER'S session client**, so
  the `is_active_admin()` policies decide row by row what a statement may touch.
- **The service-role client is used nowhere in the Admin Panel**, asserted by
  that same test. It bypasses Row Level Security, and using it would leave the
  guard as the only check standing: one missed call would expose everything
  instead of nothing.
- The database suite runs every administrative statement as an **active admin, a
  disabled admin, a signed-in customer and an anonymous visitor**, so what the
  Admin Panel can do is exactly what the policies allow, proven rather than
  assumed.
- **Disabling an admin takes effect on the next request**, proven by a test that
  reads the inbox, disables the account, and reads nothing.

### Authentication

- Sign-in is a Server Action, so the request Origin is verified before it runs
  and there is no public JSON endpoint to script against.
- **Rate limited per client and per email address**, because either one alone
  leaves an obvious way around.
- **A wrong password and an unknown address are answered identically**, so the
  form cannot be used to discover which addresses exist.
- The password is never echoed back into the form, never logged, and never
  written to the action state.
- **Authentication is not authorization.** A valid session with no `admin_users`
  row, or a disabled one, opens nothing.

### Administrative input

- Every form is parsed by a schema in `lib/validation/admin.ts` that reads only
  the fields it declares, so an extra field cannot set `status`, `published_at`,
  `created_at` or an identifier. An authenticated browser is still a browser.
- Closed vocabularies for every status, pricing mode, delivery model and pipeline
  step.
- **Slugs are generated, never accepted.** An admin override runs through the
  same `slugify`, so a public URL segment can never carry a path, a query
  string, a percent-encoded sequence or a script.
- **Video URLs are checked against the provider's own hosts** and must be HTTPS,
  because a stored URL becomes an iframe on a public page. A lookalike host such
  as `youtube.com.evil.test` is refused.
- **Money is whole rupees in and paise out**, never floating point, and the
  pricing mode and price must agree.
- **Only two fields of an enquiry can ever be changed**: `status` and
  `internal_notes`. The customer's own answers are the record of what they
  asked for.
- **Enquiries cannot be created from the Admin Panel by anyone**, including an
  active admin. They come from the public quote form through the server and from
  nowhere else, so the inbox cannot be salted.

### Administrative uploads

- Portfolio images pass the same gate as customer uploads: count, size, declared
  type, actual bytes and pixel dimensions (`lib/uploads`). AVIF and HEIC are
  refused because the probe does not read them, rather than trusted because an
  admin sent them.
- The object key is generated from the design id and a random UUID with the
  extension taken from the PROVEN type, and `upsert: false` refuses to replace
  an existing object.
- The upload runs through the admin's session client, so the
  `admins manage portfolio objects` policy applies as well as the guard.
- An object that cannot be recorded as a row is deleted rather than orphaned.

### Private reference images in the inbox

- The rows are read under Row Level Security first; a storage key reaches the
  signer only if a policy handed it over.
- The signed URL is issued with the admin's own session, so the storage policy
  agrees too, and it expires in five minutes.
- They are rendered with a plain `<img>`, never `next/image`: the optimiser
  would fetch and cache a customer's private photograph on disk.
  `referrerPolicy="no-referrer"` keeps the signed URL out of Referer headers.
- `next/image`'s `remotePatterns` allows the Supabase host only under
  `/storage/v1/object/public/portfolio/**`, so the optimiser cannot be pointed
  at the private bucket or at an arbitrary host.

### The panel itself

- `robots: { index: false }` on the segment and the sign-in page, plus
  `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store` on
  every `/admin` response, so a crawler that ignores the meta tag still hears it
  and no shared cache keeps an admin page.
- The public site links to `/admin` from nowhere.
- An unauthenticated visitor reaching any admin URL is redirected to sign-in,
  which reveals nothing: no identities, no counts, no indication of whether
  anything exists.
- Missing and forbidden are answered identically throughout, so an admin whose
  account is disabled mid-session cannot map what exists.
- **Least privilege on `admin_users` tightened**: P3 granted `select` to
  `authenticated` but left Supabase's default INSERT, UPDATE and DELETE grants
  in place. No policy allowed them, so RLS already refused, but P8 revokes the
  privileges as well, so a future migration adding a policy cannot open a door
  nobody meant to open.

## Owned by later phases

| Control                                                                                                            | Phase            |
| ------------------------------------------------------------------------------------------------------------------ | ---------------- |
| Supabase Auth, session handling, secure cookies                                                                    | P3               |
| Row Level Security policies and tests                                                                              | P3               |
| Storage policies; private reference-image bucket                                                                   | P3 ✓, P7 ✓       |
| Server-side authorization and IDOR protection                                                                      | P3, P6, P8       |
| Server-side payload validation on every mutation                                                                   | P6 ✓, P7 ✓, P8 ✓ |
| Upload hardening: MIME/content/size/dimension validation, unique server-generated keys, no executables or archives | P7 ✓             |
| Maximum 3 private reference images per enquiry                                                                     | P7 ✓             |
| Rate limiting — shared store, remaining surfaces (quote form done in P6)                                           | P10              |
| Content Security Policy, HSTS, permissions policy                                                                  | P10              |
| CSRF / request-integrity review (quote form covered by Server Actions in P6)                                       | P10              |
| Sensitive logging minimisation and safe production errors                                                          | P10              |
| Privacy, retention and backup/recovery procedures                                                                  | P10, P12         |

## Standing rules

- Never commit `.env` values, API keys, service-role keys, Hostinger or email
  credentials, or private customer data.
- Never expose the service-role key to the browser.
- Never make reference images publicly readable.
- Never send VRK Decor an email about an enquiry. The Admin Panel is the
  internal inbox.
- Never trust a browser-supplied `Content-Type`, filename or `accept` attribute.
- Only published Designs are publicly visible.
- Never give the Admin Panel a service-role client. Two checks, always.
- Never let an admin form write a column the form does not own.
