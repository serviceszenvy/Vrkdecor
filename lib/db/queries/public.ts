import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

/**
 * Read helpers for publicly visible content.
 *
 * These run through whichever Supabase client the caller passes, so Row Level
 * Security is what actually enforces visibility. The explicit `status` filters
 * below are defence in depth and intent-revealing, never the security boundary:
 * if a policy were removed, the filters would still be here, and the RLS tests
 * would fail loudly.
 *
 * Consumed by P4 (public pages) and P5 (portfolio).
 */

type Client = SupabaseClient<Database>;

export async function listPublishedDesigns(
  supabase: Client,
  options: { limit?: number; featuredFirst?: boolean } = {},
) {
  let query = supabase
    .from('designs')
    .select(
      'id, name, slug, occasion_id, location, quote_mode, starting_price, featured, published_at',
    )
    .eq('status', 'published');

  if (options.featuredFirst !== false) {
    query = query.order('featured', { ascending: false });
  }

  query = query.order('published_at', { ascending: false, nullsFirst: false });

  if (options.limit) query = query.limit(options.limit);

  return query;
}

/**
 * A single published design by slug.
 *
 * Returns nothing for a draft or archived design even when the slug is exact —
 * the policy, not this function, is what makes that true.
 */
export async function getPublishedDesignBySlug(supabase: Client, slug: string) {
  return supabase
    .from('designs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
}

/** Ordered gallery for a design; cover first, then sort_order. */
export async function listDesignImages(supabase: Client, designId: string) {
  return supabase
    .from('design_images')
    .select('id, storage_key, alt_text, sort_order, is_cover, width, height')
    .eq('design_id', designId)
    .eq('status', 'published')
    .order('is_cover', { ascending: false })
    .order('sort_order', { ascending: true });
}

export async function listDesignVideos(supabase: Client, designId: string) {
  return supabase
    .from('design_videos')
    .select('id, provider, url, caption, sort_order')
    .eq('design_id', designId)
    .order('sort_order', { ascending: true });
}

export async function listActiveOccasions(supabase: Client) {
  return supabase
    .from('occasions')
    .select('id, name, secondary_term, slug, description')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });
}

export async function listActiveServices(supabase: Client) {
  return supabase
    .from('services')
    .select('id, name, slug, description, delivery_model')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });
}

export async function listActiveStyles(supabase: Client) {
  return supabase
    .from('styles')
    .select('id, name, slug')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });
}

export async function listPublishedPackages(supabase: Client) {
  return supabase
    .from('packages')
    .select('id, name, slug, description, pricing_mode, starting_price')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
}

export async function listApprovedTestimonials(supabase: Client) {
  return supabase
    .from('testimonials')
    .select('id, name, body, event_type, display_order')
    .eq('approval_status', 'approved')
    .order('display_order', { ascending: true });
}

/**
 * Confirms a design exists and is publicly eligible before an enquiry is
 * accepted against it (Technical Development Specification section 9: "Server
 * verifies design existence/public eligibility"). Used by the quote engine in
 * P6 so a crafted design id cannot attach a lead to a draft or missing design.
 */
export async function isDesignQuotable(
  supabase: Client,
  designId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('designs')
    .select('id')
    .eq('id', designId)
    .eq('status', 'published')
    .maybeSingle();

  return !error && data !== null;
}
