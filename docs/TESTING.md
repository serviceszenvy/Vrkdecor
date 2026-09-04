# Testing

## Layers

| Layer                                | Tool                | Location      | Status                                  |
| ------------------------------------ | ------------------- | ------------- | --------------------------------------- |
| Unit and integration                 | Vitest              | `tests/unit/` | Active from P1                          |
| End-to-end                           | Playwright          | `tests/e2e/`  | Smoke tests from P1; expanded per phase |
| Authorization / RLS / storage policy | Vitest + Playwright | `tests/`      | Active from P3, admin surface from P8   |
| Upload security                      | Vitest + Playwright | `tests/`      | Active from P7                          |
| Customer email and continuation      | Vitest + Playwright | `tests/`      | Active from P7                          |
| Quote validation and rate limiting   | Vitest + Playwright | `tests/`      | Active from P6                          |
| XSS / CSRF / full rate-limit review  | Playwright          | added in P10  | Pending                                 |
| SEO and analytics                    | Playwright          | added in P9   | Pending                                 |
| Accessibility and performance        | Playwright          | added in P11  | Pending                                 |

## Commands

```bash
npm test           # Vitest, single run
npm run test:watch # Vitest, watch mode
npm run test:db    # RLS, storage policies and schema (needs TEST_DATABASE_URL)
npm run test:e2e   # Playwright
npm run verify:bundle # server-only secrets absent from the client bundle
npm run verify     # format check + lint + typecheck + unit tests + build
```

## Rules

- Never run tests against production customer data
  (Technical Development Specification section 4).
- Every phase adds tests for the behaviour it introduces; a phase is not
  complete while its own tests fail.
- Security behaviour is tested explicitly and negatively: anonymous and
  unauthorised access must be proven to fail, not merely assumed to.
- Vitest only collects `tests/unit/**`; Playwright specs are excluded so the two
  runners never collide.

## Current coverage

### P8 — the Admin Panel

Authorization is tested in two independent ways, because the two halves of it
can fail independently.

**Structurally, in `tests/unit/admin-authorization.test.ts`.** It walks the
source rather than the behaviour, because the failure mode being defended
against is somebody adding one more admin page in six months and forgetting one
line, which nothing else would object to:

- every page under `app/admin` calls the guard, with the sign-in page the single
  declared exception, and that page is proven to read no admin data;
- every exported Server Action under `features/admin/actions` calls the guard,
  and the guard appears before the first write in the module;
- **the service-role client appears nowhere** under `features/admin` or
  `app/admin`, so Row Level Security is never bypassed;
- every admin form is parsed by a schema rather than spread into a row, and no
  action writes an identifier or a timestamp column;
- the enquiry update writes `status` and `internal_notes` and nothing else;
- sign-in is rate limited per client and per address, answers every failure
  identically, and never echoes or logs the password.

**Behaviourally, in `tests/db/admin-operations.test.ts`**, against real
PostgreSQL with the real migrations. Every administrative statement the Admin
Panel issues is run as an active admin, a disabled admin, a signed-in customer
and an anonymous visitor:

- designs can be created, edited, published and archived by an active admin and
  by nobody else; a new design is always a draft whatever the caller asked for;
- draft designs stay invisible to everyone else;
- images can be added, described and deleted by an active admin only;
- `set_design_cover` moves the cover in one transaction, leaving exactly one;
  refuses an image belonging to another design; refuses one that does not exist;
  and refuses every caller who is not an active admin;
- `move_design_image` swaps with its neighbour, does nothing at the end of the
  list rather than failing, refuses to reorder the cover, refuses a direction
  that is not up or down, and refuses non-admins;
- occasions, styles and services can be added and switched off by an admin only,
  and an inactive term disappears from the public site while staying visible in
  the Admin Panel;
- a package starts as a draft and a testimonial starts as pending, so nothing
  reaches the public site without a deliberate act;
- an enquiry's pipeline and notes are writable by an active admin, unreachable by
  everyone else, restricted to the approved pipeline steps, and **impossible to
  create from any browser session including an admin's**;
- private reference images are readable and deletable by an active admin only,
  in the table and in storage;
- portfolio storage objects are writable by an active admin only;
- **nobody can grant themselves admin rights**, active admins included, and
  disabling an admin takes effect on the very next statement.

**From the outside, in `tests/e2e/admin.spec.ts`.** This environment has no
Supabase project, so there is no signed-in journey to walk; what it proves is
what an unauthenticated visitor gets:

- every admin route redirects to sign-in;
- the sign-in page leaks nothing — no identities, no counts, no table names;
- it says plainly that the panel is not connected rather than showing a login
  box that cannot work;
- every admin response carries `X-Robots-Tag: noindex` and `Cache-Control:
no-store`, and the page carries noindex metadata;
- the public site links to `/admin` from nowhere;
- the public pages and the 404 page still render the site chrome after the route
  grouping, and no admin page renders the public marketing chrome.

