import { z } from 'zod';
import { ENQUIRY_STATUSES } from '@/lib/db/types';
import { isSlug, slugify } from '@/lib/slug';
import { sanitiseText } from './enquiry';

/**
 * Admin Panel input contracts.
 *
 * Every administrative mutation parses its `FormData` through a schema here
 * before anything is written. The Admin Panel is behind authentication, but an
 * authenticated user is still a browser, and a browser is still untrusted
 * input: a session does not make a payload safe.
 *
 * Two properties matter throughout:
 *
 *   - **only declared fields are read.** A parser never spreads the submitted
 *     form into a row, so an extra field cannot set a column the form does not
 *     own (`created_at`, `published_at`, another table's foreign key).
 *   - **closed vocabularies** for every status, pricing mode, delivery model
 *     and pipeline step, so the value that reaches the database is always one
 *     of a fixed set.
 *
 * Money is handled in whole rupees on the way in and stored in paise, matching
 * the P3 decision never to keep money in floating point.
 */

export const NAME_MAX = 120;
export const SLUG_MAX = 80;
export const DESCRIPTION_MAX = 2000;
export const LOCATION_MAX = 120;
export const ALT_TEXT_MAX = 200;
export const SEO_TITLE_MAX = 70;
export const SEO_DESCRIPTION_MAX = 200;
export const INTERNAL_NOTES_MAX = 5000;
export const TESTIMONIAL_BODY_MAX = 1200;
export const CAPTION_MAX = 200;
/** ₹10 crore, comfortably above any real event, as a sanity ceiling. */
export const MAX_PRICE_RUPEES = 100_000_000;

export const PUBLICATION_STATUSES = ['draft', 'published', 'archived'] as const;
export const CATALOG_STATUSES = ['active', 'inactive'] as const;
export const PRICING_MODES = ['custom_quote', 'starting_from'] as const;
export const DELIVERY_MODELS = ['in_house', 'partner_vendor'] as const;
export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;
export const VIDEO_PROVIDERS = ['youtube', 'instagram', 'vimeo'] as const;

/** Video hosts we will embed. Anything else is refused rather than iframed. */
const VIDEO_HOSTS: Record<(typeof VIDEO_PROVIDERS)[number], RegExp> = {
  youtube: /^(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)$/,
  instagram: /^(www\.)?instagram\.com$/,
  vimeo: /^(www\.|player\.)?vimeo\.com$/,
};

const requiredText = (max: number, message: string) =>
  z
    .string()
    .transform((value) => sanitiseText(value))
    .refine((value) => value.length > 0, { message })
    .refine((value) => value.length <= max, {
      message: `Please keep this to ${max} characters or fewer.`,
    });

const optionalText = (max: number, multiline = false) =>
  z
    .string()
    .transform((value) => sanitiseText(value, { multiline }))
    .refine((value) => value.length <= max, {
      message: `Please keep this to ${max} characters or fewer.`,
    })
    .transform((value) => (value.length === 0 ? null : value));

/**
 * A slug, generated from the name when the field is left blank.
 *
 * An admin-supplied override runs through `slugify` too, so there is no path
 * by which an unsafe value becomes a public URL segment.
 */
const slugFrom = (nameField: string) =>
  z.string().transform((value, ctx) => {
    const raw = value.trim();
    if (raw.length === 0) return '';
    const cleaned = slugify(raw);
    if (!isSlug(cleaned)) {
      ctx.addIssue({
        code: 'custom',
        message: `Please use letters and numbers for the web address, or leave it blank to generate one from the ${nameField}.`,
      });
      return z.NEVER;
    }
    return cleaned;
  });

const sortOrder = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length === 0 || /^-?\d{1,4}$/.test(value), {
    message: 'Please enter a whole number for the order.',
  })
  .transform((value) => (value.length === 0 ? 0 : Number(value)));

/** Whole rupees in, paise out. Never floating point, at any point. */
const priceRupees = z
  .string()
  .transform((value) => value.replace(/[,\s₹]/g, '').trim())
  .refine((value) => value.length === 0 || /^\d{1,9}$/.test(value), {
    message: 'Please enter the starting price in whole rupees, with no decimals.',
  })
  .transform((value) => (value.length === 0 ? null : Number(value)))
  .refine((value) => value === null || value <= MAX_PRICE_RUPEES, {
    message: 'Please enter a realistic starting price.',
  })
  .transform((value) => (value === null ? null : value * 100));

const checkbox = z
  .string()
  .optional()
  .transform((value) => value === 'on' || value === 'true');

const uuid = z.string().uuid({ message: 'Unrecognised selection.' });

const optionalUuid = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length === 0 || uuid.safeParse(value).success, {
    message: 'Unrecognised selection.',
  })
  .transform((value) => (value.length === 0 ? null : value));

const uuidList = z
  .array(z.string())
  .transform((values) => values.map((value) => value.trim()).filter(Boolean))
  .refine((values) => values.every((value) => uuid.safeParse(value).success), {
    message: 'Unrecognised selection.',
  })
  // De-duplicate: a repeated checkbox must not become a repeated join row.
  .transform((values) => [...new Set(values)]);

