import {
  createSupabaseAnonClient,
  isSupabaseConfigured,
} from '@/lib/auth/supabase-anon';
import {
  occasions as approvedOccasions,
  services as approvedServices,
} from '@/lib/content';
import { withTimeout } from './with-timeout';
import {
  listActiveOccasions,
  listActiveServices,
  listApprovedTestimonials,
  listPublishedDesigns,
  listPublishedPackages,
} from './queries/public';

/**
 * Page-level content readers.
 *
 * Public pages must render whether or not Supabase is reachable:
 *
 *   - before the database exists (it is not yet provisioned),
 *   - during a deployment where credentials are missing,
 *   - if Supabase is briefly unavailable in production.
 *
 * Each reader therefore returns approved fallback content or an empty list
 * rather than throwing. A failure is logged server-side with no query detail or
 * credential, and the visitor sees a working page instead of an error.
 *
 * Nothing here weakens Row Level Security: every query runs as `anon`, so only
 * intentionally public content can ever be returned.
 */

function reportFailure(what: string) {
  // Message only — never the error object, which can carry connection details.
  console.error(`[public-content] Could not load ${what}; using fallback content.`);
}

async function safely<T>(what: string, run: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    // Bounded so an unreachable database degrades to fallback content instead
    // of holding the page render open.
    return await withTimeout(run, undefined, what);
  } catch {
    reportFailure(what);
    return fallback;
  }
}

export type OccasionListItem = {
  name: string;
  secondaryTerm: string | null;
  slug: string;
  description: string | null;
};

export type ServiceListItem = {
  name: string;
  slug: string;
  description: string | null;
  deliveryModel: 'in_house' | 'partner_vendor';
};

const fallbackOccasions: OccasionListItem[] = approvedOccasions.map((occasion) => ({
  name: occasion.name,
  secondaryTerm: occasion.secondaryTerm,
  slug: occasion.slug,
  description: null,
}));

const fallbackServices: ServiceListItem[] = approvedServices.map((service) => ({
  name: service.name,
  slug: service.slug,
  description: null,
  deliveryModel: service.deliveryModel,
}));

export async function getOccasions(): Promise<OccasionListItem[]> {
  return safely(
    'occasions',
    async () => {
      const { data, error } = await listActiveOccasions(createSupabaseAnonClient());
      if (error || !data || data.length === 0) return fallbackOccasions;

      return data.map((row) => ({
        name: row.name,
        secondaryTerm: row.secondary_term,
        slug: row.slug,
        description: row.description,
      }));
    },
    fallbackOccasions,
  );
}

export async function getServices(): Promise<ServiceListItem[]> {
  return safely(
    'services',
    async () => {
      const { data, error } = await listActiveServices(createSupabaseAnonClient());
      if (error || !data || data.length === 0) return fallbackServices;

      return data.map((row) => ({
        name: row.name,
        slug: row.slug,
        description: row.description,
        deliveryModel: row.delivery_model,
      }));
    },
    fallbackServices,
  );
}

export type PackageListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricingMode: 'custom_quote' | 'starting_from';
  /** Paise. Only ever set when pricingMode is 'starting_from'. */
  startingPrice: number | null;
};

/**
 * Packages are entirely admin-managed content with no approved fallback list,
 * so an empty result is a legitimate state the page renders honestly.
 */
export async function getPackages(): Promise<PackageListItem[]> {
  return safely(
    'packages',
    async () => {
      const { data, error } = await listPublishedPackages(createSupabaseAnonClient());
      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        pricingMode: row.pricing_mode,
        startingPrice: row.starting_price,
      }));
    },
    [],
  );
}

export type TestimonialItem = {
  id: string;
  name: string;
  body: string;
  eventType: string | null;
};

export async function getTestimonials(): Promise<TestimonialItem[]> {
  return safely(
    'testimonials',
    async () => {
      const { data, error } = await listApprovedTestimonials(
        createSupabaseAnonClient(),
      );
      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        body: row.body,
        eventType: row.event_type,
      }));
    },
    [],
  );
}

export type DesignListItem = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  featured: boolean;
};

/**
 * Published designs for the Home page and the Our Work listing.
 * The portfolio grid, filters, detail pages and lightbox are implemented in P5;
 * this reader exists so those surfaces have real data the moment designs are
 * published.
 */
export async function getPublishedDesigns(limit?: number): Promise<DesignListItem[]> {
  return safely(
    'designs',
    async () => {
      const { data, error } = await listPublishedDesigns(createSupabaseAnonClient(), {
        ...(limit === undefined ? {} : { limit }),
      });
      if (error || !data) return [];

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        location: row.location,
        featured: row.featured,
      }));
    },
    [],
  );
}