**Admin input, in `tests/unit/admin-validation.test.ts`**: slugs cannot become a
path, a query string or a script; an admin-supplied slug is sanitised rather
than trusted; money is stored in paise and refuses decimals; a pricing mode and
price that disagree are refused in both directions; a video URL must be HTTPS
and belong to the provider chosen, with lookalike hosts refused; only declared
fields are read, so `status`, `published_at` and `id` cannot be smuggled in.

### P7 — uploads, customer email and continuation

Image fixtures live in `tests/fixtures/images/` and are **real files produced by
a real encoder**, a few kilobytes each. Verifying a header parser against bytes
written to satisfy it proves nothing. The hostile files are built in code,
because each has to be wrong in one specific way.

- **Content, not labels.** An SVG, an HTML page, a PHP script, a ZIP, a GIF, a
  PDF and a file that merely starts with JPEG magic bytes are each attached as
  `holiday.jpg` with `Content-Type: image/jpeg` and each refused. A genuine PNG
  announced as a JPEG is refused too.
- **The probe is verified against real images** of all three accepted formats,
  including both WebP encodings and the extended container, and is proven to
  terminate on a JPEG made of nothing but marker padding.
- **Decompression bombs.** A PNG under a kilobyte declaring a 20000x20000 canvas
  is refused, as is an 11000x11000 canvas whose edges are both inside the limit
  but whose pixel count is not.
- **Counts and sizes.** Three images are accepted, a fourth is refused rather
  than silently dropped, an oversized file is refused, and a file exactly at the
  5 MB limit is accepted.
- **Filenames.** Paths, control characters and direction overrides are stripped;
  the result can never be empty or a dotfile; the storage key is proven never to
  contain any of it.
- **The empty part a browser posts for an untouched input is ignored**, through
  a Server Action and through a plain HTML POST, so an ordinary submission with
  no attachment is never turned into an error. An empty file the customer really
  chose is still refused.
- **A rejected attachment does not consume the duplicate window**, proven end to
  end: the customer fixes the file, resends, and gets a new enquiry rather than
  "we already have your request".
- **The rest of the form survives a rejected attachment** and nothing is retyped.
- **Uploads work with JavaScript disabled**, and a bad file is refused and
  re-rendered server-side.
- **Nothing private is exposed.** After an upload, the public pages are loaded
  and asserted to contain no bucket name, no object key, no `enquiries/<uuid>/`
  path and no customer filename. `resolveImageUrl` refuses a reference key
  outright, the server-only modules are proven not to be exported from the
  shared storage index, and the admin summary type is proven to carry a count
  rather than a key.
- **Under RLS**: reference rows are unreachable by an anonymous visitor holding
  the exact key, invisible to a signed-in non-admin, readable by an active
  admin, uncreatable from any browser role including an admin's, and deleted
  with their enquiry. The mime-type constraint refuses SVG, PDF, ZIP, HTML and
  AVIF even from the service role, an empty file is refused, and a storage key
  already in use cannot be claimed by another enquiry.
- **The confirmation email goes to the customer and only the customer.** The
  business address appears exactly once in the composer, as `Reply-To`. The
  message is asserted to carry no signed URL, storage key, price, tracking pixel
  or state-changing link, and every interpolated value is proven escaped.
- **Email failure is proven harmless**: a refusal, an unreachable provider, a
  timeout and a transport that throws all resolve to a value, and none of them
  logs the recipient, the message or the API key. A plain-HTTP endpoint is
  refused outright.
- **Ordering is asserted structurally** in the sources: files are validated
  before the enquiry is stored, the confirmation is attempted after it, no
  failure path after persistence can return a failure to the customer, and
  `confirmation_email_sent_at` is written only after a successful send.
- **The confirmation page promises an email only when one was accepted.** With
  no provider configured, the end-to-end suite asserts the promise is absent.
- **Continuation links** are proven to be `wa.me` click-to-chat only, fully
  percent-encoded, length-bounded, stripped of control and direction-override
  characters, impossible to redirect through their own message, and to carry the
  design name but never the customer's name, number, email or an enquiry id. An
  invented design slug produces a plain link that reveals nothing.

### P6 — quote engine

- **Requirements section 11 as executable tests.** Each of the eight required
  fields is proven required and each of the four optional fields proven
  optional; consent cannot be skipped or forged.
- **Closed vocabularies.** Every approved occasion is accepted as an event type
  and every approved service as a requirement; anything else is refused, so the
  value that reaches the database is always one of a fixed set of slugs.
- **The parent Design is captured, never chosen.** The design resolves from the
  slug alone; a photograph belonging to another design is discarded while the
  parent stands; an unpublished or invented slug produces the same answer, so
  nothing leaks about whether a draft exists; the rendered form is asserted to
  contain no control bound to a design.
- **Every photograph of a design** is walked in the browser and each one proven
  to start a quote for that same parent.
- **The full journey** — gallery → photograph → lightbox CTA → form → submit →
  confirmation — including a general enquiry with no design at all.
- **Duplicate submission** produces one enquiry, not two, and the confirmation
  page cannot resubmit on refresh.
