# features/admin

The Admin Panel (P8): portfolio and media management, page content, packages,
testimonials and the enquiry inbox.

## The authorization rule

Every admin page and every admin mutation does **both** of these, and neither is
sufficient alone:

1. calls `requireAdmin()` / `requireAdminContext()`, which redirects anyone who
   is not an active admin;
2. performs every read and write through **the caller's own session client**, so
   the `is_active_admin()` policies decide, per row, what the statement may
   touch.

**Nothing here uses the service-role client.** That client bypasses Row Level
Security, and using it would leave the guard as the only check standing, so a
single missed call would be total rather than partial.
`tests/unit/admin-authorization.test.ts` fails the build if an admin page or
action loses its guard, or if the service role appears anywhere under
`features/admin` or `app/admin`.

The second half is proven independently against real PostgreSQL in
`tests/db/admin-operations.test.ts`, which runs every administrative statement
as an active admin, a disabled admin, a signed-in customer and an anonymous
visitor.

## Files

| Path                   | Responsibility                                               |
| ---------------------- | ------------------------------------------------------------ |
| `data.ts`              | Admin reads. Every function takes the session client.        |
| `action-state.ts`      | The shape forms and actions exchange; safe error messages.   |
| `actions/auth.ts`      | Sign in and sign out. Rate limited, uniform failure message. |
| `actions/designs.ts`   | Design create, edit, publish, unpublish, archive.            |
| `actions/media.ts`     | Uploads, cover selection, ordering, alt text, videos.        |
| `actions/content.ts`   | Occasions, styles, services, packages, testimonials.         |
| `actions/enquiries.ts` | Pipeline, internal notes, reference-image deletion.          |
| `actions/shared.ts`    | Synchronous helpers (not a `'use server'` module).           |
| `components/`          | The shell and the forms.                                     |

## Rules this feature keeps

- **An enquiry's own answers are never editable.** Only `status` and
  `internal_notes` can be changed. An inbox where a lead's phone number could be
  rewritten would be worth less than the paper it replaced.
- **Enquiries cannot be created from the Admin Panel**, by anyone. They come from
  the public quote form through the server and from nowhere else.
- **VRK Decor is never emailed.** This panel IS the internal notification
  (Requirements & SOW section 11), which is why the overview leads with new
  enquiries.
- **A design cannot be published without a cover image.** Every card and listing
  on the public site uses it.
- **Designs and taxonomy terms are archived or deactivated, never deleted.**
  Enquiries point at designs with `ON DELETE RESTRICT`, and slugs are public
  URLs. A testimonial is the one exception, because nothing references it and a
  customer may ask for it to be removed.
- **Private reference images stay private.** Rows are read under RLS, signed
  URLs are issued with the admin's own session and last five minutes, and they
  are rendered with a plain `<img>` so the image optimiser never caches a
  customer's photograph.
- **Admin input is validated like any other input.** A session does not make a
  payload safe; `lib/validation/admin.ts` is the authority and reads only the
  fields it declares.
