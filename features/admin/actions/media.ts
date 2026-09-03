'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminContext } from '@/lib/auth/admin';
import {
  removePortfolioObjects,
  uploadPortfolioImages,
} from '@/lib/storage/portfolio-upload';
import { validatePortfolioImageUploads } from '@/lib/uploads';
import {
  ALT_TEXT_MAX,
  VIDEO_FIELDS,
  altTextSchema,
  parseAdminForm,
  videoSchema,
} from '@/lib/validation/admin';
import { readUuid, revalidatePublicPortfolio, submittedValues } from './shared';
import {
  type AdminActionState,
  describeWriteFailure,
  failed,
  invalid,
  saved,
} from '../action-state';

/**
 * Design media: uploading, ordering, cover selection, alt text and videos.
 *
 * Uploads follow the same order the quote form established in P7, for the same
 * reason: the FILES are validated before anything is written, the parent row is
 * confirmed to exist and to be writable by this admin, then the objects go to
 * storage, then the rows are recorded. An object that cannot be recorded is
 * deleted rather than left orphaned in the bucket.
 *
 * Nothing here uses the service role. The upload runs through the admin's own
 * session client, so the `admins manage portfolio objects` storage policy has
 * to agree as well as `requireAdmin()`.
 */

/** Confirms the design exists AND is writable by this caller. */
async function assertDesignWritable(
  supabase: Awaited<ReturnType<typeof requireAdminContext>>['supabase'],
  designId: string,
): Promise<{ id: string; slug: string } | null> {
  const { data } = await supabase
    .from('designs')
    .select('id, slug')
    .eq('id', designId)
    .maybeSingle();
  return (data as { id: string; slug: string } | null) ?? null;
}

export async function uploadDesignImagesAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();

  const designId = readUuid(formData, 'designId');
  if (!designId) return failed('That design could not be found.');

  const asCover = formData.get('asCover') === 'on';

  // Files first. A rejected file must never leave a half-written design behind,
  // and the admin is told which rule it broke.
  const uploads = await validatePortfolioImageUploads(formData, 'images', {
    expectSingle: asCover,
  });
  if (!uploads.success) return failed(uploads.message);
  if (uploads.images.length === 0) return failed('Please choose at least one image.');

  const design = await assertDesignWritable(supabase, designId);
  if (!design) return failed('That design could not be found.');

  const upload = await uploadPortfolioImages(supabase, designId, uploads.images);
  if (upload.stored.length === 0) {
    return failed('The images could not be uploaded. Please try again.');
  }

  // Where the new images sit in the gallery. Appended after whatever is there,
  // so an upload never reshuffles an order the admin has already set.
  const { data: last } = await supabase
    .from('design_images')
    .select('sort_order')
    .eq('design_id', designId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const startOrder = (last?.sort_order ?? 0) + 1;

  const { data: inserted, error } = await supabase
    .from('design_images')
    .insert(
      upload.stored.map((object, index) => ({
        design_id: designId,
        storage_key: object.storageKey,
        alt_text: null,
        sort_order: startOrder + index,
        width: object.width,
        height: object.height,
        status: 'published' as const,
      })),
    )
    .select('id');

  if (error || !inserted) {
    // The rows did not land, so the objects have nothing pointing at them.
    await removePortfolioObjects(
      supabase,
      upload.stored.map((object) => object.storageKey),
    );
    return failed(describeWriteFailure(error, 'image'));
  }

  if (asCover && inserted[0]) {
    await supabase.rpc('set_design_cover', {
      p_design_id: designId,
      p_image_id: inserted[0].id,
    });
  }

  revalidatePath(`/admin/designs/${designId}`);
  revalidatePublicPortfolio(design.slug);

  const partial = upload.incomplete
    ? ' Some images could not be uploaded, please try those again.'
    : '';

  return saved(
    `${inserted.length} image${inserted.length === 1 ? '' : 's'} uploaded.${partial}`,
  );
}

export async function setCoverImageAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminContext();

  const designId = readUuid(formData, 'designId');
  const imageId = readUuid(formData, 'imageId');
  if (!designId || !imageId) return;

  // One transaction in the database: the old cover is cleared and the new one
  // set together, so a Design is never left with two covers or none.
  const { error } = await supabase.rpc('set_design_cover', {
    p_design_id: designId,
    p_image_id: imageId,
  });

  const design = await assertDesignWritable(supabase, designId);
  revalidatePath(`/admin/designs/${designId}`);
  revalidatePublicPortfolio(design?.slug);

  redirect(`/admin/designs/${designId}?${error ? 'error=cover' : 'saved=cover'}`);
}

