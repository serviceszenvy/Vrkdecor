'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminContext } from '@/lib/auth/admin';
import {
  OCCASION_FIELDS,
  PACKAGE_FIELDS,
  SERVICE_FIELDS,
  STYLE_FIELDS,
  TESTIMONIAL_FIELDS,
  occasionSchema,
  packageSchema,
  parseAdminForm,
  serviceSchema,
  styleSchema,
  testimonialSchema,
} from '@/lib/validation/admin';
import {
  type AdminActionState,
  describeWriteFailure,
  failed,
  invalid,
  saved,
} from '../action-state';
import { readUuid, revalidatePublicContent, submittedValues } from './shared';

/**
 * Occasions, styles, services, packages and testimonials.
 *
 * All five are admin-managed page content that the public pages read, so every
 * action here refreshes those pages after a successful write. Each one runs
 * through `requireAdminContext()` and the caller's own session client, so the
 * `*_admin_all` policies apply to every statement in addition to the guard.
 *
 * Nothing in this module deletes a taxonomy row. `designs.occasion_id`,
 * `design_styles.style_id` and `design_services.service_id` are all ON DELETE
 * RESTRICT, so deleting a term that a design uses would fail anyway, and
 * deleting one that nothing uses yet still breaks any public URL that has been
 * shared. Switching a term to `inactive` hides it from the public site and from
 * new designs while leaving existing work intact, which is what an admin
 * actually wants. The forms therefore offer active/inactive, not delete.
 */

// ---------------------------------------------------------------------------
// Occasions
// ---------------------------------------------------------------------------

export async function saveOccasionAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();
  const values = submittedValues(formData, OCCASION_FIELDS);

  const parsed = parseAdminForm(occasionSchema, OCCASION_FIELDS, formData);
  if (!parsed.success) return invalid(parsed.errors, values);

  const input = parsed.data;
  const row = {
    name: input.name,
    secondary_term: input.secondaryTerm,
    slug: input.slug,
    description: input.description,
    status: input.status,
    sort_order: input.sortOrder,
  };

  const occasionId = readUuid(formData, 'occasionId');

  const { error } = occasionId
    ? await supabase.from('occasions').update(row).eq('id', occasionId)
    : await supabase.from('occasions').insert(row);

  if (error) return failed(describeWriteFailure(error, 'occasion'), values);

  revalidatePath('/admin/content');
  revalidatePublicContent();
  return saved('Occasion saved.');
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export async function saveStyleAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();
  const values = submittedValues(formData, STYLE_FIELDS);

  const parsed = parseAdminForm(styleSchema, STYLE_FIELDS, formData);
  if (!parsed.success) return invalid(parsed.errors, values);

  const input = parsed.data;
  const row = {
    name: input.name,
    slug: input.slug,
    status: input.status,
    sort_order: input.sortOrder,
  };

  const styleId = readUuid(formData, 'styleId');

  const { error } = styleId
    ? await supabase.from('styles').update(row).eq('id', styleId)
    : await supabase.from('styles').insert(row);

  if (error) return failed(describeWriteFailure(error, 'style'), values);

  revalidatePath('/admin/content');
  revalidatePublicContent();
  return saved('Style saved.');
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function saveServiceAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();
  const values = submittedValues(formData, SERVICE_FIELDS);

  const parsed = parseAdminForm(serviceSchema, SERVICE_FIELDS, formData);
  if (!parsed.success) return invalid(parsed.errors, values);

  const input = parsed.data;
  const row = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    // Requirements section 3 requires partner-vendor delivery to be represented
    // accurately on the public site, so this is an explicit choice, never a
    // default the admin can leave unconsidered.
    delivery_model: input.deliveryModel,
    status: input.status,
    sort_order: input.sortOrder,
  };

  const serviceId = readUuid(formData, 'serviceId');

  const { error } = serviceId
    ? await supabase.from('services').update(row).eq('id', serviceId)
    : await supabase.from('services').insert(row);

  if (error) return failed(describeWriteFailure(error, 'service'), values);

  revalidatePath('/admin/content');
  revalidatePublicContent();
  return saved('Service saved.');
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

export async function savePackageAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();
  const values = submittedValues(formData, PACKAGE_FIELDS);

  const parsed = parseAdminForm(packageSchema, PACKAGE_FIELDS, formData);
  if (!parsed.success) return invalid(parsed.errors, values);

  const input = parsed.data;
  const row = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    pricing_mode: input.pricingMode,
    starting_price: input.startingPrice,
    status: input.status,
    sort_order: input.sortOrder,
  };

  const packageId = readUuid(formData, 'packageId');

  const { error } = packageId
    ? await supabase.from('packages').update(row).eq('id', packageId)
    : await supabase.from('packages').insert(row);

  if (error) return failed(describeWriteFailure(error, 'package'), values);

  revalidatePath('/admin/packages');
  revalidatePath('/packages');
  revalidatePath('/');
  return saved('Package saved.');
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export async function saveTestimonialAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();
  const values = submittedValues(formData, TESTIMONIAL_FIELDS);

  const parsed = parseAdminForm(testimonialSchema, TESTIMONIAL_FIELDS, formData);
  if (!parsed.success) return invalid(parsed.errors, values);

  const input = parsed.data;
  const row = {
    name: input.name,
    body: input.body,
    event_type: input.eventType,
    // A testimonial is a real customer's words on a public page, so it reaches
    // the site only when someone has approved it. `pending` is the default in
    // the schema and nothing here can skip past it implicitly.
    approval_status: input.approvalStatus,
    display_order: input.displayOrder,
  };

  const testimonialId = readUuid(formData, 'testimonialId');

  const { error } = testimonialId
    ? await supabase.from('testimonials').update(row).eq('id', testimonialId)
    : await supabase.from('testimonials').insert(row);

  if (error) return failed(describeWriteFailure(error, 'testimonial'), values);

  revalidatePath('/admin/testimonials');
  revalidatePath('/');
  return saved('Testimonial saved.');
}

/**
 * Deletes a testimonial.
 *
 * The one deletion the Admin Panel offers, because a testimonial is the one
 * thing here that nothing else references and that a customer may ask to have
 * removed outright rather than merely hidden.
 */
export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminContext();

  const testimonialId = readUuid(formData, 'testimonialId');
  if (!testimonialId) return;

  await supabase.from('testimonials').delete().eq('id', testimonialId);

  revalidatePath('/admin/testimonials');
  revalidatePath('/');
}
