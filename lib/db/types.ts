/**
 * Database types.
 *
 * Hand-maintained to mirror `supabase/migrations/`. Kept honest by
 * `tests/db/schema-types.test.ts`, which introspects the migrated database and
 * fails if a table or column here drifts from the real schema.
 *
 * (`supabase gen types` is the usual generator, but it requires a linked
 * Supabase project; the introspection test gives the same drift protection
 * without one and runs in CI.)
 */

export type PublicationStatus = 'draft' | 'published' | 'archived';
export type CatalogStatus = 'active' | 'inactive';
export type PricingMode = 'custom_quote' | 'starting_from';
export type DeliveryModel = 'in_house' | 'partner_vendor';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type VideoProvider = 'youtube' | 'instagram' | 'vimeo';

/** Requirements & SOW section 15 — the approved enquiry pipeline, in order. */
export const ENQUIRY_STATUSES = [
  'new',
  'contacted',
  'quotation_sent',
  'negotiation',
  'booked',
  'completed',
  'lost',
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type AdminUserRow = {
  user_id: string;
  email: string;
  role: 'admin';
  status: 'active' | 'disabled';
  created_at: string;
  updated_at: string;
};

export type OccasionRow = {
  id: string;
  name: string;
  secondary_term: string | null;
  slug: string;
  description: string | null;
  status: CatalogStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  delivery_model: DeliveryModel;
  status: CatalogStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type StyleRow = {
  id: string;
  name: string;
  slug: string;
  status: CatalogStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DesignRow = {
  id: string;
  name: string;
  slug: string;
  occasion_id: string | null;
  description: string | null;
  location: string | null;
  quote_mode: PricingMode;
  /** Paise (smallest currency unit); null unless quote_mode is 'starting_from'. */
  starting_price: number | null;
  featured: boolean;
  status: PublicationStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DesignImageRow = {
  id: string;
  design_id: string;
  storage_key: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  status: PublicationStatus;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
};

export type DesignVideoRow = {
  id: string;
  design_id: string;
  provider: VideoProvider;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DesignStyleRow = { design_id: string; style_id: string };
export type DesignServiceRow = { design_id: string; service_id: string };

export type PackageRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricing_mode: PricingMode;
  starting_price: number | null;
  status: PublicationStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TestimonialRow = {
  id: string;
  name: string;
  body: string;
  event_type: string | null;
  approval_status: ApprovalStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type EnquiryRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_type: string;
  event_date: string | null;
  venue: string | null;
  city: string;
  guest_count: number | null;
  budget: string | null;
  required_services: string[];
  notes: string | null;
  selected_design_id: string | null;
  /**
   * Optional context: the design_images row whose photo-level CTA started the
   * enquiry. Always belongs to selected_design_id, enforced by a trigger.
   */
  selected_image_id: string | null;
  status: EnquiryStatus;
  consent: boolean;
  internal_notes: string | null;
  confirmation_email_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReferenceImageRow = {
  id: string;
  enquiry_id: string;
  design_id: string | null;
  storage_key: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admin_users: Table<AdminUserRow>;
      occasions: Table<OccasionRow>;
      services: Table<ServiceRow>;
      styles: Table<StyleRow>;
      designs: Table<DesignRow>;
      design_styles: Table<DesignStyleRow>;
      design_services: Table<DesignServiceRow>;
      design_images: Table<DesignImageRow>;
      design_videos: Table<DesignVideoRow>;
      packages: Table<PackageRow>;
      testimonials: Table<TestimonialRow>;
      enquiries: Table<EnquiryRow>;
      reference_images: Table<ReferenceImageRow>;
    };
    Views: Record<never, never>;
    Functions: {
      is_active_admin: { Args: Record<never, never>; Returns: boolean };
      /**
       * P8 — atomic cover selection and image reordering. Both are SECURITY
       * INVOKER, so Row Level Security still decides what the caller may write.
       */
      set_design_cover: {
        Args: { p_design_id: string; p_image_id: string };
        Returns: undefined;
      };
      move_design_image: {
        Args: { p_image_id: string; p_direction: number };
        Returns: undefined;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
