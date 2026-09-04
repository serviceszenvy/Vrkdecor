-- VRK Decor — initial schema
--
-- Source of truth for entities: 02_TECHNICAL, Technical Development Specification
-- section 6 (Data Model) and section 7 (Design/Media Rules); 03_MASTER, Master
-- Implementation Specification section 7 (Database Contract).
--
-- Core rule enforced structurally: Design is the parent portfolio entity.
-- DesignImage and DesignVideo are children that share design_id and inherit the
-- parent Design's metadata. Related images are never separate Designs.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enumerated domains
--
-- Implemented as CHECK constraints rather than PostgreSQL enum types: adding a
-- value later is a plain migration rather than an enum alteration, and the
-- constraint names make violations legible in errors.
-- ---------------------------------------------------------------------------

-- Publication lifecycle. "Unpublish" moves a record back to 'draft';
-- 'archived' is the soft-delete state for records that must be retained for
-- referential integrity (see enquiries.selected_design_id below).
create domain publication_status as text
  check (value in ('draft', 'published', 'archived'));

-- Reference data (occasions, services, styles, packages) is simply on or off.
create domain catalog_status as text
  check (value in ('active', 'inactive'));

-- Requirements & SOW section 16: individual designs default to Custom Quote;
-- packages may use approved "Starting From" prices. The site never calculates
-- a final quotation.
create domain pricing_mode as text
  check (value in ('custom_quote', 'starting_from'));

-- Requirements & SOW section 6: some services are fulfilled through trusted
-- partner vendors and must be represented accurately.
create domain delivery_model as text
  check (value in ('in_house', 'partner_vendor'));

-- Requirements & SOW section 15 — enquiry pipeline.
create domain enquiry_status as text
  check (value in (
    'new', 'contacted', 'quotation_sent', 'negotiation',
    'booked', 'completed', 'lost'
  ));

create domain approval_status as text
  check (value in ('pending', 'approved', 'rejected'));

-- Master Implementation Specification section 18 recommends external video URLs
-- over uploads for Phase 1.
create domain video_provider as text
  check (value in ('youtube', 'instagram', 'vimeo'));

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_users — Technical Development Specification section 6 (AdminUser)
--
-- Mirrors Supabase Auth users. Authentication is managed by Supabase Auth;
-- this table carries authorization state only.
-- One admin initially (CLAUDE.md, Core Business Rules).
-- ---------------------------------------------------------------------------

