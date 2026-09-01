# VRK Decor — Project Checkpoint

Version: 0.6.0
Status: P6 COMPLETE — quote engine implemented and verified
Current phase: P6 — Quote Engine (complete)
Completed phases: P1, P2, P3, P4, P5, P6
Last updated: 2026-09-01

## Verified project state

Foundation (P1), design system and shell (P2), database/auth/storage with RLS
(P3), public website pages (P4), the complete portfolio (P5) and the quote
engine (P6). Reference-image upload, the customer confirmation email, the admin
panel, SEO/analytics and the remaining hardening are not implemented.

Every claim below was produced by running the command in this repository. The
P1–P5 state recorded in the previous checkpoint was independently re-verified at
the start of this phase before any code was written.

Implemented in P6:

- **`/quote`** — the enquiry form, reached three ways and rendered by one page:
  `/quote` (site-wide CTA), `/quote?design=<slug>` (design-level CTA) and
  `/quote?design=<slug>&photo=<image id>` (photo-level CTA from the lightbox).
- **Automatic parent-Design capture.** `features/enquiries/quote-context.ts` is
  the only path by which a Design enters a quote. It resolves the slug
  server-side against published designs only, accepts a photograph only when
  that photograph belongs to the resolved Design, and runs again on submit. The
  form shows the result read-only; there is no design chooser anywhere on the
  page, and an end-to-end test asserts the rendered form contains no control
  bound to a design.
- **Field contract from Requirements section 11**, implemented in
  `lib/validation/enquiry.ts`. Required: name, phone/WhatsApp, event type, event
  date, venue, city, required services, consent. Optional: email, guest count,
  budget, notes. Event type and services are closed vocabularies drawn from the
  approved occasion and service lists.
- **Server-side validation is the authority.** Nothing is persisted from
  unparsed input, and the parser reads only the fields it declares, so
  `status`, `internal_notes`, `confirmation_email_sent_at` and
  `selected_design_id` cannot be smuggled in as extra form fields.
- **Consent is mandatory**, in the schema and in the database CHECK constraint.
- **Enquiry persistence** with `selected_design_id`, opened at pipeline status
  `new`, written by the service role — there is deliberately no anonymous INSERT
  policy, so a lead cannot be forged, enumerated or altered from a browser.
- **Reference-image relationship**: up to three private images per enquiry,
  enforced in `referenceImagesSchema`, again in `linkReferenceImages` and again
  by the database trigger. The upload itself is P7.
- **Rate limiting and duplicate handling**: per client, per phone number and per
  identical request. A repeated identical request inside ten minutes produces
  one lead and an honest "we already have your request" confirmation.
- **`/quote/submitted`** — a `noindex` confirmation page with no enquiry
  identifier in its URL, so a refresh cannot resubmit.
- **Works with JavaScript disabled.** Submission is a Server Action; the form
  degrades to a plain POST and validation errors render server-side.
- **`listEnquiries`** — the Admin Panel's inbox query, running as the caller so
  Row Level Security decides who sees a lead.
- **Migration `20260901090000_enquiry_source_image.sql`** — nullable
  `enquiries.selected_image_id` recording which photograph started the quote,
  with a trigger refusing any photograph belonging to a different Design.

NOT implemented (correctly out of P6 scope): reference-image upload, customer
confirmation email, WhatsApp/phone instrumentation (P7); the Admin Panel screens
(P8); sitemap, robots, structured data, analytics events (P9); CSP, shared-store
rate limiting and the remaining hardening (P10).

**No internal email is sent to VRK Decor**, as Requirements section 11 requires.
This is asserted by `tests/unit/enquiry-no-internal-email.test.ts`, which scans
the quote sources for mail transports, `mailto:`, the business email address and
notification environment variables.

## Approved stack

Next.js + TypeScript + Node.js + Tailwind CSS + Supabase PostgreSQL/Auth/Storage

- Playwright + transactional email provider.

## Hosting

Hostinger managed Node.js/Web App Hosting. Domain: vrkdecor.com.
Build `npm run build`; start `npm start`. Node.js >= 20.9 (`.nvmrc` pins 22).
No Vercel-only capabilities. Server Actions are a framework feature of Next.js
itself and run on any Node host; they are not a Vercel dependency.

## Communication

- VRK Decor internal email notification: NO — verified by test
- Admin Panel: data path implemented in P6, screens in P8
- Customer confirmation email: P7 (`confirmation_email_sent_at` column ready)
- Customer follow-up: Phone/WhatsApp

## Quote model

The parent Design is captured, not chosen:

- `resolveQuoteContext` is the single entry point, and it returns what the
  SERVER found, never what the customer sent.
- The hidden `design` field is a lookup key. On submit it is re-resolved through
  the same published-only reader, so tampering can at most substitute another
  **published** Design — never a draft, archived or deleted one.
