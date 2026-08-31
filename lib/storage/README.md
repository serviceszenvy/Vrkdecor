# lib/storage

Supabase Storage access (P3).

Two buckets, defined in
`supabase/migrations/20260831120200_storage.sql`:

| Bucket       | Visibility  | Limit | Types                 |
| ------------ | ----------- | ----- | --------------------- |
| `portfolio`  | Public read | 10 MB | JPEG, PNG, WebP, AVIF |
| `references` | **Private** | 5 MB  | JPEG, PNG, WebP       |

Rules:

- **Object keys are generated on the server** (`keys.ts`) and never derived from
  a user-supplied filename. That prevents path traversal, collisions and the
  enumeration of private objects. The original filename is stored in the
  database for display only.
- **Reference images have no public URL.** Admins read them through short-lived
  signed URLs issued server-side after `requireAdmin()` (`urls.ts`), never
  through a permanent link.
- Buckets reject anything that is not an approved image type, at the storage
  layer, in addition to server-side validation (P7). No SVG (scriptable), no
  PDF, no archives, no executables.
- `urls.ts` imports `server-only`; it can never reach the browser bundle.

Upload validation of file content and dimensions, and the upload flow itself,
are implemented in P7.
