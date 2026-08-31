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
components/             Shared presentational components
  ui/                   Design-system primitives (P2)
  layout/               Application shell: header, nav, footer, mobile CTA (P2)
  page/                 Page-level sections: hero, CTA band, stats, empty state (P4)
features/
  portfolio/            Design + DesignImage portfolio: data, types, components (P5)
  enquiries/            Quote capture, enquiry persistence, reference images (P6, P7)
  admin/                Admin Panel: portfolio CRUD and enquiry pipeline (P8)
lib/
  db/                   Database types and query helpers (P3)
    queries/            Read helpers for public content
  auth/                 Supabase Auth and server-side authorization (P3)
  storage/              Public portfolio and private reference storage (P3, P7)
  validation/           Shared Zod schemas, including the environment contract
  analytics/            Analytics event definitions and dispatch (P9)
  content/              Requirements-derived page content: business facts, catalogue (P4)
  site-config.ts        Approved business facts (brand, contact, coverage)
  seo.ts                Per-page metadata, canonical URLs and Open Graph (P4)
  design-tokens.ts      Design-system tokens; source of truth for the palette
  navigation.ts         Route map, primary nav, tel/WhatsApp/mail hrefs
  contrast.ts           WCAG contrast maths used by the design-system tests
  cn.ts                 Class-name join helper
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