- A photograph is accepted only when it belongs to the resolved Design, in the
  application and again in a database trigger.
- A design parameter that does not resolve degrades to a general enquiry with a
  visible notice. Draft, archived, deleted and invented slugs are answered
  identically, so the form cannot be used to discover unpublished work.

## Sample content status

Unchanged from P5: `lib/content/sample-portfolio.ts` and `public/samples/` (24
images, 364 KB) are procedurally generated placeholders, active only when
Supabase is unconfigured, labelled wherever they appear. **Both must be deleted
before the production build.**

P6 adds a second gated development aid on the same pattern:
`features/enquiries/store.ts` keeps submitted enquiries in process memory when
Supabase is unconfigured, so the whole flow is demonstrable and testable before
a Supabase project exists. It throws rather than runs once Supabase is
configured, a unit test asserts that, and the quote page shows a
**Demonstration mode** notice whenever it is active. Unlike the sample
portfolio it holds no content and needs no deletion — configuring Supabase
disables it.

## Database / migration state

**Five** migrations now exist and are verified on every test run. They have
**not** been applied to any Supabase project.

| Migration                                 | Contents                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `20260831120000_initial_schema.sql`       | Tables, constraints, triggers                                                    |
| `20260831120100_row_level_security.sql`   | RLS policies and privileges                                                      |
| `20260831120200_storage.sql`              | Buckets and storage policies                                                     |
| `20260831120300_seed_reference_data.sql`  | Approved occasions, services, styles                                             |
| `20260901090000_enquiry_source_image.sql` | **New in P6** — `enquiries.selected_image_id` and its parent-consistency trigger |

## Files added or changed in P6

Added

- `lib/validation/enquiry.ts`, `lib/rate-limit.ts`
- `features/enquiries/` — `quote-context.ts`, `actions.ts`, `form-state.ts`,
  `data.ts`, `store.ts`, `throttle.ts`, `types.ts`, `index.ts`, and
  `components/` (captured design, quote form, demonstration-mode notice,
  unavailable-design notice)
- `app/quote/page.tsx`, `app/quote/submitted/page.tsx`
- `supabase/migrations/20260901090000_enquiry_source_image.sql`
- `tests/unit/enquiry-validation.test.ts`, `tests/unit/quote-context.test.ts`,
  `tests/unit/enquiry-throttle.test.ts`, `tests/unit/enquiry-store.test.ts`,
  `tests/unit/enquiry-no-internal-email.test.ts`
- `tests/db/enquiries.test.ts`, `tests/e2e/quote.spec.ts`

Changed

- `lib/db/types.ts` — `EnquiryRow.selected_image_id`
- `features/enquiries/README.md` — rewritten for the implemented feature
- `tests/db/schema-types.test.ts` — new column declared
- `tests/db/supabase-shim.sql` — `service_role` table privileges, as real
  Supabase grants
- `tests/e2e/public-pages.spec.ts` — `/quote` exclusion removed
- `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/SECURITY.md`
- `06_CHECKPOINT/PROJECT-CHECKPOINT.md`, `CHANGELOG.md`
- `09_DECISIONS/DECISIONS.md`

No dependency was added.

## Tests and results (run 2026-09-01 in this repository)

| Command                        | Result                                         |
| ------------------------------ | ---------------------------------------------- |
| `npm run format:check`         | PASS                                           |
| `npm run lint`                 | PASS — 0 errors, 0 warnings                    |
| `npm run typecheck`            | PASS — 0 errors                                |
| `npm test`                     | PASS — 19 files, 175 tests (was 93)            |
| `npm run test:db`              | PASS — 5 files, 79 tests (was 61)              |
| `npm run test:e2e`             | PASS — 158 tests (was 110), 4.1 min            |
| `npm run build`                | PASS — 15 routes + 6 design pages + middleware |
| `npm run verify:bundle`        | PASS — no server-only secret in client assets  |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities                       |

The P1–P5 suites were also re-run unchanged before P6 began (93 unit, 61
database, 110 end-to-end, build) and all passed, confirming the previous
checkpoint against the actual repository.

A build with Supabase configured generates no sample design pages, confirming
again that placeholder content cannot reach production.

## Build status

Production build succeeds. `/quote` and `/quote/submitted` are dynamic, as they
read query parameters. `/our-work` is dynamic; `/our-work/[slug]` is pre-rendered
per published design; everything else public is static.

## Security status

Not weakened. P6 added no dependency. Added in this phase:

- Server-side validation on every field; the parser reads only declared fields,
  so admin-owned columns cannot be set from a public request.
- Closed vocabularies for event type and services, so the value that reaches the
  database is always one of a fixed set of slugs.
- The parent Design is re-resolved server-side on submit; the hidden field is
  powerless beyond selecting another published Design.
