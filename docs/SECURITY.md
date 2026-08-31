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

## Owned by later phases

| Control                                                                                                            | Phase      |
| ------------------------------------------------------------------------------------------------------------------ | ---------- |
| Supabase Auth, session handling, secure cookies                                                                    | P3         |
| Row Level Security policies and tests                                                                              | P3         |
| Storage policies; private reference-image bucket                                                                   | P3, P7     |
| Server-side authorization and IDOR protection                                                                      | P3, P6, P8 |
| Server-side payload validation on every mutation                                                                   | P6, P7, P8 |
| Upload hardening: MIME/content/size/dimension validation, unique server-generated keys, no executables or archives | P7         |
| Maximum 3 private reference images per enquiry                                                                     | P7         |
| Rate limiting                                                                                                      | P10        |
| Content Security Policy, HSTS, permissions policy                                                                  | P10        |
| CSRF / request-integrity protection                                                                                | P10        |
| Sensitive logging minimisation and safe production errors                                                          | P10        |
| Privacy, retention and backup/recovery procedures                                                                  | P10, P12   |

## Standing rules

- Never commit `.env` values, API keys, service-role keys, Hostinger or email
  credentials, or private customer data.
- Never expose the service-role key to the browser.
- Never make reference images publicly readable.
- Only published Designs are publicly visible.
