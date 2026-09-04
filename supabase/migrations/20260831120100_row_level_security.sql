-- VRK Decor — Row Level Security
--
-- Source of truth: 02_TECHNICAL, Technical Development Specification section 13
-- (Supabase RLS Requirements):
--   * Public users can read only intentionally public published content.
--   * Anonymous users cannot read enquiries, reference images or admin data.
--   * Only authorized admins can mutate portfolio/content/enquiries.
--   * Service-role key is server-only.
--
-- Deny by default: RLS is enabled on every table in `public` and access is
-- granted only by the policies below. A table with no matching policy is
-- unreadable and unwritable by `anon` and `authenticated`.
--
-- The `service_role` used by trusted server code bypasses RLS by design; it is
-- never exposed to the browser. Enquiry creation is performed only by the
-- server after validation and rate limiting, which is why no anonymous INSERT
-- policy exists on `enquiries` or `reference_images`.

-- ---------------------------------------------------------------------------
-- Authorization helper
--
-- SECURITY DEFINER so a policy on admin_users can consult admin_users without
-- recursing through that table's own RLS. search_path is pinned so the function
-- body cannot be redirected by a caller-controlled search_path.
-- ---------------------------------------------------------------------------

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and status = 'active'
  );
$$;

revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------

alter table public.admin_users       enable row level security;
alter table public.occasions         enable row level security;
alter table public.services          enable row level security;
alter table public.styles            enable row level security;
alter table public.designs           enable row level security;
alter table public.design_styles     enable row level security;
alter table public.design_services   enable row level security;
alter table public.design_images     enable row level security;
alter table public.design_videos     enable row level security;
alter table public.packages          enable row level security;
alter table public.testimonials      enable row level security;
alter table public.enquiries         enable row level security;
alter table public.reference_images  enable row level security;

-- Table owners bypass RLS unless forced. Force it so a mistake in a future
-- migration cannot quietly expose data through an owner-privileged connection.
alter table public.enquiries        force row level security;
alter table public.reference_images force row level security;
alter table public.admin_users      force row level security;

-- ---------------------------------------------------------------------------
-- admin_users — never readable by the public
-- ---------------------------------------------------------------------------

create policy admin_users_self_read on public.admin_users
  for select to authenticated
  using (user_id = auth.uid());

create policy admin_users_admin_read on public.admin_users
  for select to authenticated
  using (public.is_active_admin());

-- Provisioning and disabling admins is a server/service-role operation only.
-- No INSERT, UPDATE or DELETE policy is granted to any client role.

-- ---------------------------------------------------------------------------
-- Reference data — active rows are public; only admins may mutate
-- ---------------------------------------------------------------------------

create policy occasions_public_read on public.occasions
  for select to anon, authenticated
  using (status = 'active');

create policy occasions_admin_all on public.occasions
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy services_public_read on public.services
  for select to anon, authenticated
  using (status = 'active');

create policy services_admin_all on public.services
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy styles_public_read on public.styles
  for select to anon, authenticated
  using (status = 'active');

create policy styles_admin_all on public.styles
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy packages_public_read on public.packages
  for select to anon, authenticated
  using (status = 'published');

create policy packages_admin_all on public.packages
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy testimonials_public_read on public.testimonials
  for select to anon, authenticated
  using (approval_status = 'approved');

create policy testimonials_admin_all on public.testimonials
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

-- ---------------------------------------------------------------------------
-- designs — only published designs are publicly visible
-- ---------------------------------------------------------------------------

create policy designs_public_read on public.designs
  for select to anon, authenticated
  using (status = 'published');

create policy designs_admin_all on public.designs
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

-- ---------------------------------------------------------------------------
-- Design children — visible only through a published parent Design
--
-- This is what stops a draft design's media leaking: the child row is readable
-- only when its parent is published, so guessing a design_image id or
-- storage_key reveals nothing (IDOR protection).
-- ---------------------------------------------------------------------------

create policy design_images_public_read on public.design_images
  for select to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.designs d
      where d.id = design_images.design_id
        and d.status = 'published'
    )
  );

create policy design_images_admin_all on public.design_images
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy design_videos_public_read on public.design_videos
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.designs d
      where d.id = design_videos.design_id
        and d.status = 'published'
    )
  );

create policy design_videos_admin_all on public.design_videos
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy design_styles_public_read on public.design_styles
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.designs d
      where d.id = design_styles.design_id
        and d.status = 'published'
    )
  );

create policy design_styles_admin_all on public.design_styles
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy design_services_public_read on public.design_services
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.designs d
      where d.id = design_services.design_id
        and d.status = 'published'
    )
  );

create policy design_services_admin_all on public.design_services
  for all to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

-- ---------------------------------------------------------------------------
-- enquiries and reference_images — never public, in either direction
--
-- No policy is granted to `anon` at all: anonymous clients can neither read nor
-- write. Enquiries are created server-side with the service role after
-- validation, so a customer's lead can never be enumerated, altered or read
-- from the browser. Reference images are private customer data.
-- ---------------------------------------------------------------------------

create policy enquiries_admin_read on public.enquiries
  for select to authenticated
  using (public.is_active_admin());

create policy enquiries_admin_update on public.enquiries
  for update to authenticated
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy enquiries_admin_delete on public.enquiries
  for delete to authenticated
  using (public.is_active_admin());

create policy reference_images_admin_read on public.reference_images
  for select to authenticated
  using (public.is_active_admin());

create policy reference_images_admin_delete on public.reference_images
  for delete to authenticated
  using (public.is_active_admin());

-- ---------------------------------------------------------------------------
-- Schema-level privileges
--
-- Supabase grants broad table privileges to anon/authenticated by default.
-- RLS is the gate, but least privilege is applied on top: no client role may
-- create objects, and write privileges are granted only where a policy could
-- ever allow the write.
-- ---------------------------------------------------------------------------

revoke create on schema public from anon, authenticated;

revoke all on public.enquiries        from anon;
revoke all on public.reference_images from anon;
revoke all on public.admin_users      from anon;

grant select on public.enquiries, public.reference_images, public.admin_users
  to authenticated;
grant update, delete on public.enquiries to authenticated;
grant delete on public.reference_images to authenticated;