export async function moveDesignImageAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminContext();

  const designId = readUuid(formData, 'designId');
  const imageId = readUuid(formData, 'imageId');
  const direction = formData.get('direction') === 'up' ? -1 : 1;
  if (!designId || !imageId) return;

  const { error } = await supabase.rpc('move_design_image', {
    p_image_id: imageId,
    p_direction: direction,
  });

  const design = await assertDesignWritable(supabase, designId);
  revalidatePath(`/admin/designs/${designId}`);
  revalidatePublicPortfolio(design?.slug);

  redirect(`/admin/designs/${designId}?${error ? 'error=order' : 'saved=order'}`);
}

export async function updateAltTextAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();

  const designId = readUuid(formData, 'designId');
  const imageId = readUuid(formData, 'imageId');
  if (!designId || !imageId) return failed('That image could not be found.');

  const rawAlt = formData.get('altText');
  const parsed = altTextSchema.safeParse({
    imageId,
    altText: typeof rawAlt === 'string' ? rawAlt : '',
  });

  if (!parsed.success) {
    return invalid({
      altText: `Please keep the description to ${ALT_TEXT_MAX} characters or fewer.`,
    });
  }

  const { data, error } = await supabase
    .from('design_images')
    .update({ alt_text: parsed.data.altText })
    .eq('id', imageId)
    .eq('design_id', designId)
    .select('id')
    .maybeSingle();

  if (error || !data) return failed(describeWriteFailure(error, 'image'));

  const design = await assertDesignWritable(supabase, designId);
  revalidatePath(`/admin/designs/${designId}`);
  revalidatePublicPortfolio(design?.slug);

  return saved('Description saved.');
}

/**
 * Deletes one image, row first and then its object.
 *
 * That order matters: if the object delete fails, the gallery is already
 * correct and a stray file costs storage. The other order would leave a row
 * pointing at nothing, which is a broken image on the public site.
 */
export async function deleteDesignImageAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminContext();

  const designId = readUuid(formData, 'designId');
  const imageId = readUuid(formData, 'imageId');
  if (!designId || !imageId) return;

  const { data, error } = await supabase
    .from('design_images')
    .delete()
    .eq('id', imageId)
    .eq('design_id', designId)
    .select('storage_key')
    .maybeSingle();

  if (!error && data) {
    await removePortfolioObjects(supabase, [data.storage_key]);
  }

  const design = await assertDesignWritable(supabase, designId);
  revalidatePath(`/admin/designs/${designId}`);
  revalidatePublicPortfolio(design?.slug);

  redirect(`/admin/designs/${designId}?${error ? 'error=delete' : 'saved=delete'}`);
}

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

export async function addDesignVideoAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();

  const designId = readUuid(formData, 'designId');
  if (!designId) return failed('That design could not be found.');

  const values = submittedValues(formData, VIDEO_FIELDS);
  const parsed = parseAdminForm(videoSchema, VIDEO_FIELDS, formData);
  if (!parsed.success) return invalid(parsed.errors, values);

  const { error } = await supabase.from('design_videos').insert({
    design_id: designId,
    provider: parsed.data.provider,
    url: parsed.data.url,
    caption: parsed.data.caption,
    sort_order: parsed.data.sortOrder,
  });

  if (error) return failed(describeWriteFailure(error, 'video'), values);

  const design = await assertDesignWritable(supabase, designId);
  revalidatePath(`/admin/designs/${designId}`);
  revalidatePublicPortfolio(design?.slug);

  return saved('Video added.');
}

export async function deleteDesignVideoAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminContext();

  const designId = readUuid(formData, 'designId');
  const videoId = readUuid(formData, 'videoId');
  if (!designId || !videoId) return;

  await supabase
    .from('design_videos')
    .delete()
    .eq('id', videoId)
    .eq('design_id', designId);

  const design = await assertDesignWritable(supabase, designId);
  revalidatePath(`/admin/designs/${designId}`);
  revalidatePublicPortfolio(design?.slug);

  redirect(`/admin/designs/${designId}?saved=video`);
}
