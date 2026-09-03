'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminContext } from '@/lib/auth/admin';
import { DESIGN_FIELDS, designSchema, parseAdminForm } from '@/lib/validation/admin';
import type { PublicationStatus } from '@/lib/db/types';
import {
  type AdminActionState,
  describeWriteFailure,
  failed,
  invalid,
  saved,
} from '../action-state';
import { readUuid, revalidatePublicPortfolio, submittedValues } from './shared';

/**
 * Design create, update and publication.
 *
 * Every action begins with `requireAdminContext()`, which redirects an
 * unauthorized caller and hands back the SESSION client. Nothing here ever
 * touches the service role, so `designs_admin_all` is applied by the database
 * to every statement in addition to the guard. Two independent checks, both of
 * which must pass.
 *
 * Only the columns the form owns are ever written. `published_at` is set by the
 * publish action alone, and `created_at`, `updated_at` and `id` are the
 * database's.
 */

const DESIGN_ARRAY_FIELDS = ['styleIds', 'serviceIds'];

/** Style and service selections, replaced wholesale rather than diffed. */
async function replaceClassification(
  supabase: Awaited<ReturnType<typeof requireAdminContext>>['supabase'],
  designId: string,
  styleIds: string[],
  serviceIds: string[],
) {
  await supabase.from('design_styles').delete().eq('design_id', designId);
  await supabase.from('design_services').delete().eq('design_id', designId);

  if (styleIds.length > 0) {
    await supabase
      .from('design_styles')
      .insert(styleIds.map((styleId) => ({ design_id: designId, style_id: styleId })));
  }

  if (serviceIds.length > 0) {
    await supabase.from('design_services').insert(
      serviceIds.map((serviceId) => ({
        design_id: designId,
        service_id: serviceId,
      })),
    );
  }
}

export async function createDesignAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();
  const values = submittedValues(formData, DESIGN_FIELDS, DESIGN_ARRAY_FIELDS);

  const parsed = parseAdminForm(
    designSchema,
    DESIGN_FIELDS,
    formData,
    DESIGN_ARRAY_FIELDS,
  );
  if (!parsed.success) return invalid(parsed.errors, values);

  const input = parsed.data;

  const { data, error } = await supabase
    .from('designs')
    .insert({
      name: input.name,
      slug: input.slug,
      occasion_id: input.occasionId,
      description: input.description,
      location: input.location,
      quote_mode: input.pricingMode,
      starting_price: input.startingPrice,
      featured: input.featured,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
      // A new design always starts as a draft. Publishing is a separate,
      // deliberate action with its own precondition.
      status: 'draft' as PublicationStatus,
    })
    .select('id')
    .single();

  if (error || !data) {
    return failed(describeWriteFailure(error, 'design'), values);
  }

  await replaceClassification(supabase, data.id, input.styleIds, input.serviceIds);

  revalidatePath('/admin/designs');
  redirect(`/admin/designs/${data.id}?created=1`);
}

export async function updateDesignAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();
  const values = submittedValues(formData, DESIGN_FIELDS, DESIGN_ARRAY_FIELDS);

  const designId = readUuid(formData, 'designId');
  if (!designId) return failed('That design could not be found.', values);

  const parsed = parseAdminForm(
    designSchema,
    DESIGN_FIELDS,
    formData,
    DESIGN_ARRAY_FIELDS,
  );
  if (!parsed.success) return invalid(parsed.errors, values);

  const input = parsed.data;

  const { data, error } = await supabase
    .from('designs')
    .update({
      name: input.name,
      slug: input.slug,
      occasion_id: input.occasionId,
      description: input.description,
      location: input.location,
      quote_mode: input.pricingMode,
      starting_price: input.startingPrice,
      featured: input.featured,
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
    })
    .eq('id', designId)
    .select('id, slug, status')
    .maybeSingle();

  if (error) return failed(describeWriteFailure(error, 'design'), values);
  // No row came back: either it does not exist, or the policy refused it. The
  // two are answered identically on purpose.
  if (!data) return failed('That design could not be found.', values);

  await replaceClassification(supabase, designId, input.styleIds, input.serviceIds);

  revalidatePath(`/admin/designs/${designId}`);
  revalidatePublicPortfolio(data.slug);

  return saved('Design saved.');
}

/**
 * Publish, unpublish or archive.
 *
 * A design cannot be published without a cover image. Requirements & SOW
 * section 9 makes the cover the image every listing and card uses, and P5 built
 * the public portfolio on that promise, so publishing without one would put a
 * broken card on the live site. It is refused here with a sentence rather than
 * discovered later by a visitor.
 */
export async function setDesignStatusAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminContext();

  const designId = readUuid(formData, 'designId');
  const requested = formData.get('status');

  if (!designId || typeof requested !== 'string') return;
  if (!['draft', 'published', 'archived'].includes(requested)) return;

  const status = requested as PublicationStatus;

  if (status === 'published') {
    const { count } = await supabase
      .from('design_images')
      .select('id', { count: 'exact', head: true })
      .eq('design_id', designId)
      .eq('is_cover', true)
      .eq('status', 'published');

    if (!count) {
      redirect(`/admin/designs/${designId}?error=cover-required`);
    }
  }

  const { data, error } = await supabase
    .from('designs')
    .update({
      status,
      // Stamped the first time a design goes live and kept thereafter, so the
      // public "newest first" ordering does not jump when a design is edited.
      ...(status === 'published' ? { published_at: new Date().toISOString() } : {}),
    })
    .eq('id', designId)
    .select('slug')
    .maybeSingle();

  if (error || !data) {
    redirect(`/admin/designs/${designId}?error=status`);
  }

  revalidatePath(`/admin/designs/${designId}`);
  revalidatePath('/admin/designs');
  revalidatePublicPortfolio(data.slug);

  redirect(`/admin/designs/${designId}?status=${status}`);
}