- CSRF/request integrity through Next.js Server Actions, which verify the
  request Origin against the host before the action runs. No public JSON
  endpoint exists.
- Rate limiting per client, per phone and per identical request, with client
  keys hashed so no IP address is retained.
- Control, zero-width and bidirectional formatting characters stripped; markup
  stored as text and escaped on render rather than rejected.
- Safe errors and minimal logging: a storage failure logs a fixed message, never
  the error object or the customer's submitted values.
- The confirmation page carries no identifier and is `noindex`.
- Under RLS: an enquiry is readable by an active admin, unreachable by anonymous
  clients at the privilege level, invisible to signed-in non-admins, and
  uncreatable from a browser. All proven by tests.

## Known issues

- **The Admin Panel screens do not exist yet (P8).** P6 delivers and tests the
  data path — the enquiry is persisted at status `new`, is readable by an active
  admin and by nobody else — but there is no page to view it on. Until P8 ships,
  a submitted enquiry can only be read from the database.
- **Rate limiting is per Node process.** Correct for a single Hostinger
  instance, insufficient for a multi-instance deployment; the counters also
  reset on restart. P10 replaces the store.
- **The client rate-limit key comes from `x-forwarded-for`**, which is
  spoofable. Accepted for a throttle; P10 should pin it to the trusted proxy.
- **Reference images cannot be attached yet.** The relationship, validation and
  the three-image ceiling are implemented and tested; the upload is P7.
- **No customer confirmation email yet (P7).** The form and confirmation page
  are deliberately worded not to promise one; P7 must add both the email and the
  copy that announces it.
- Sample content and images must be deleted before the production build (P5
  carry-over).
- AVIF output disabled and image candidate widths capped at 1920 (P5
  carry-over).
- Migrations are still not applied to any Supabase project (P3 carry-over).
- No webfont, no reversed logo variant (P2 carry-over); legal pages are drafts
  (P4 carry-over); `@playwright/test` pinned to 1.56.0 (P1 carry-over).
- `next build` warns that the `middleware` file convention is deprecated in
  favour of `proxy`. Pre-existing, harmless, and best migrated in P10 or P12
  alongside the other framework-level configuration.

## Unresolved decisions

| Decision                                                     | Needed by            |
| ------------------------------------------------------------ | -------------------- |
| **Supabase staging and production projects must be created** | P7 onwards           |
| **Transactional email provider**                             | P7                   |
| **Real portfolio designs and photography**                   | Production           |
| Image upload dimension limits                                | P7                   |
| Approved hero photography or video                           | Sign-off             |
| Instagram / social account handle                            | Home social showcase |
| Legal review of the Privacy Policy and Terms                 | Production           |
| Approval of the proposed design system                       | Sign-off             |
| Final typeface selection and licence                         | Sign-off             |
| Reversed/light logo variant for dark surfaces                | Sign-off             |
| Exact Hostinger plan and Node.js version offered             | P12                  |
| Practical maximum related images per Design                  | P8                   |
| Enquiry and reference-image retention period                 | P10                  |
| Google Analytics / Search Console owning account             | P9                   |
| Browser support floor                                        | P11                  |

## Manual actions required before later phases

1. **Create Supabase projects for staging and production** and apply the five
   migrations (`supabase link`, `supabase db push`). Until this is done, no
   enquiry can be stored anywhere but a developer's process memory.
2. **Create the first admin**: a Supabase Auth user plus a matching
   `admin_users` row inserted with the service role.
3. Choose the transactional email provider and supply its credentials (P7).
4. Supply real designs and photography; delete `public/samples/` and
   `lib/content/sample-portfolio.ts`.
5. Supply approved hero photography or video.
6. Review the two draft legal pages and confirm the retention period.
7. Approve the design system; confirm the typeface; supply a reversed logo.
8. Create the GitHub repository and push; enable the CI workflow.
9. Confirm the Hostinger plan.

## Next action

Execute `05_PROMPTS/07-UPLOADS-EMAIL-WHATSAPP.md` (P7 — Private uploads, customer
email, WhatsApp).

P7 consumes what this phase produced:

- `createEnquiry` already accepts up to three reference images and links them;
  P7 adds the upload — MIME, content, size and dimension validation, the
  server-generated key in the private `references` bucket, and the client
  control on the quote form. It must not raise the ceiling of three and must not
  make a reference image publicly readable.
- The enquiry is persisted before anything else happens, so P7's customer
  confirmation email must be sent AFTER `createEnquiry` returns and must set
  `confirmation_email_sent_at` on success only. An email failure must leave the
  lead untouched and reaching the Admin Panel.
- **P7 must not add an internal notification to VRK Decor.**
  `tests/unit/enquiry-no-internal-email.test.ts` will fail if it does, and that
  is the intended behaviour, not an obstacle to work around.
- The form and confirmation page currently promise no email. P7 should update
  both once the confirmation actually sends.