create table public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        text not null default 'admin' check (role in ('admin')),
  status      text not null default 'active' check (status in ('active', 'disabled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index admin_users_status_idx on public.admin_users (status);

create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- occasions — Technical Development Specification section 6 (Occasion)
-- ---------------------------------------------------------------------------

create table public.occasions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  -- Requirements & SOW section 5 pairs English names with Tamil terms,
  -- e.g. "Engagement / Nichayathartham".
  secondary_term  text,
  slug            text not null unique,
  description     text,
  status          catalog_status not null default 'active',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index occasions_status_sort_idx on public.occasions (status, sort_order);

create trigger occasions_set_updated_at
  before update on public.occasions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- services — Technical Development Specification section 6 (Service)
-- ---------------------------------------------------------------------------

create table public.services (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  delivery_model  delivery_model not null default 'in_house',
  status          catalog_status not null default 'active',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index services_status_sort_idx on public.services (status, sort_order);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- styles
--
-- Requirements & SOW section 8 requires portfolio filtering by occasion, style
-- AND service, and section 9 records that an admin enters "style(s)" — plural —
-- for a Design. A Design therefore has one occasion but many styles and many
-- services, which needs its own table plus join tables.
-- The style vocabulary is exactly the approved list in section 8.
-- ---------------------------------------------------------------------------

create table public.styles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  status      catalog_status not null default 'active',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index styles_status_sort_idx on public.styles (status, sort_order);

create trigger styles_set_updated_at
  before update on public.styles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- designs — the parent portfolio entity
-- ---------------------------------------------------------------------------

create table public.designs (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  occasion_id      uuid references public.occasions (id) on delete restrict,
  description      text,
  location         text,
  quote_mode       pricing_mode not null default 'custom_quote',
  -- Stored in paise (smallest currency unit) to avoid floating-point money.
  starting_price   bigint check (starting_price is null or starting_price >= 0),
  featured         boolean not null default false,
  status           publication_status not null default 'draft',
  seo_title        text,
  seo_description  text,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- A "starting from" price is meaningless without a price, and a custom-quote
  -- design must not carry one.
  constraint designs_starting_price_matches_mode check (
    (quote_mode = 'starting_from' and starting_price is not null)
    or (quote_mode = 'custom_quote' and starting_price is null)
  )
);

-- Public listing queries only published designs; this index serves them.
create index designs_public_listing_idx
  on public.designs (status, featured desc, published_at desc);
create index designs_occasion_idx on public.designs (occasion_id);

create trigger designs_set_updated_at
  before update on public.designs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- design_styles / design_services — many-to-many classification
-- ---------------------------------------------------------------------------

create table public.design_styles (
  design_id  uuid not null references public.designs (id) on delete cascade,
  style_id   uuid not null references public.styles (id) on delete restrict,
  primary key (design_id, style_id)
);

create index design_styles_style_idx on public.design_styles (style_id);

create table public.design_services (
  design_id   uuid not null references public.designs (id) on delete cascade,
  service_id  uuid not null references public.services (id) on delete restrict,
  primary key (design_id, service_id)
);

create index design_services_service_idx on public.design_services (service_id);

-- ---------------------------------------------------------------------------
-- design_images — child media of a Design
--
-- All related images share design_id and inherit the parent Design's occasion,
-- styles, services, location and description. Only alt_text may be overridden
-- per image (Requirements & SOW section 9).
-- ---------------------------------------------------------------------------

create table public.design_images (
  id           uuid primary key default gen_random_uuid(),
  design_id    uuid not null references public.designs (id) on delete cascade,
  -- Server-generated unique object key in the portfolio storage bucket.
  storage_key  text not null unique,
  alt_text     text,
  sort_order   integer not null default 0,
  is_cover     boolean not null default false,
  status       publication_status not null default 'published',
  width        integer check (width is null or width > 0),
  height       integer check (height is null or height > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- A Design has exactly one cover image at most; enforced in the database rather
-- than in application code.
create unique index design_images_one_cover_per_design_idx
  on public.design_images (design_id)
  where is_cover;

create index design_images_design_order_idx
  on public.design_images (design_id, sort_order);

create trigger design_images_set_updated_at
  before update on public.design_images
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- design_videos — external video/reel URLs (Phase 1 is URL-only)
-- ---------------------------------------------------------------------------

create table public.design_videos (
  id          uuid primary key default gen_random_uuid(),
  design_id   uuid not null references public.designs (id) on delete cascade,
  provider    video_provider not null,
  url         text not null,
  caption     text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Phase 1 stores external URLs only; no uploaded video objects.
  constraint design_videos_url_is_https check (url like 'https://%')
);

create index design_videos_design_order_idx
  on public.design_videos (design_id, sort_order);

create trigger design_videos_set_updated_at
  before update on public.design_videos
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- packages — Technical Development Specification section 6 (Package)
-- ---------------------------------------------------------------------------

create table public.packages (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  pricing_mode    pricing_mode not null default 'custom_quote',
  starting_price  bigint check (starting_price is null or starting_price >= 0),
  status          publication_status not null default 'draft',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint packages_starting_price_matches_mode check (
    (pricing_mode = 'starting_from' and starting_price is not null)
    or (pricing_mode = 'custom_quote' and starting_price is null)
  )
);

create index packages_status_sort_idx on public.packages (status, sort_order);

create trigger packages_set_updated_at
  before update on public.packages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- testimonials — Technical Development Specification section 6 (Testimonial)
-- ---------------------------------------------------------------------------

create table public.testimonials (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  body             text not null,
  event_type       text,
  approval_status  approval_status not null default 'pending',
  display_order    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index testimonials_approved_order_idx
  on public.testimonials (approval_status, display_order);

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- enquiries — Technical Development Specification section 6 (Enquiry)
--
-- Required fields follow Requirements & SOW section 11. Optional: email,
-- guest_count, budget, notes.
--
-- selected_design_id uses ON DELETE RESTRICT: a lead must never silently lose
-- the Design it came from. A Design that has enquiries is archived, not
-- deleted.
-- ---------------------------------------------------------------------------

create table public.enquiries (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null check (length(btrim(name)) > 0),
  phone              text not null check (length(btrim(phone)) > 0),
  email              text,
  event_type         text not null,
  event_date         date,
  venue              text,
  city               text not null,
  guest_count        integer check (guest_count is null or guest_count > 0),
  budget             text,
  required_services  text[] not null default '{}',
  notes              text,
  selected_design_id uuid references public.designs (id) on delete restrict,
  status             enquiry_status not null default 'new',
  -- Requirements & SOW section 11 makes consent a required field.
  consent            boolean not null check (consent = true),
  -- Admin-only pipeline notes (Requirements & SOW section 14).
  internal_notes     text,
  -- Set when the customer confirmation email is accepted by the provider (P7).
  -- Email failure must never prevent the enquiry from reaching the Admin Panel.
  confirmation_email_sent_at timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index enquiries_status_created_idx on public.enquiries (status, created_at desc);
create index enquiries_design_idx on public.enquiries (selected_design_id);

create trigger enquiries_set_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- reference_images — PRIVATE customer inspiration images
--
-- Requirements & SOW section 13 and CLAUDE.md: maximum 3 per enquiry, stored
-- privately, never exposed as public portfolio assets.
-- ---------------------------------------------------------------------------

create table public.reference_images (
  id                 uuid primary key default gen_random_uuid(),
  enquiry_id         uuid not null references public.enquiries (id) on delete cascade,
  design_id          uuid references public.designs (id) on delete set null,
  -- Server-generated unique object key in the PRIVATE reference bucket.
  storage_key        text not null unique,
  original_filename  text not null,
  mime_type          text not null check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  size_bytes         bigint not null check (size_bytes > 0),
  created_at         timestamptz not null default now()
);

create index reference_images_enquiry_idx on public.reference_images (enquiry_id);

-- Maximum 3 reference images per enquiry, enforced in the database so no
-- application path can exceed it.
create or replace function public.enforce_reference_image_limit()
returns trigger
language plpgsql
as $$
declare
  image_count integer;
begin
  select count(*) into image_count
  from public.reference_images
  where enquiry_id = new.enquiry_id;

  if image_count >= 3 then
    raise exception 'An enquiry may have at most 3 reference images'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger reference_images_limit
  before insert on public.reference_images
  for each row execute function public.enforce_reference_image_limit();
