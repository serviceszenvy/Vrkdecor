# features/enquiries

Quote capture: the parent Design, the enquiry form, validation, persistence and
the private reference-image relationship.

Implemented in P6. P7 added the private reference-image upload, the customer
confirmation email and the WhatsApp/phone continuation. P8 renders the Admin
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

| File                       | Responsibility                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `quote-context.ts`         | Resolve and verify the parent Design and originating photo                            |
| `actions.ts`               | The Server Action: validate → resolve → files → throttle → persist → email → redirect |
| `data.ts`                  | Service-role write, private upload, session-scoped admin read                         |
| `confirmation.ts`          | The customer's confirmation, attempted only after the lead is stored                  |
| `throttle.ts`              | Per-client, per-phone and duplicate-submission limits                                 |
| `store.ts`                 | Local-only in-memory store, active only when Supabase is unconfigured                 |
| `types.ts`                 | `QuoteContext`, `CapturedDesign`, `CreateEnquiryInput`, `EnquirySummary`              |
| `components/`              | Captured-design card, form, demonstration-mode and unavailable notices                |
| `@/lib/validation/enquiry` | The field contract from Requirements section 11                                       |
| `@/lib/uploads`            | Type, content, size and dimension validation of attached files                        |
| `@/lib/email`              | Composing and sending the one message this application sends                          |

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
  `validateReferenceImageUploads`, in `referenceImagesSchema`, in
  `linkReferenceImages` and by a database trigger. They are written to the
  private `references` bucket under a server-generated key, have no public URL,
  and are read by an admin only through a short-lived signed URL.

## The order of operations in `submitQuoteRequest`

The sequence is the security design, and each step is where it is for a reason:

1. **validate every field** — nothing else runs first
2. **re-resolve the parent Design**, published only
3. **validate every attached file** — count, size, declared type, actual bytes
   and pixel dimensions. Before the throttle, because a rejected attachment must
   not consume the duplicate window and leave a customer told "we already have
   your request" for a lead that was never created
4. **throttle** by client, phone and request fingerprint
5. **persist the enquiry** — from here the lead exists and is in the inbox
6. **upload the private images**, under keys derived from the new enquiry id
7. **attempt the customer's confirmation email**
8. **redirect**

Steps 6 and 7 are best effort. Neither can fail the request, neither runs before
the enquiry is safe, and a partial upload is reported to the customer plainly
(`?images=partial`) rather than hidden.
