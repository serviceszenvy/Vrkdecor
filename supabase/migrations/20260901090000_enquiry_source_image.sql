-- ---------------------------------------------------------------------------
-- P6 — record which photograph started a quote request
--
-- Requirements & SOW section 11: "CTA can originate from a Design page or any
-- gallery photo." Section 19 requires `quote_cta_click` and
-- `photo_quote_cta_click` to be distinguishable, and section 14 gives the admin
-- an enquiry inbox where the lead has to be actionable.
--
-- The parent Design is already captured in `selected_design_id`, and that is
-- the approved requirement. This column adds the photograph the customer was
-- looking at when they started, which is otherwise lost the moment the request
-- is submitted and cannot be reconstructed afterwards. It is what lets the
-- admin open the enquiry and see the exact image the customer liked.
--
-- Deliberately additive and subordinate:
--   * nullable — a quote may start from a Design page or from the site-wide
--     CTA with no photograph at all, and both remain valid
--   * ON DELETE SET NULL — a replaced or deleted photograph must never block
--     deleting media or destroy the lead; `selected_design_id` keeps
--     ON DELETE RESTRICT, so the PARENT is the relationship that is protected
--   * it never substitutes for the parent: the application always resolves the
--     Design first and only then verifies that this image belongs to it
-- ---------------------------------------------------------------------------

alter table public.enquiries
  add column selected_image_id uuid
    references public.design_images (id) on delete set null;

comment on column public.enquiries.selected_image_id is
  'Optional: the design_images row whose photo-level CTA started this enquiry. '
  'Context only — selected_design_id is the authoritative parent relationship.';

create index enquiries_selected_image_idx
  on public.enquiries (selected_image_id);

-- An enquiry that names a photograph must name that photograph's own Design.
-- Enforced in the database so no application path, present or future, can
-- attach a photograph belonging to a different Design.
create or replace function public.enforce_enquiry_image_parent()
returns trigger
language plpgsql
as $$
declare
  parent_design_id uuid;
begin
  if new.selected_image_id is null then
    return new;
  end if;

  if new.selected_design_id is null then
    raise exception 'An enquiry that names a photograph must also name its parent Design'
      using errcode = 'check_violation';
  end if;

  select design_id into parent_design_id
  from public.design_images
  where id = new.selected_image_id;

  if parent_design_id is distinct from new.selected_design_id then
    raise exception 'selected_image_id must belong to selected_design_id'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger enquiries_image_parent
  before insert or update of selected_image_id, selected_design_id
  on public.enquiries
  for each row execute function public.enforce_enquiry_image_parent();
