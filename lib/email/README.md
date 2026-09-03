# lib/email

The customer confirmation email (P7).

**One message exists in this application, and VRK Decor is never its
recipient.** The internal enquiry inbox is the Admin Panel (Requirements & SOW
section 11, Master Implementation Specification section 9, CLAUDE.md).
`tests/unit/enquiry-no-internal-email.test.ts` and
`tests/unit/customer-confirmation-email.test.ts` both fail if that changes.

| File                      | Responsibility                                         |
| ------------------------- | ------------------------------------------------------ |
| `confirmation-message.ts` | Composes the message. Pure, no I/O, fully unit-tested. |
| `transport.ts`            | Sends it. Provider-agnostic HTTPS JSON, no dependency. |
| `send-confirmation.ts`    | Orchestrates, and never throws.                        |

## Ordering

The enquiry is persisted **first**. The confirmation is attempted afterwards,
and `enquiries.confirmation_email_sent_at` is written only when the provider
accepted the message. A failed, timed-out or unconfigured send leaves the lead
untouched and still in the Admin Panel.

## Configuring a provider

The provider is an open client decision, so the transport is configured rather
than coded:

```
EMAIL_PROVIDER_API_URL=https://<provider>/emails   # HTTPS only
EMAIL_PROVIDER_API_KEY=<secret>                    # sent as a bearer token
EMAIL_FROM_ADDRESS=<verified sender>
```

With any one of them missing, the transport is a no-op: nothing is sent and
nothing fails. The request body is the shape the mainstream JSON send APIs use:

```json
{ "from": "…", "to": ["…"], "subject": "…", "text": "…", "html": "…", "reply_to": "…" }
```

If the chosen provider wants a different envelope, `buildRequestBody` in
`transport.ts` is the only function to change.

## What the message never contains

- any reference to the customer's private inspiration images, and no signed URL,
  storage key or thumbnail of one
- a price or anything that reads like a quotation
- a tracking pixel or a click-tracked link
- a link that changes anything, so a mailbox read by someone else grants nothing
