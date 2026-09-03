# Architecture

## Stack

| Concern                | Technology                                              |
| ---------------------- | ------------------------------------------------------- |
| Framework              | Next.js 16 (App Router)                                 |
| Language               | TypeScript (strict)                                     |
| Runtime                | Node.js >= 20.9 (`.nvmrc` pins the major version)       |
| Styling                | Tailwind CSS v4 (CSS-first configuration)               |
| Database               | Supabase PostgreSQL (P3)                                |
| Auth                   | Supabase Auth (P3)                                      |
| Media                  | Supabase Storage (P3, P7)                               |
| Unit/integration tests | Vitest                                                  |
| End-to-end tests       | Playwright                                              |
| Email                  | Transactional provider, customer confirmation only (P7) |
| Hosting                | Hostinger managed Node.js / Web App Hosting             |
| Source control         | GitHub                                                  |

The application must not depend on Vercel-only capabilities. It is built with
`next build` and served with `next start`, both of which Hostinger's managed
Node.js hosting supports.

## Repository structure

The structure below is the contract from the Technical Development
Specification section 5 and the Master Implementation Specification section 6.

```
app/                    Next.js App Router routes, layouts and route handlers
  (site)/               Every public page, under the public chrome (P8 grouping)
  admin/                The Admin Panel, with a shell of its own (P8)
components/             Shared presentational components
  ui/                   Design-system primitives (P2)
  layout/               Application shell: header, nav, footer, mobile CTA (P2)
  page/                 Page-level sections: hero, CTA band, stats, empty state (P4)
features/
  portfolio/            Design + DesignImage portfolio: data, types, components (P5)
  enquiries/            Quote capture, enquiry persistence, reference images (P6, P7)
  admin/                Admin Panel: data, actions, forms and shell (P8)
lib/
  db/                   Database types and query helpers (P3)
    queries/            Read helpers for public content
  auth/                 Supabase Auth and server-side authorization (P3)
  storage/              Public portfolio and private reference storage (P3, P7)
  uploads/              File type, content, size and dimension validation (P7)
  email/                The customer confirmation message and its transport (P7)
  validation/           Shared Zod schemas, including the environment contract
  analytics/            Analytics event definitions and dispatch (P9)
  content/              Requirements-derived page content: business facts, catalogue (P4)
  site-config.ts        Approved business facts (brand, contact, coverage)
  seo.ts                Per-page metadata, canonical URLs and Open Graph (P4)
  design-tokens.ts      Design-system tokens; source of truth for the palette
  navigation.ts         Route map, primary nav, tel/WhatsApp/mail hrefs
  slug.ts               URL slug generation for admin-managed content (P8)
  contrast.ts           WCAG contrast maths used by the design-system tests
  cn.ts                 Class-name join helper
  rate-limit.ts         In-process fixed-window limiter; shared store in P10
supabase/
  migrations/           Versioned SQL migrations (P3)
tests/
  unit/                 Vitest unit and integration tests
  db/                   Vitest RLS, storage-policy and schema tests (P3)
  e2e/                  Playwright end-to-end tests
scripts/                Verification scripts
docs/                   Engineering documentation
middleware.ts           Supabase session refresh on /admin routes (P3)
```

Directories owned by later phases contain a `README.md` that records the phase
responsible and the rules that phase must honour.

## Domain model (implemented in P3)

`Design` is the parent portfolio entity. `DesignImage` records are children that
share `design_id` and inherit the parent Design's occasion, style, services,
location and description. Related images are never separate Designs. Every
gallery photo can start a quote for its parent Design, and the customer never
re-selects the Design.

Full entity definitions are in the Technical Development Specification section 6.

## The quote flow (P6, completed by P7)

A quote request can start from a Design page or from any individual photograph,
and in both cases the parent Design is captured automatically — the customer
never re-selects it.

```
/our-work/<slug>            design-level CTA  ->  /quote?design=<slug>
/gallery lightbox           photo-level CTA   ->  /quote?design=<slug>&photo=<image id>
header / footer / mobile    site-wide CTA     ->  /quote
```

`features/enquiries/quote-context.ts` is the only place a Design enters a quote.
It resolves the slug through the published-only portfolio reader, accepts a
photograph only when that photograph belongs to the resolved Design, and returns
what the server found. The form renders that result read-only; there is no
design chooser. On submit, the Server Action runs the same resolution again from
the hidden field, so the field is a lookup key rather than a value — tampering
with it can substitute another published Design, never a draft one.

The write path is deliberately narrow:

