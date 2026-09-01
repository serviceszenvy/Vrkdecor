# features/enquiries

Quote capture: the parent Design, the enquiry form, validation, persistence and
the private reference-image relationship.

Implemented in P6. P7 adds the reference-image upload itself, the customer
confirmation email and WhatsApp/phone instrumentation. P8 renders the Admin
Panel on top of `listEnquiries`.

## The rule this feature exists to guarantee

> The parent Design is automatically captured. The customer must not re-select
> the design.
> — Requirements & SOW section 11, CLAUDE.md core business rules

It is enforced structurally, not by convention:

- `resolveQuoteContext` is the only way a Design enters a quote. It takes the
  slug from the URL, resolves it through `getDesignBySlug` (published only, Row
  Level Security is the boundary), and returns what the SERVER found.
- The form renders that result read-only. There is no design chooser anywhere on
  the page, so there is nothing for a customer to select.
- The submitted hidden field is a lookup key, not a value. `submitQuoteRequest`
  runs `resolveQuoteContext` again and stores what it returns, so tampering can
  at most substitute another **published** Design — never a draft, archived or
  deleted one.
- A photograph is accepted only when it belongs to that resolved Design, in the
  application and again in a database trigger, so a crafted link cannot cross
  the parent relationship.

## Files

| File                       | Responsibility                                                           |
| -------------------------- | ------------------------------------------------------------------------ |
| `quote-context.ts`         | Resolve and verify the parent Design and originating photo               |
| `actions.ts`               | The Server Action: validate → resolve → throttle → persist → redirect    |
| `data.ts`                  | Service-role write, session-scoped admin read                            |
| `throttle.ts`              | Per-client, per-phone and duplicate-submission limits                    |
| `store.ts`                 | Local-only in-memory store, active only when Supabase is unconfigured    |
| `types.ts`                 | `QuoteContext`, `CapturedDesign`, `CreateEnquiryInput`, `EnquirySummary` |
| `components/`              | Captured-design card, form, demonstration-mode and unavailable notices   |
| `@/lib/validation/enquiry` | The field contract from Requirements section 11                          |

## Rules for later phases

- **Never send VRK Decor an email about an enquiry.** The Admin Panel is the
  internal inbox (Requirements section 11, Master Implementation Specification
  section 9). `tests/unit/enquiry-no-internal-email.test.ts` fails if a mail
  path appears in this feature.
- **Persist the enquiry before attempting the customer email.** An email failure
  must never lose a lead. `createEnquiry` returns before any P7 delivery work
  starts, and `confirmation_email_sent_at` is set afterwards.
- **Never write `status`, `internal_notes` or `confirmation_email_sent_at` from
  a public request.** The insert lists its columns explicitly for that reason.
- **Reference images stay private.** Maximum three per enquiry, enforced in
  `referenceImagesSchema`, in `linkReferenceImages` and by a database trigger.