- **Rate limiting** is exercised through the real form: a client that keeps
  submitting is asked to wait, and a rejected attempt does not poison the
  duplicate window for the customer's retry.
- **Everything works with JavaScript disabled**, validation errors included.
- **Admin-owned columns cannot be set from a public request** — `status`,
  `internal_notes` and `confirmation_email_sent_at` are asserted absent from the
  insert.
- **No internal email path exists.** The quote sources are scanned for mail
  transports, `mailto:`, the business address and notification environment
  variables; the test fails if any appears.
- **Under RLS**: an enquiry is readable by an active admin, unreachable by
  anonymous clients at the privilege level, invisible to signed-in non-admins,
  and uncreatable from a browser. A photograph recorded on an enquiry must
  belong to that enquiry's Design, enforced by a trigger on insert and update.
- **Leads survive media and design changes**: deleting a photograph clears the
  reference without touching the parent, and a Design with enquiries cannot be
  deleted, only archived.
- **The local enquiry store is impossible once Supabase is configured**, and the
  quote page says plainly when nothing is being delivered.

### P5 — portfolio

- Parent resolution: photographs always carry their parent Design, no duplicate
  Design records are created for related photographs, and every quote link
  carries a design.
- Cover image resolution and featured ordering.
- Filtering by occasion, style and service, individually and combined.
- Design detail: parent metadata shown once, gallery ordering, 404 for unknown
  or unpublished slugs, optional video present only when the design has one.
- Lightbox: keyboard navigation, Escape with focus return, wrap-around, swipe
  with vertical intent ignored, and a photo-level quote CTA that changes per
  photograph while keeping the same design.
- Filters work with JavaScript disabled.
- Images are asserted to **decode in the browser while in view**, not merely to
  return 200 — a valid file served with a 200 can still fail to render.
- Under RLS, every child row of an unpublished design is invisible, and a
  photograph cannot exist without a parent.
- Sample content is active only when Supabase is unconfigured, and is labelled
  wherever it appears.

### P4 — public website

- Approved figures (14+, 600+, 35+) and the positioning statement are asserted
  verbatim, so a copy edit cannot inflate a claim.
- The content module and the seed migration are compared, so the catalogue is
  identical whether or not the database is reachable.
- Page copy is scanned for superlatives and guarantees, in unit tests and again
  in the rendered pages.
- Every approved route returns 200 with exactly one `h1`.
- Titles and descriptions are unique per page; canonical URL and Open Graph tags
  are present; public pages are indexable and `/design-system` is not.
- Every primary-navigation and footer link resolves, `/quote` included since P6.
- No page scrolls horizontally at 390px, and the sticky action bar is present on
  every public page.
- Partner-vendor services are shown as such; contact details match the approved
  business profile; legal pages carry a visible draft notice.

### P3 — database, auth and storage

Run against a real PostgreSQL instance with the actual migrations applied; see
[DATABASE.md](./DATABASE.md).

- Anonymous visitors: can read published designs, cannot see drafts or their
  media even by exact id, are refused enquiries, reference images and admin
  data, cannot create an enquiry or mutate content, cannot create objects in
  the `public` schema.
- Signed-in non-admins: see exactly what anonymous visitors see, and cannot
  escalate by inserting themselves into `admin_users`.
- Disabled admins: lose access immediately.
- Active admins: can read drafts, enquiries and private reference images,
  publish designs, manage media and move the enquiry pipeline — but still
  cannot grant admin rights from a client connection.
- Storage: portfolio objects public, reference objects unreadable by anonymous
  and non-admin users even with the exact key, no client role can write to the
  private bucket, buckets reject non-image types.
- Schema contract: cover uniqueness, the three-reference-image limit, required
  consent, pricing-mode consistency, slug and storage-key uniqueness, cascade
  and restrict deletion behaviour, approved seed data.
- Drift guards: `lib/db/types.ts` is compared against the live schema, and
  `lib/storage` limits against the migrated buckets.
- Every table in `public` is asserted to have RLS enabled.

### P2 — design system and shell

- Palette anchors match the colours measured in the supplied logo.
- Every palette step and semantic role in `lib/design-tokens.ts` is mirrored in
  `app/globals.css`; drift fails the suite.
- All thirteen documented text/background pairings meet WCAG 2.1 AA.
- Button variants stay at or above the 44px minimum touch target.
- Navigation matches the approved site structure; `tel:`, WhatsApp and `mailto:`
  hrefs are built from the approved business details.
- End-to-end: header and footer contents, skip-link focus behaviour, visible
  focus indicators, mobile sticky action bar, mobile menu open/Escape/focus
  return, content not obscured by the action bar, and the `noindex`
  design-system reference page.

### P1 — foundation

- Environment contract parsing, defaults, rejection of malformed values and
  non-disclosure of secret values in error output.
- `.env.example` completeness and the guarantee that it holds names only.
- Approved business facts in `lib/site-config.ts`.
- End-to-end smoke: home page renders, unknown routes return HTTP 404, the
  health endpoint responds, and baseline security headers are present with
  `X-Powered-By` removed.