```
form  ->  submitQuoteRequest (Server Action)
            1. parseEnquiryForm                server-side validation, closed vocabularies
            2. resolveQuoteContext             parent Design re-verified
            3. validateReferenceImageUploads   type, content, size, dimensions
            4. checkQuoteThrottle              per client, per phone, per request
            5. createEnquiry                   service role; no anonymous INSERT policy exists
                 -> uploadReferenceImages      private bucket, server-generated keys
                 -> linkReferenceImages        at most three rows
            6. sendEnquiryConfirmation         the customer only; best effort
            7. redirect                        /quote/submitted[?design&email&images]
```

Steps 1 to 4 can refuse the request. From step 5 the lead exists and is in the
Admin Panel's reach, and everything after it is best effort: a storage failure
costs the customer their attachments and is reported to them plainly, and a
mail-provider failure costs them a courtesy email. Neither can cost VRK Decor
the enquiry.

Files are validated at step 3, before the throttle, so a rejected attachment
does not consume the duplicate window and leave a customer told "we already have
your request" for a lead that was never created.

No email is sent to VRK Decor at any point: the Admin Panel is the internal
inbox. The one message this application sends goes to the customer, only when
they supplied an address, and only after the enquiry is already stored.
`enquiries.confirmation_email_sent_at` is written only when the provider
accepted it.

## Private reference images (P7)

Customer inspiration images are the only private media in the system.

```
browser  ->  Server Action  ->  lib/uploads       bytes inspected, never the label
                             ->  private bucket    enquiries/<enquiry id>/<uuid>.<ext>
                             ->  reference_images  row holds the key, not the file

admin    ->  requireAdmin() ->  createReferenceSignedUrl   five minutes, server-issued
```

There is no public URL, no anonymous storage policy, and no code path that can
build one: `resolveImageUrl` refuses a reference key outright. The object key is
generated on the server from the type proven by the file's own bytes, so the
customer's filename never appears in it and is kept for display only.

## Two applications, one deployment (P8)

The public website and the Admin Panel share a codebase, a design system and a
database, and nothing else. P8 separated their shells with a route group:

```
app/layout.tsx          the document only: <html>, <body>, tokens
app/(site)/layout.tsx   public chrome: skip link, header, main, footer, mobile CTA
app/admin/*             AdminShell: admin nav, identity, sign out
app/not-found.tsx       renders the public chrome itself, being outside the group
```

A route group adds no URL segment, so every public route is exactly where it was
in P4 to P7. The reason for the split is not tidiness: an enquiry inbox sitting
inside a marketing header, a "Get a Quote" action bar and a sales footer is
confusing to work in and careless to show anyone standing behind the person
using it.

## Administrative authorization (P8)

Every admin page and mutation applies TWO checks, and the tests prove each one
independently:

```
request  ->  requireAdminContext()      redirects anyone who is not an active admin
             |
             +-> returns the CALLER'S session client
                   |
                   +-> every read and write        RLS decides, row by row
```

The service-role client, which bypasses Row Level Security, is used **nowhere**
in the Admin Panel. If it were, the guard would be the only check standing and a
single missed call would expose everything rather than nothing.

Two operations touch more than one row and are therefore database functions
rather than sequences of PostgREST calls: `set_design_cover` (a partial unique
index means clearing the old cover and setting the new one must be one
transaction) and `move_design_image` (a swap is two writes that must both land).
Both are SECURITY INVOKER, so Row Level Security still applies inside them.

## Phase ownership

| Phase | Scope                                                                   |
| ----- | ----------------------------------------------------------------------- |
| P1    | Foundation: tooling, structure, environment contract, CI, documentation |
| P2    | Design system and application shell                                     |
| P3    | Supabase schema, migrations, Auth, Storage, RLS                         |
| P4    | Public website pages                                                    |
| P5    | Portfolio, filters, gallery                                             |
| P6    | Quote engine                                                            |
| P7    | Private uploads, customer confirmation email, WhatsApp/phone            |
| P8    | Admin Panel                                                             |
| P9    | SEO and analytics                                                       |
| P10   | Security hardening                                                      |
| P11   | QA and UAT                                                              |
| P12   | Hostinger production deployment                                         |

## Foundation decisions

- **Next.js App Router**, not the Pages Router: required for the metadata,
  streaming and route-handler patterns the later SEO and API phases rely on.
- **Tailwind CSS v4 CSS-first configuration**: design tokens are declared in
  `app/globals.css` via `@theme`; there is no `tailwind.config.js`.
  `lib/design-tokens.ts` is the source of truth and a unit test fails if the two
  drift apart.
- **Vitest** for unit and integration tests: native ESM and TypeScript support,
  fast, and it shares configuration conventions with the Vite ecosystem.
  Playwright covers end-to-end and browser behaviour.
- **Zod** for validation: server-side validation is a non-negotiable security
  requirement, and the environment contract is validated with the same schema
  library the later request-validation work will use.
- **Path alias `@/*`** resolves from the repository root in both TypeScript and
  Vitest.