/**
 * A pricing mode and its price have to agree, and the database says so too
 * (`designs_starting_price_matches_mode`). Catching it here gives the admin a
 * sentence instead of a constraint violation.
 */
function requirePriceConsistency<
  T extends { pricingMode: string; startingPrice: number | null },
>(value: T, ctx: z.RefinementCtx) {
  if (value.pricingMode === 'starting_from' && value.startingPrice === null) {
    ctx.addIssue({
      code: 'custom',
      path: ['startingPrice'],
      message: 'A "starting from" price needs a figure.',
    });
  }
  if (value.pricingMode === 'custom_quote' && value.startingPrice !== null) {
    ctx.addIssue({
      code: 'custom',
      path: ['startingPrice'],
      message: 'A custom-quote design must not carry a price.',
    });
  }
}

// ---------------------------------------------------------------------------
// Designs
// ---------------------------------------------------------------------------

export const designSchema = z
  .object({
    name: requiredText(NAME_MAX, 'Please enter a name for this design.'),
    slug: slugFrom('name'),
    occasionId: optionalUuid,
    description: optionalText(DESCRIPTION_MAX, true),
    location: optionalText(LOCATION_MAX),
    pricingMode: z.enum(PRICING_MODES, { message: 'Please choose a pricing mode.' }),
    startingPrice: priceRupees,
    featured: checkbox,
    styleIds: uuidList,
    serviceIds: uuidList,
    seoTitle: optionalText(SEO_TITLE_MAX),
    seoDescription: optionalText(SEO_DESCRIPTION_MAX),
  })
  .superRefine(requirePriceConsistency)
  .transform((value) => ({
    ...value,
    slug: value.slug.length > 0 ? value.slug : slugify(value.name),
  }))
  .refine((value) => value.slug.length > 0, {
    path: ['slug'],
    message: 'Please enter a web address for this design.',
  });

export type DesignInput = z.infer<typeof designSchema>;

export const DESIGN_FIELDS = [
  'name',
  'slug',
  'occasionId',
  'description',
  'location',
  'pricingMode',
  'startingPrice',
  'featured',
  'styleIds',
  'serviceIds',
  'seoTitle',
  'seoDescription',
] as const;

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

export const packageSchema = z
  .object({
    name: requiredText(NAME_MAX, 'Please enter a name for this package.'),
    slug: slugFrom('name'),
    description: optionalText(DESCRIPTION_MAX, true),
    pricingMode: z.enum(PRICING_MODES, { message: 'Please choose a pricing mode.' }),
    startingPrice: priceRupees,
    status: z.enum(PUBLICATION_STATUSES, { message: 'Please choose a status.' }),
    sortOrder,
  })
  .superRefine(requirePriceConsistency)
  .transform((value) => ({
    ...value,
    slug: value.slug.length > 0 ? value.slug : slugify(value.name),
  }))
  .refine((value) => value.slug.length > 0, {
    path: ['slug'],
    message: 'Please enter a web address for this package.',
  });

export type PackageInput = z.infer<typeof packageSchema>;

