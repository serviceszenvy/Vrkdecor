-- Local Supabase-compatible harness for automated database tests.
--
-- This file is NEVER applied to a Supabase project. Supabase already provides
-- the `auth` and `storage` schemas, the `anon` / `authenticated` /
-- `service_role` roles and the `auth.uid()` helper. This shim recreates just
-- enough of that surface for a plain PostgreSQL instance, so the real
-- migrations in `supabase/migrations/` can be applied unmodified and the RLS
-- and storage policies can be executed and tested for real.
--
-- Keeping it out of `supabase/migrations/` is deliberate: nothing here reaches
-- staging or production.

create schema if not exists auth;
create schema if not exists storage;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

create table if not exists auth.users (
  id         uuid primary key default gen_random_uuid(),
  email      text unique,
  created_at timestamptz not null default now()
);

-- Supabase derives these from the request JWT. Locally the test harness sets
-- the same GUCs, so policies behave identically.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.role', true), '');
$$;

create table if not exists storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean not null default false,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz not null default now()
);

create table if not exists storage.objects (
  id         uuid primary key default gen_random_uuid(),
  bucket_id  text not null references storage.buckets (id),
  name       text not null,
  owner      uuid,
  created_at timestamptz not null default now(),
  unique (bucket_id, name)
);

alter table storage.objects enable row level security;
alter table storage.objects force row level security;

grant usage on schema public, auth, storage to anon, authenticated, service_role;
grant select on auth.users to authenticated, service_role;
grant select on storage.buckets to anon, authenticated, service_role;
grant select, insert, update, delete on storage.objects
  to anon, authenticated, service_role;

-- Supabase grants table privileges to client roles by default; RLS is the gate.
-- Reproduced here so the migrations' own REVOKE statements are meaningful.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

-- `service_role` is granted table privileges by Supabase in the same way, and
-- additionally carries BYPASSRLS (set above). Both halves matter: without the
-- grant, trusted server code could not write at all, and the P6 enquiry-
-- creation path — which is service-role only, because there is deliberately no
-- anonymous INSERT policy — would be untestable.
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
