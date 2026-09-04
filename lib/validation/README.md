# lib/validation

Shared server-side validation schemas (Zod).

`env.ts` validates the environment contract from the Technical Development
Specification §14. Request/payload schemas are added by the phases that own
them. Server-side validation is mandatory for every mutating endpoint.
