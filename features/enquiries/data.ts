import 'server-only';

import { isSupabaseConfigured } from '@/lib/auth/supabase-anon';
import { createSupabaseServiceRoleClient } from '@/lib/auth/supabase-service';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { MAX_REFERENCE_IMAGES_PER_ENQUIRY } from '@/lib/storage';
import { referenceImagesSchema } from '@/lib/validation/enquiry';
import { isUsingLocalEnquiryStore, storeEnquiryLocally } from './store';
import type { CreateEnquiryInput, CreateEnquiryResult, EnquirySummary } from './types';

/**
 * Enquiry persistence.
 *
 * WRITES use the service-role client. That is a deliberate design decision
 * taken in P3 and unchanged here: there is no anonymous INSERT policy on
 * `enquiries` or `reference_images`, so a lead cannot be forged, enumerated or
 * altered from a browser. The server is the only writer, and it writes only
 * after `parseEnquiryForm` has validated the input and the throttle has passed.
 *
 * READS use the caller's own session, so Row Level Security decides: only an
 * active admin can see an enquiry. `listEnquiries` is the query the Admin Panel
 * (P8) builds its inbox on.
 *
 * NO EMAIL IS SENT FROM HERE, in either direction. VRK Decor is notified by the
 * Admin Panel, never by email (Requirements section 11, Master Implementation
 * Specification section 9). The customer's confirmation email is P7's, and it
 * is sent after this function has already returned — an email failure must
 * never cost a lead.
 */

/** Columns the Admin Panel lists. Never selects `internal_notes` in bulk. */
const SUMMARY_SELECT = `
  id, name, phone, email, event_type, event_date, venue, city,
  required_services, status, selected_design_id, selected_image_id, created_at,
  reference_images ( id )
`;

export async function createEnquiry(
  input: CreateEnquiryInput,
  fingerprint: string,
): Promise<CreateEnquiryResult> {
  const referenceImages = referenceImagesSchema.safeParse(input.referenceImages ?? []);

  if (!referenceImages.success) {
    // The caller validated these already; reaching here is a programming error,
    // not customer input, so it is reported without touching the database.
    console.error('[enquiries] Rejected reference images that failed validation.');
    return { status: 'failed' };
  }

  if (isUsingLocalEnquiryStore()) {
    const stored = storeEnquiryLocally(input, fingerprint);
    return {
      status: 'created',
      enquiryId: stored.id,
      referenceImageCount: stored.referenceImageCount,
      referenceImagesIncomplete: false,
    };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    // Only the columns below are ever written. `status` takes its database
    // default of 'new', and `internal_notes` and `confirmation_email_sent_at`
    // are never settable from a public request.
    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        name: input.name,
        phone: input.phone,
        email: input.email,
        event_type: input.eventType,
        event_date: input.eventDate,
        venue: input.venue,
        city: input.city,
        guest_count: input.guestCount,
        budget: input.budget,
        required_services: input.requiredServices,
        notes: input.notes,
        selected_design_id: input.designId,
        selected_image_id: input.imageId,
        consent: input.consent,
      })
      .select('id')
      .single();

    if (error || !data) {
      // Never log the error object: it can carry connection details and the
      // customer's own submitted values.
      console.error('[enquiries] Could not store an enquiry.');
      return { status: 'failed' };
    }

    const linked = await linkReferenceImages(
      supabase,
      data.id,
      input.designId,
      referenceImages.data,
    );

    return {
      status: 'created',
      enquiryId: data.id,
      referenceImageCount: linked,
      referenceImagesIncomplete: linked < referenceImages.data.length,
    };
  } catch {
    console.error('[enquiries] Could not store an enquiry.');
    return { status: 'failed' };
  }
}

/**
 * Links already-stored private reference images to an enquiry.
 *
 * P6 owns this relationship; P7 owns putting the files in the private bucket
 * and calling in with their keys. The ceiling of three is applied here as well
 * as by the database trigger, because a limit worth having is worth enforcing
 * on both sides.
 *
 * A failure here is logged and reported, never thrown: the enquiry is already
 * stored and reaching the Admin Panel, and losing a lead over an image link
 * would be the worse outcome by far.
 */
async function linkReferenceImages(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  enquiryId: string,
  designId: string | null,
  images: {
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
  }[],
): Promise<number> {
  if (images.length === 0) return 0;

  const capped = images.slice(0, MAX_REFERENCE_IMAGES_PER_ENQUIRY);

  const { data, error } = await supabase
    .from('reference_images')
    .insert(
      capped.map((image) => ({
        enquiry_id: enquiryId,
        design_id: designId,
        storage_key: image.storageKey,
        original_filename: image.originalFilename,
        mime_type: image.mimeType,
        size_bytes: image.sizeBytes,
      })),
    )
    .select('id');

  if (error || !data) {
    console.error('[enquiries] Enquiry stored, but reference images were not linked.');
    return 0;
  }

  return data.length;
}

function toSummary(row: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_type: string;
  event_date: string | null;
  venue: string | null;
  city: string;
  required_services: string[];
  status: string;
  selected_design_id: string | null;
  selected_image_id: string | null;
  created_at: string;
  reference_images?: { id: string }[] | null;
}): EnquirySummary {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    eventType: row.event_type,
    eventDate: row.event_date,
    venue: row.venue,
    city: row.city,
    requiredServices: row.required_services ?? [],
    status: row.status,
    designId: row.selected_design_id,
    imageId: row.selected_image_id,
    referenceImageCount: row.reference_images?.length ?? 0,
    createdAt: row.created_at,
  };
}

/**
 * The Admin Panel's enquiry inbox (P8 renders it).
 *
 * Runs as the signed-in user, so Row Level Security answers the authorization
 * question: an anonymous or non-admin caller reads nothing at all, and there is
 * no parameter that could widen that. Callers must still call `requireAdmin()`
 * before rendering — neither check is sufficient alone.
 */
export async function listEnquiries(limit = 50): Promise<EnquirySummary[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('enquiries')
      .select(SUMMARY_SELECT)
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 200));

    if (error || !data) {
      console.error('[enquiries] Could not read the enquiry inbox.');
      return [];
    }

    return (data as unknown as Parameters<typeof toSummary>[0][]).map(toSummary);
  } catch {
    console.error('[enquiries] Could not read the enquiry inbox.');
    return [];
  }
}
