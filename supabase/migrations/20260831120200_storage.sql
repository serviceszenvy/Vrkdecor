-- VRK Decor — Supabase Storage buckets and policies
--
-- Source of truth: 02_TECHNICAL section 11 (Media Architecture) and section 13;
-- 03_MASTER section 8 (Media Contract); Requirements & SOW section 13.
--
--   * Supabase Storage, not Google Drive.
--   * Public portfolio bucket for published portfolio assets.
--   * PRIVATE reference bucket. Reference images are never publicly readable.
--   * Server-generated unique storage keys.
--   * Strict MIME/size limits; no executable or archive uploads.
--
-- Upload limits are a developer decision documented per Master Implementation
-- Specification section 18. Chosen values:
--   portfolio  — 10 MB, image/jpeg, image/png, image/webp, image/avif
--   references —  5 MB, image/jpeg, image/png, image/webp
-- Content and dimension validation happens server-side before upload (P7);
-- these bucket limits are the second line of defence, enforced by Storage
-- itself so a bypassed application path still cannot store an oversized or
-- non-image object.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'portfolio',
    'portfolio',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'references',
    'references',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- portfolio bucket — public read, admin-only write
-- ---------------------------------------------------------------------------

create policy "portfolio objects are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'portfolio');

create policy "admins manage portfolio objects"
  on storage.objects for all to authenticated
  using (bucket_id = 'portfolio' and public.is_active_admin())
  with check (bucket_id = 'portfolio' and public.is_active_admin());

-- ---------------------------------------------------------------------------
-- references bucket — PRIVATE
--
-- No policy grants `anon` any access, so anonymous requests cannot list, read
-- or write reference objects even with a valid object key. Customers upload
-- through a server route using the service role; admins read through
-- short-lived signed URLs issued server-side.
-- ---------------------------------------------------------------------------

create policy "admins read reference objects"
  on storage.objects for select to authenticated
  using (bucket_id = 'references' and public.is_active_admin());

create policy "admins delete reference objects"
  on storage.objects for delete to authenticated
  using (bucket_id = 'references' and public.is_active_admin());
