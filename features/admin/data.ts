import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  DesignImageRow,
  EnquiryStatus,
  PublicationStatus,
  DesignRow,
  DesignVideoRow,
  Database,
  EnquiryRow,
  OccasionRow,
  PackageRow,
  ReferenceImageRow,
  ServiceRow,
  StyleRow,
} from '@/lib/db/types';
import type { TestimonialRow } from '@/lib/db/types';

/**
 * Admin reads.
 *
 * Every function here takes the caller's SESSION client, never the service
 * role. Row Level Security is therefore the thing that answers "may this person
 * see this row", not a filter written in TypeScript:
 *
 *   - an anonymous caller has no privilege on `enquiries`, `reference_images`
 *     or `admin_users` at all
 *   - a signed-in non-admin passes every policy predicate as false and reads
 *     nothing
 *   - a disabled admin is not an active admin, so the same is true the moment
 *     their record is disabled
 *
 * The callers additionally run `requireAdmin()` first. Neither check is
 * sufficient alone, and the tests prove both independently.
 *
 * Unlike the public readers in `lib/db/public-content.ts`, these do NOT fall
 * back to placeholder content when something goes wrong. An admin looking at an
 * enquiry inbox has to be able to trust that an empty list means no enquiries,
 * so a failure is surfaced as a failure.
 */

type Client = SupabaseClient<Database>;

export type AdminDesignListItem = Pick<
  DesignRow,
  'id' | 'name' | 'slug' | 'status' | 'featured' | 'location' | 'updated_at'
> & {
  occasionName: string | null;
  imageCount: number;
  hasCover: boolean;
};

export type AdminDesignDetail = {
  design: DesignRow;
  images: DesignImageRow[];
  videos: DesignVideoRow[];
  styleIds: string[];
  serviceIds: string[];
};

export type AdminEnquiryListItem = Pick<
  EnquiryRow,
  | 'id'
  | 'name'
  | 'phone'
  | 'email'
  | 'event_type'
  | 'event_date'
  | 'city'
  | 'status'
  | 'created_at'
  | 'confirmation_email_sent_at'
> & { designName: string | null; referenceImageCount: number };

export type AdminEnquiryDetail = {
  enquiry: EnquiryRow;
  design: Pick<DesignRow, 'id' | 'name' | 'slug' | 'status'> | null;
  referenceImages: ReferenceImageRow[];
};

function fail(what: string) {
  // Message only, never the error object: it can carry connection detail and,
  // on the enquiry tables, the customer's own values.
  console.error(`[admin] Could not read ${what}.`);
}

// ---------------------------------------------------------------------------
// Designs
// ---------------------------------------------------------------------------

export async function listAdminDesigns(
  supabase: Client,
  options: { status?: PublicationStatus } = {},
): Promise<AdminDesignListItem[]> {
  let query = supabase
    .from('designs')
    .select(
      `id, name, slug, status, featured, location, updated_at, occasion_id,
       occasions ( name ),
       design_images ( id, is_cover )`,
    )
    .order('updated_at', { ascending: false })
    .limit(500);

  if (options.status) query = query.eq('status', options.status);

  const { data, error } = await query;
  if (error || !data) {
    fail('the design list');
    return [];
  }

  type Row = AdminDesignListItem & {
    occasions: { name: string } | { name: string }[] | null;
    design_images: { id: string; is_cover: boolean }[] | null;
  };

  return (data as unknown as Row[]).map((row) => {
    const occasion = Array.isArray(row.occasions) ? row.occasions[0] : row.occasions;
    const images = row.design_images ?? [];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status,
      featured: row.featured,
      location: row.location,
      updated_at: row.updated_at,
      occasionName: occasion?.name ?? null,
      imageCount: images.length,
      hasCover: images.some((image) => image.is_cover),
    };
  });
}

export async function getAdminDesign(
  supabase: Client,
  designId: string,
): Promise<AdminDesignDetail | null> {
  const { data: design, error } = await supabase
    .from('designs')
    .select('*')
    .eq('id', designId)
    .maybeSingle();

  if (error) {
    fail('a design');
    return null;
  }
  // Null covers both "does not exist" and "not visible to you". An admin who is
  // no longer active sees the same thing as a stranger, which is the point.
  if (!design) return null;

  const [images, videos, styles, services] = await Promise.all([
    supabase
      .from('design_images')
      .select('*')
      .eq('design_id', designId)
      .order('is_cover', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
    supabase
      .from('design_videos')
      .select('*')
      .eq('design_id', designId)
      .order('sort_order', { ascending: true }),
    supabase.from('design_styles').select('style_id').eq('design_id', designId),
    supabase.from('design_services').select('service_id').eq('design_id', designId),
  ]);

  return {
    design: design as DesignRow,
    images: (images.data ?? []) as DesignImageRow[],
    videos: (videos.data ?? []) as DesignVideoRow[],
    styleIds: (styles.data ?? []).map((row) => row.style_id),
    serviceIds: (services.data ?? []).map((row) => row.service_id),
  };
}

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

/**
 * Reference data, INCLUDING inactive rows.
 *
 * The public readers filter to `status = 'active'`; an admin managing the
 * vocabulary has to see what they have switched off, which the
 * `*_admin_all` policies allow and the public policies do not.
 */
export async function listAllOccasions(supabase: Client): Promise<OccasionRow[]> {
  const { data, error } = await supabase
    .from('occasions')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error || !data) {
    fail('occasions');
    return [];
  }
  return data as OccasionRow[];
}