export const PACKAGE_FIELDS = [
  'name',
  'slug',
  'description',
  'pricingMode',
  'startingPrice',
  'status',
  'sortOrder',
] as const;

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export const testimonialSchema = z.object({
  name: requiredText(NAME_MAX, 'Please enter the customer name.'),
  body: requiredText(TESTIMONIAL_BODY_MAX, 'Please enter the testimonial.'),
  eventType: optionalText(NAME_MAX),
  approvalStatus: z.enum(APPROVAL_STATUSES, {
    message: 'Please choose an approval state.',
  }),
  displayOrder: sortOrder,
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const TESTIMONIAL_FIELDS = [
  'name',
  'body',
  'eventType',
  'approvalStatus',
  'displayOrder',
] as const;

// ---------------------------------------------------------------------------
// Occasions, styles and services
// ---------------------------------------------------------------------------

export const occasionSchema = z
  .object({
    name: requiredText(NAME_MAX, 'Please enter a name.'),
    secondaryTerm: optionalText(NAME_MAX),
    slug: slugFrom('name'),
    description: optionalText(DESCRIPTION_MAX, true),
    status: z.enum(CATALOG_STATUSES, { message: 'Please choose a status.' }),
    sortOrder,
  })
  .transform((value) => ({
    ...value,
    slug: value.slug.length > 0 ? value.slug : slugify(value.name),
  }))
  .refine((value) => value.slug.length > 0, {
    path: ['slug'],
    message: 'Please enter a web address.',
  });

export const styleSchema = z
  .object({
    name: requiredText(NAME_MAX, 'Please enter a name.'),
    slug: slugFrom('name'),
    status: z.enum(CATALOG_STATUSES, { message: 'Please choose a status.' }),
    sortOrder,
  })
  .transform((value) => ({
    ...value,
    slug: value.slug.length > 0 ? value.slug : slugify(value.name),
  }))
  .refine((value) => value.slug.length > 0, {
    path: ['slug'],
    message: 'Please enter a web address.',
  });

export const serviceSchema = z
  .object({
    name: requiredText(NAME_MAX, 'Please enter a name.'),
    slug: slugFrom('name'),
    description: optionalText(DESCRIPTION_MAX, true),
    deliveryModel: z.enum(DELIVERY_MODELS, {
      message: 'Please say how this service is delivered.',
    }),
    status: z.enum(CATALOG_STATUSES, { message: 'Please choose a status.' }),
    sortOrder,
  })
  .transform((value) => ({
    ...value,
    slug: value.slug.length > 0 ? value.slug : slugify(value.name),
  }))
  .refine((value) => value.slug.length > 0, {
    path: ['slug'],
    message: 'Please enter a web address.',
  });

export type OccasionInput = z.infer<typeof occasionSchema>;
export type StyleInput = z.infer<typeof styleSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;

export const OCCASION_FIELDS = [
  'name',
  'secondaryTerm',
  'slug',
  'description',
  'status',
  'sortOrder',
] as const;
export const STYLE_FIELDS = ['name', 'slug', 'status', 'sortOrder'] as const;
export const SERVICE_FIELDS = [
  'name',
  'slug',
  'description',
  'deliveryModel',
  'status',
  'sortOrder',
] as const;

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export const altTextSchema = z.object({
  imageId: uuid,
  altText: optionalText(ALT_TEXT_MAX),
});

export const videoSchema = z
  .object({
    provider: z.enum(VIDEO_PROVIDERS, { message: 'Please choose a provider.' }),
    url: z
      .string()
      .transform((value) => sanitiseText(value))
      .refine((value) => value.length > 0, { message: 'Please enter the video URL.' }),
    caption: optionalText(CAPTION_MAX),
    sortOrder,
  })
  .superRefine((value, ctx) => {
    // A stored URL becomes an embed on a public page, so only the recognised
    // hosts are accepted and only over HTTPS.
    let parsed: URL;
    try {
      parsed = new URL(value.url);
    } catch {
      ctx.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'Please enter a full URL.',
      });
      return;
    }

    if (parsed.protocol !== 'https:') {
      ctx.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'The video URL must start with https://.',
      });
      return;
    }

    if (!VIDEO_HOSTS[value.provider].test(parsed.hostname)) {
      ctx.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'That URL does not belong to the provider you chose.',
      });
    }
  });

export type VideoInput = z.infer<typeof videoSchema>;

export const VIDEO_FIELDS = ['provider', 'url', 'caption', 'sortOrder'] as const;

// ---------------------------------------------------------------------------
// Enquiries
// ---------------------------------------------------------------------------

export const enquiryStatusSchema = z.enum(ENQUIRY_STATUSES, {
  message: 'Please choose a step in the pipeline.',
});

export const enquiryUpdateSchema = z.object({
  status: enquiryStatusSchema,
  internalNotes: optionalText(INTERNAL_NOTES_MAX, true),
});

export type EnquiryUpdateInput = z.infer<typeof enquiryUpdateSchema>;

export const ENQUIRY_UPDATE_FIELDS = ['status', 'internalNotes'] as const;

// ---------------------------------------------------------------------------
// Sign-in
// ---------------------------------------------------------------------------

export const signInSchema = z.object({
  email: z
    .string()
    .transform((value) => sanitiseText(value).toLowerCase())
    .refine((value) => z.email().safeParse(value).success, {
      message: 'Please enter your email address.',
    }),
  // Never sanitised, trimmed or length-capped downward: a password is a secret,
  // not display text, and altering it would silently break a valid one.
  password: z.string().min(1, { message: 'Please enter your password.' }).max(200),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const SIGN_IN_FIELDS = ['email', 'password'] as const;

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export type FieldErrors<Fields extends readonly string[]> = Partial<
  Record<Fields[number], string>
>;

export type ParseResult<T, Fields extends readonly string[]> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors<Fields> };

/**
 * Parses `FormData` against a schema, reading ONLY the declared fields.
 *
 * `arrayFields` names the fields that may repeat (checkbox groups). Everything
 * else is read as a single string, so a repeated field cannot smuggle an array
 * into a scalar column.
 */
export function parseAdminForm<T, Fields extends readonly string[]>(
  schema: z.ZodType<T>,
  fields: Fields,
  formData: FormData,
  arrayFields: readonly string[] = [],
): ParseResult<T, Fields> {
  const input: Record<string, unknown> = {};

  for (const field of fields) {
    if (arrayFields.includes(field)) {
      input[field] = formData
        .getAll(field)
        .filter((value): value is string => typeof value === 'string');
      continue;
    }
    const value = formData.get(field);
    input[field] = typeof value === 'string' ? value : '';
  }

  const result = schema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const errors: FieldErrors<Fields> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field !== 'string') continue;
    if (!(fields as readonly string[]).includes(field)) continue;
    const key = field as Fields[number];
    if (errors[key] === undefined) errors[key] = issue.message;
  }

  return { success: false, errors };
}
