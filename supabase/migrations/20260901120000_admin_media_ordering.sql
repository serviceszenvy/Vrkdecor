-- ---------------------------------------------------------------------------
-- P8 — atomic cover selection and image reordering
--
-- Requirements & SOW section 9: an admin sets the cover/main image of a Design
-- and controls the order of its related images. Both operations touch more than
-- one row, and neither is safe as a pair of separate PostgREST calls:
--
--   * `design_images_one_cover_per_design_idx` is a PARTIAL UNIQUE index, so
--     "clear the old cover" and "set the new one" must happen inside a single
--     transaction. Two round trips can leave a Design with no cover at all if
--     the second one fails, and a single multi-row UPDATE can trip the unique
--     index part-way depending on the order rows happen to be visited.
--   * swapping two `sort_order` values is two writes that must both land.
--
-- Both functions are SECURITY INVOKER (the default), so they run with the
-- CALLER's privileges and Row Level Security still applies: the
-- `design_images_admin_all` policy is what decides whether the rows are
-- writable. The explicit `is_active_admin()` check on entry is not the security
-- boundary, it is there so a non-admin gets a clear error rather than a silent
-- no-op. Both checks must pass.
--
-- `search_path` is pinned on both so a caller-controlled search path cannot
-- redirect the tables or the helper function the bodies reference.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- set_design_cover — make one image the cover of its Design, atomically
-- ---------------------------------------------------------------------------

create or replace function public.set_design_cover(
  p_design_id uuid,
  p_image_id uuid
)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare
  owning_design uuid;
begin
  if not public.is_active_admin() then
    raise exception 'Only an active administrator may set a cover image'
      using errcode = 'insufficient_privilege';
  end if;

  select design_id into owning_design
  from public.design_images
  where id = p_image_id;

  if owning_design is null then
    raise exception 'Image not found' using errcode = 'no_data_found';
  end if;

  -- The cover of a Design must be one of that Design's own images. Enforced
  -- here as well as by the caller, because this function is reachable by RPC.
  if owning_design is distinct from p_design_id then
    raise exception 'That image belongs to a different design'
      using errcode = 'check_violation';
  end if;

  update public.design_images
     set is_cover = false
   where design_id = p_design_id
     and is_cover
     and id <> p_image_id;

  update public.design_images
     set is_cover = true
   where id = p_image_id;
end;
$$;

revoke all on function public.set_design_cover(uuid, uuid) from public;
grant execute on function public.set_design_cover(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- move_design_image — swap an image with its neighbour, atomically
--
-- Ordering is expressed as "move up" / "move down" rather than drag-and-drop so
-- it works without JavaScript, is operable from a keyboard, and needs no
-- client-side state. `p_direction` is -1 (earlier) or 1 (later).
-- ---------------------------------------------------------------------------

create or replace function public.move_design_image(
  p_image_id uuid,
  p_direction integer
)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare
  this_design uuid;
  this_order  integer;
  this_cover  boolean;
  other_id    uuid;
  other_order integer;
begin
  if not public.is_active_admin() then
    raise exception 'Only an active administrator may reorder images'
      using errcode = 'insufficient_privilege';
  end if;

  if p_direction not in (-1, 1) then
    raise exception 'Direction must be -1 or 1' using errcode = 'check_violation';
  end if;

  select design_id, sort_order, is_cover
    into this_design, this_order, this_cover
  from public.design_images
  where id = p_image_id;

  if this_design is null then
    raise exception 'Image not found' using errcode = 'no_data_found';
  end if;

  -- The cover is presented first everywhere it appears, so it has no place in
  -- the ordering of the related images.
  if this_cover then
    raise exception 'The cover image is always shown first'
      using errcode = 'check_violation';
  end if;

  -- The neighbour in the requested direction, ordered exactly as the gallery
  -- orders them so "up" on screen and "up" here mean the same thing.
  if p_direction = -1 then
    select id, sort_order into other_id, other_order
    from public.design_images
    where design_id = this_design
      and not is_cover
      and (sort_order, id) < (this_order, p_image_id)
    order by sort_order desc, id desc
    limit 1;
  else
    select id, sort_order into other_id, other_order
    from public.design_images
    where design_id = this_design
      and not is_cover
      and (sort_order, id) > (this_order, p_image_id)
    order by sort_order asc, id asc
    limit 1;
  end if;

  -- Already at the end: nothing to do, and not an error.
  if other_id is null then
    return;
  end if;

  -- Equal sort_order values are possible (they default to 0), so assign
  -- explicit distinct values rather than swapping identical ones.
  if this_order = other_order then
    if p_direction = -1 then
      update public.design_images set sort_order = other_order - 1 where id = p_image_id;
    else
      update public.design_images set sort_order = other_order + 1 where id = p_image_id;
    end if;
    return;
  end if;

  update public.design_images set sort_order = this_order  where id = other_id;
  update public.design_images set sort_order = other_order where id = p_image_id;
end;
$$;

revoke all on function public.move_design_image(uuid, integer) from public;
grant execute on function public.move_design_image(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Least privilege on admin_users
--
-- P3 granted `select` to `authenticated` so an admin can read their own record
-- and the policies can consult the table. It did not revoke the INSERT, UPDATE
-- and DELETE privileges Supabase grants to `authenticated` by default.
--
-- No policy allows any of those, so Row Level Security already refuses them:
-- an insert raises, and an update or delete silently matches no row. But an
-- attempt to grant oneself admin rights should be refused by the privilege
-- system as well as by a policy, so that a future migration adding a policy to
-- this table cannot accidentally open a door nobody meant to open.
--
-- Provisioning and disabling admins stays a service-role operation.
-- ---------------------------------------------------------------------------

revoke insert, update, delete on public.admin_users from anon, authenticated;