export async function listAllStyles(supabase: Client): Promise<StyleRow[]> {
  const { data, error } = await supabase
    .from('styles')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error || !data) {
    fail('styles');
    return [];
  }
  return data as StyleRow[];
}

export async function listAllServices(supabase: Client): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error || !data) {
    fail('services');
    return [];
  }
  return data as ServiceRow[];
}

// ---------------------------------------------------------------------------
// Packages and testimonials
// ---------------------------------------------------------------------------

export async function listAllPackages(supabase: Client): Promise<PackageRow[]> {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error || !data) {
    fail('packages');
    return [];
  }
  return data as PackageRow[];
}

export async function getAdminPackage(
  supabase: Client,
  packageId: string,
): Promise<PackageRow | null> {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .maybeSingle();
  if (error || !data) return null;
  return data as PackageRow;
}

export async function listAllTestimonials(supabase: Client): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error || !data) {
    fail('testimonials');
    return [];
  }
  return data as TestimonialRow[];
}

export async function getAdminTestimonial(
  supabase: Client,
  testimonialId: string,
): Promise<TestimonialRow | null> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', testimonialId)
    .maybeSingle();
  if (error || !data) return null;
  return data as TestimonialRow;
}

// ---------------------------------------------------------------------------
// Enquiries
// ---------------------------------------------------------------------------

export async function listAdminEnquiries(
  supabase: Client,
  options: { status?: EnquiryStatus; limit?: number } = {},
): Promise<AdminEnquiryListItem[]> {
  let query = supabase
    .from('enquiries')
    .select(
      `id, name, phone, email, event_type, event_date, city, status, created_at,
       confirmation_email_sent_at,
       designs ( name ),
       reference_images ( id )`,
    )
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(options.limit ?? 100, 1), 500));

  if (options.status) query = query.eq('status', options.status);

  const { data, error } = await query;
  if (error || !data) {
    fail('the enquiry inbox');
    return [];
  }

  type Row = AdminEnquiryListItem & {
    designs: { name: string } | { name: string }[] | null;
    reference_images: { id: string }[] | null;
  };

  return (data as unknown as Row[]).map((row) => {
    const design = Array.isArray(row.designs) ? row.designs[0] : row.designs;
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      event_type: row.event_type,
      event_date: row.event_date,
      city: row.city,
      status: row.status,
      created_at: row.created_at,
      confirmation_email_sent_at: row.confirmation_email_sent_at,
      designName: design?.name ?? null,
      referenceImageCount: (row.reference_images ?? []).length,
    };
  });
}

export async function getAdminEnquiry(
  supabase: Client,
  enquiryId: string,
): Promise<AdminEnquiryDetail | null> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('id', enquiryId)
    .maybeSingle();

  if (error) {
    fail('an enquiry');
    return null;
  }
  if (!data) return null;

  const enquiry = data as EnquiryRow;

  const [design, references] = await Promise.all([
    enquiry.selected_design_id
      ? supabase
          .from('designs')
          .select('id, name, slug, status')
          .eq('id', enquiry.selected_design_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from('reference_images')
      .select('*')
      .eq('enquiry_id', enquiryId)
      .order('created_at', { ascending: true }),
  ]);

  return {
    enquiry,
    design: (design.data as AdminEnquiryDetail['design']) ?? null,
    referenceImages: (references.data ?? []) as ReferenceImageRow[],
  };
}

/** Counts for the dashboard. Each one is an RLS-scoped count, not an estimate. */
export async function getAdminDashboardCounts(supabase: Client) {
  const count = async (
    table: 'designs' | 'enquiries' | 'packages' | 'testimonials',
    column?: string,
    value?: string,
  ) => {
    let query = supabase.from(table).select('id', { count: 'exact', head: true });
    if (column && value) query = query.eq(column as never, value as never);
    const { count: total, error } = await query;
    if (error) {
      fail(`a ${table} count`);
      return 0;
    }
    return total ?? 0;
  };

  const [designs, published, drafts, newEnquiries, enquiries, packages, testimonials] =
    await Promise.all([
      count('designs'),
      count('designs', 'status', 'published'),
      count('designs', 'status', 'draft'),
      count('enquiries', 'status', 'new'),
      count('enquiries'),
      count('packages'),
      count('testimonials', 'approval_status', 'pending'),
    ]);

  return {
    designs,
    published,
    drafts,
    newEnquiries,
    enquiries,
    packages,
    pendingTestimonials: testimonials,
  };
}
