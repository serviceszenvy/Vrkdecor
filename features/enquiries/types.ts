import type { ValidatedReferenceImage } from '@/lib/uploads';
import type { EnquiryInput } from '@/lib/validation/enquiry';

/**
 * Enquiry view models and service types.
 *
 * The shape that matters here is `QuoteContext`: the parent Design as the
 * SERVER resolved it, never as the customer supplied it. Everything downstream
 * — the read-only card on the form, the row written to `enquiries`, the admin's
 * view of the lead — reads the Design from this one object, so there is no path
 * where a customer-supplied value becomes the stored parent.
 */

/** A photograph, resolved and confirmed to belong to the captured Design. */
export type QuoteSourcePhoto = {
  id: string;
  url: string;
  alt: string;
};

/** The Design a quote request is for, as resolved and verified server-side. */
export type CapturedDesign = {
  id: string;
  name: string;
  slug: string;
  occasionSlug: string | null;
  occasionName: string | null;
  location: string | null;
  serviceSlugs: string[];
  /** Cover image, or the originating photograph when there is one. */
  image: QuoteSourcePhoto | null;
};

/**
 * The outcome of resolving `?design=` and `?photo=` on the quote page.
 *
 * `requestedDesign` records that a design parameter was present but did not
 * resolve to a publicly eligible Design — a draft, archived, deleted or invented
 * slug. The page says so plainly and continues as a general enquiry rather than
 * silently attaching nothing, and it never reveals whether the slug exists.
 */
export type QuoteContext = {
  design: CapturedDesign | null;
  photo: QuoteSourcePhoto | null;
  requestedDesignUnavailable: boolean;
};

export type CreateEnquiryInput = EnquiryInput & {
  /** Resolved server-side. Never read from the submitted form. */
  designId: string | null;
  /** Resolved server-side and verified to belong to `designId`. */
  imageId: string | null;
  /**
   * Files that have already passed every server-side check in
   * `lib/uploads/reference-images.ts`. They are uploaded to the PRIVATE bucket
   * after the enquiry row exists, because the enquiry id namespaces the key.
   */
  referenceImages?: ValidatedReferenceImage[];
};

export type CreateEnquiryResult =
  | {
      status: 'created';
      enquiryId: string;
      /** Private reference images stored and linked to this enquiry. */
      referenceImageCount: number;
      /**
       * True when the enquiry was stored but one or more reference images could
       * not be linked. The lead is never discarded for a media failure.
       */
      referenceImagesIncomplete: boolean;
    }
  | { status: 'failed' };

/** An enquiry as the Admin Panel (P8) lists it. */
export type EnquirySummary = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  eventType: string;
  eventDate: string | null;
  venue: string | null;
  city: string;
  requiredServices: string[];
  status: string;
  designId: string | null;
  imageId: string | null;
  referenceImageCount: number;
  createdAt: string;
};
