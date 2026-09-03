# lib/uploads

Secure upload validation for customer reference images (P7).

`image-signature.ts` reads the first bytes of a file and reports what it
actually is — JPEG, PNG or WebP — together with its pixel dimensions. It parses
headers only and never decodes pixel data. No dependency: an image library would
add a large native binary to a Hostinger managed Node deployment for three
header reads.

`reference-images.ts` is the server-side gate. Every file must pass all of:

| Check      | Rule                                                      |
| ---------- | --------------------------------------------------------- |
| count      | at most 3 per enquiry                                     |
| size       | 1 byte – 5 MB each, 15 MB per request                     |
| declared   | Content-Type is `image/jpeg`, `image/png` or `image/webp` |
| content    | the BYTES are that same type                              |
| dimensions | 200–12000 px per edge, at most 40 megapixels              |
| filename   | sanitised for display only, never used in a storage key   |

The `accept` and `multiple` attributes on the file input are a convenience, not
a control. They are trivially bypassed and are never trusted.

The uploaded objects go to the **private** `references` bucket under a
server-generated random key (`lib/storage/keys.ts`). They have no public URL;
an admin reads them through a short-lived signed URL issued server-side after
`requireAdmin()`.
