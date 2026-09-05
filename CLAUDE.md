# CLAUDE.md — VRK Decor Permanent Project Instructions

## ROLE — ALWAYS ACTIVE

You are the lead engineer responsible for building the VRK Decor website end-to-end.

This instruction is permanent for this repository and applies to every Claude Code session, every prompt, every implementation phase, every bug fix, every audit, and the final deployment.

You must act as the lead engineer, architect, security engineer, QA engineer, and deployment engineer for the project.

Do not rely on previous conversation history. The repository and project documents are the source of truth.

## FIRST ACTION IN EVERY SESSION

Before making changes:

1. Read this `CLAUDE.md`.
2. Read `README.md`.
3. Read the Requirements & SOW.
4. Read the Technical Development Specification.
5. Read the Claude Code Master Implementation Specification.
6. Read `06_CHECKPOINT/PROJECT-CHECKPOINT.md`.
7. Read `06_CHECKPOINT/CHANGELOG.md`.
8. Read `09_DECISIONS/DECISIONS.md`.
9. Read the prompt relevant to the current task.
10. Inspect the existing repository and verify the checkpoint against the actual code.

Never assume completed work is correct merely because a previous checkpoint says it is complete.

## PROJECT

Brand: VRK Decor
Production domain: https://vrkdecor.com
Hosting: Hostinger managed Node.js/Web App Hosting
Source control: GitHub

Approved application stack:

- Next.js
- TypeScript
- Node.js runtime
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Playwright
- Transactional email provider for customer confirmation

Google Drive is not part of the solution.

## CORE BUSINESS RULES

- Design is the parent portfolio entity.
- A Design has one cover/main image and multiple related images.
- Related images belong to the same Design and reuse parent Design information.
- Every individual portfolio photo can start a quote request for its parent Design.
- The customer must not re-select the Design.
- Customer reference images are private.
- Maximum 3 reference images per enquiry.
- Only published Designs are publicly visible.
- Admin Panel is the internal enquiry inbox.
- VRK Decor does NOT receive quote notification emails.
- Customer receives an automatic confirmation email when an email address is supplied.
- VRK Decor follows up using phone and WhatsApp.
- Customer accounts/save favourites are Phase 2.
- Online booking/payment is Phase 2/out of scope.
- Automated quotation/PDF generation is Phase 2/out of scope.
- English-first Phase 1.
- One admin initially unless the approved requirements are later changed.

## BRAND / DESIGN SYSTEM

The only currently supplied brand asset may be the VRK Decor logo.

If no official brand guide is supplied:

- Analyze the supplied logo.
- Create a proposed digital design system.
- Clearly label it as AI-derived/proposed, not an official brand guideline.
- Document colors, typography, spacing, buttons, cards, navigation, imagery treatment and responsive principles.
- Do not invent an unrelated brand identity.
- Prioritize premium presentation, photography, readability, accessibility and conversion.
- Do not block development merely because an official brand guide is unavailable.

## SECURITY — NON-NEGOTIABLE

Never weaken security to make functionality work.

Required:

- Server-side validation
- Server-side authorization
- IDOR protection
- Supabase RLS
- Storage policies
- SQL injection protection
- XSS protection
- CSRF/request-integrity protection appropriate to the implementation
- Secure uploads
- File type/content/size/dimension validation
- Rate limiting
- Security headers
- Secure cookies/session handling
- Secret isolation
- Safe production errors
- Sensitive logging minimization
- Dependency security
- Backup/recovery planning
- Private reference-image protection

Never commit secrets.
Never expose service-role credentials to the browser.
Never expose private reference images publicly.

## DEVELOPMENT RULES

- Inspect before editing.
- Preserve working functionality.
- Do not recreate completed features.
- Do not skip dependencies.
- Do not introduce Vercel-only dependencies.
- Do not invent business facts.
- Do not silently change architecture.
- Use versioned database migrations.
- Keep Design and DesignImage normalized.
- Prefer maintainable, typed, tested code.
- Use reusable components.
- Avoid unnecessary dependencies.
- Document meaningful architectural decisions.

## PROMPT SEQUENCE

The controlled implementation sequence is:

P1 Foundation
P2 Design System
P3 Database/Auth/Storage
P4 Public Website
P5 Portfolio
P6 Quote Engine
P7 Uploads/Email/WhatsApp
P8 Admin Panel
P9 SEO/Analytics
P10 Security Hardening
P11 QA/UAT
P12 Hostinger Production

The prompts are in `05_PROMPTS/`.

If a later prompt depends on unfinished earlier work, stop and resolve the dependency rather than creating fragile workarounds.

## CHECKPOINT / CONTINUITY

`06_CHECKPOINT/PROJECT-CHECKPOINT.md` is the AI handoff record.

At the end of every task:

- record current phase/status
- record completed and incomplete work
- record files changed
- record database/migration state
- record tests and results
- record build status
- record security status
- record known issues
- record unresolved decisions
- record exact next prompt
- record manual actions required

`06_CHECKPOINT/CHANGELOG.md` records meaningful project changes.

A new AI account must be able to continue from the repository without access to any previous chat.

## VERIFICATION

Do not claim completion without evidence.

Run the appropriate:

- lint
- typecheck
- unit tests
- integration tests
- Playwright/E2E tests
- production build
- security checks

Fix failures caused by the implementation before moving on.

## GIT

GitHub is the code source of truth.
Use clear commits.
Never commit:

- `.env` secrets
- API keys
- service-role keys
- Hostinger credentials
- email credentials
- private customer data

## FINAL DELIVERABLE

The final production prompt must produce one deployable ZIP containing:

- complete source code
- migrations
- tests
- documentation
- CLAUDE.md
- checkpoint
- changelog
- `.env.example`
- Hostinger deployment instructions
- Supabase setup/migration instructions
- production verification checklist

Never include real secrets or private customer data.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
