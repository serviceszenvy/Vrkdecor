'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminContext } from '@/lib/auth/admin';
import { removeReferenceObjectsAs } from '@/lib/storage/urls';
import {
  ENQUIRY_UPDATE_FIELDS,
  enquiryUpdateSchema,
  parseAdminForm,
} from '@/lib/validation/admin';
import {
  type AdminActionState,
  describeWriteFailure,
  failed,
  invalid,
  saved,
} from '../action-state';
import { readUuid, submittedValues } from './shared';

/**
 * The enquiry pipeline and internal notes.
 *
 * Requirements & SOW section 14 makes the Admin Panel the internal enquiry
 * inbox, and section 15 fixes the pipeline. Two properties matter here:
 *
 *   - **an enquiry is never created or edited beyond these two fields.** The
 *     customer's own details are what they submitted, and an inbox that let an
 *     admin rewrite a lead's phone number or event date would make the record
 *     untrustworthy. Only `status` and `internal_notes` are writable, and the
 *     update names exactly those columns.
 *   - **the pipeline is a closed vocabulary**, validated against
 *     `ENQUIRY_STATUSES` before it reaches the database, which carries the same
 *     list as a CHECK constraint.
 *
 * Nothing here emails anybody. VRK Decor is not notified by email at any point,
 * and the customer's confirmation was sent once, by the quote flow, when the
 * enquiry was created (P7). Follow-up is by phone and WhatsApp, which the
 * detail page offers as links.
 */

export async function updateEnquiryAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdminContext();
  const values = submittedValues(formData, ENQUIRY_UPDATE_FIELDS);

  const enquiryId = readUuid(formData, 'enquiryId');
  if (!enquiryId) return failed('That enquiry could not be found.', values);

  const parsed = parseAdminForm(enquiryUpdateSchema, ENQUIRY_UPDATE_FIELDS, formData);
  if (!parsed.success) return invalid(parsed.errors, values);

  const { data, error } = await supabase
    .from('enquiries')
    .update({
      status: parsed.data.status,
      internal_notes: parsed.data.internalNotes,
    })
    .eq('id', enquiryId)
    .select('id')
    .maybeSingle();

  if (error) return failed(describeWriteFailure(error, 'enquiry'), values);
  // Missing and forbidden are answered identically: an admin whose account has
  // been disabled mid-session learns nothing about which enquiries exist.
  if (!data) return failed('That enquiry could not be found.', values);

  revalidatePath('/admin/enquiries');
  revalidatePath(`/admin/enquiries/${enquiryId}`);

  return saved('Enquiry updated.');
}

/**
 * Deletes one private reference image from an enquiry.
 *
 * Offered because these are a customer's own photographs and a customer may ask
 * for them to be removed. The row goes first so the Admin Panel is immediately
 * correct, then the private object; a stray object costs storage, whereas a row
 * pointing at a deleted object would be a broken image in the inbox.
 */
export async function deleteReferenceImageAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminContext();

  const enquiryId = readUuid(formData, 'enquiryId');
  const imageId = readUuid(formData, 'imageId');
  if (!enquiryId || !imageId) return;

  const { data, error } = await supabase
    .from('reference_images')
    .delete()
    .eq('id', imageId)
    .eq('enquiry_id', enquiryId)
    .select('storage_key')
    .maybeSingle();

  if (!error && data) {
    await removeReferenceObjectsAs(supabase, [data.storage_key]);
  }

  revalidatePath(`/admin/enquiries/${enquiryId}`);
}
