import { z } from 'zod';
import { occasions, services } from '@/lib/content';
import {
  BUCKETS,
  MAX_REFERENCE_IMAGES_PER_ENQUIRY,
  REFERENCE_BUCKET,
} from '@/lib/storage';

/**
 * Enquiry validation — the server-side contract for a quote request.
 *
 * Source of truth: Requirements & SOW section 11, as simplified by the
 * refinement brief of 2026-09-05 (section 10), which reduced the form to what
 * a customer genuinely needs to give at the first contact:
 *   Required: Name, WhatsApp/Phone, Event type, Event date, Location (stored
 *             as `city`), Consent.
 *   Optional: Message (stored as `notes`), email, and the fields the shorter
 *             form no longer shows but the schema still accepts if a client
 *             sends them: venue, guest count, budget, required services.
 * The venue and the services are discussed on the follow-up call, which is
 * how VRK Decor works anyway. The database columns are unchanged: `venue` was
 * already nullable and `required_services` already defaulted to an empty
 * array. See 09_DECISIONS/DECISIONS.md.
 *
 * This module is the authority. The browser may run the same schema for
 * immediate feedback, but nothing is persisted until the server has parsed the
 * submitted `FormData` through `parseEnquiryForm`. There is no code path that
 * writes an enquiry from unparsed input.
 *
 * Two vocabularies are closed rather than free text: the event type must be one
 * of the fourteen approved occasions and every required service must be one of
 * the approved services (Requirements sections 5 and 6). A closed vocabulary is
 * both a data-quality decision and an injection-surface decision — the value
 * that reaches the database can only ever be one of a fixed set of slugs.
 *
 * The Design is NOT part of this schema. It is resolved and re-verified from
 * the request's own parameters by `features/enquiries/quote-context.ts`, never
 * chosen by the customer (CLAUDE.md core business rules).
 */

export const NAME_MAX = 120;
export const VENUE_MAX = 200;
export const CITY_MAX = 120;
export const BUDGET_MAX = 80;
export const NOTES_MAX = 2000;
export const EMAIL_MAX = 254;
export const GUEST_COUNT_MAX = 100_000;

/** How far ahead an event date may be booked. */
export const MAX_EVENT_YEARS_AHEAD = 3;

const OCCASION_SLUGS = occasions.map((occasion) => occasion.slug);
const SERVICE_SLUGS = services.map((service) => service.slug);

/**
 * Strips control characters and collapses runs of whitespace.
 *
 * React escapes on render, so this is not the XSS boundary; it exists so that
 * stored data is clean, single-line fields cannot smuggle newlines into an
 * admin list or a CSV export, and zero-width or bidirectional control
 * characters cannot be used to disguise text.
 */
export function sanitiseText(value: string, { multiline = false } = {}): string {
  // C0/C1 control characters, keeping tab and newline so multiline text
  // survives; then zero-width and bidirectional formatting characters, which
  // can be used to disguise what a value actually says.
  const withoutControls = value.replace(
    /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g,
    '',
  );
  const withoutFormatting = withoutControls.replace(
    /[\u200B-\u200F\u2028-\u202E\u2066-\u2069\uFEFF]/g,
    '',
  );

  if (!multiline) return withoutFormatting.replace(/\s+/g, ' ').trim();

  return withoutFormatting
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

/**
 * Normalises an Indian mobile number to E.164, or returns null.
 *
 * VRK Decor follows up by phone and WhatsApp, so the stored number has to be
 * dialable. A ten-digit local number is assumed to be Indian and gains the +91
 * prefix; an explicitly international number is kept as given. Everything is
 * stored in one shape so the Admin Panel can build `tel:` and `wa.me` links
 * without guessing.
 */
export function normalisePhone(raw: string): string | null {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 0) return null;

  // An explicit "+" means the customer gave a full international number; take
  // it as written, within E.164's own bounds.
  if (hasPlus) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }

  // Otherwise it is an Indian number written one of the usual ways:
  // 9994072435, 09994072435, 919994072435 or 0919994072435.
  let local = digits.replace(/^0+/, '');
  if (local.length === 12 && local.startsWith('91')) local = local.slice(2);

  return /^[6-9]\d{9}$/.test(local) ? `+91${local}` : null;
}

/** Today's date in the business's own timezone, as YYYY-MM-DD. */
export function todayInBusinessTimezone(now: Date = new Date()): string {
  // VRK Decor operates in Tamil Nadu; an event "today" must not be rejected
  // because the server happens to run in UTC.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function maxEventDate(today: string): string {
  const [year, rest] = [Number(today.slice(0, 4)), today.slice(4)];
  return `${year + MAX_EVENT_YEARS_AHEAD}${rest}`;
}

const optionalText = (max: number, multiline = false) =>
  z
    .string()
    .transform((value) => sanitiseText(value, { multiline }))
    .refine((value) => value.length <= max, {
      message: `Please keep this to ${max} characters or fewer.`,
    })
    .transform((value) => (value.length === 0 ? null : value));

/**
 * The enquiry schema.
 *
 * Built as a function so the "not in the past" rule is evaluated against the
 * current date at request time rather than at module load — a long-running
 * Node process must not keep yesterday's idea of today.
 */
export function enquirySchema(today: string = todayInBusinessTimezone()) {
  const latest = maxEventDate(today);

  return z.object({
    name: z
      .string()
      .transform((value) => sanitiseText(value))
      .refine((value) => value.length >= 2, {
        message: 'Please enter your name.',
      })
      .refine((value) => value.length <= NAME_MAX, {
        message: `Please keep your name to ${NAME_MAX} characters or fewer.`,
      }),

    phone: z
      .string()
      .transform((value) => sanitiseText(value))
      .refine((value) => value.length > 0, {
        message: 'Please enter a phone or WhatsApp number.',
      })
      .transform((value, ctx) => {
        const normalised = normalisePhone(value);
        if (!normalised) {
          ctx.addIssue({
            code: 'custom',
            message:
              'Please enter a valid mobile number, for example 99940 72435 or +91 99940 72435.',
          });
          return z.NEVER;
        }
        return normalised;
      }),

    email: z
      .string()
      .transform((value) => sanitiseText(value).toLowerCase())
      .refine((value) => value.length === 0 || z.email().safeParse(value).success, {
        message: 'Please enter a valid email address, or leave this blank.',
      })
      .refine((value) => value.length <= EMAIL_MAX, {
        message: 'Please enter a shorter email address.',
      })
      .transform((value) => (value.length === 0 ? null : value)),

    eventType: z.enum(OCCASION_SLUGS as [string, ...string[]], {
      message: 'Please choose the type of event.',
    }),

    eventDate: z
      .string()
      .transform((value) => value.trim())
      .refine((value) => value.length > 0, {
        message: 'Please choose your event date.',
      })
      .refine(isCalendarDate, { message: 'Please enter a real date.' })
      .refine((value) => value >= today, {
        message: 'Please choose a date that has not already passed.',
      })
      .refine((value) => value <= latest, {
        message: `We can only take bookings up to ${MAX_EVENT_YEARS_AHEAD} years ahead. Please call or WhatsApp us instead.`,
      }),

    // Optional since the form was simplified; discussed on the follow-up call.
    venue: optionalText(VENUE_MAX),

    // Presented to the customer as "Location" (city or town of the event).
    city: z
      .string()
      .transform((value) => sanitiseText(value))
      .refine((value) => value.length >= 2, { message: 'Please enter the location.' })
      .refine((value) => value.length <= CITY_MAX, {
        message: `Please keep the city to ${CITY_MAX} characters or fewer.`,
      }),

    // Optional since the form was simplified. Still a closed vocabulary: any
    // value that is sent must be an approved service slug.
    requiredServices: z
      .array(z.enum(SERVICE_SLUGS as [string, ...string[]]))
      // De-duplicate and restore the approved display order, so a repeated or
      // reordered field cannot change what is stored.
      .transform((values) => SERVICE_SLUGS.filter((slug) => values.includes(slug))),

    guestCount: z
      .string()
      .transform((value) => value.trim())
      .refine((value) => value.length === 0 || /^\d{1,6}$/.test(value), {
        message: 'Please enter the number of guests as a number, or leave this blank.',
      })
      .transform((value) => (value.length === 0 ? null : Number(value)))
      .refine((value) => value === null || (value > 0 && value <= GUEST_COUNT_MAX), {
        message: 'Please enter a realistic number of guests.',
      }),

    // Requirements section 16: the website never shows budget ranges, so this
    // is a free-text field the customer may fill in, not a price list.
    budget: optionalText(BUDGET_MAX),
    notes: optionalText(NOTES_MAX, true),

    consent: z
      .string()
      .optional()
      .transform((value) => value === 'on' || value === 'true')
      .refine((value) => value, {
        message: 'Please agree to us contacting you about this enquiry.',
      }),
  });
}

export type EnquiryInput = z.infer<ReturnType<typeof enquirySchema>>;

/** Field names, in the order they appear on the form. */
export const ENQUIRY_FIELDS = [
  'name',
  'phone',
  'email',
  'eventType',
  'eventDate',
  'venue',
  'city',
  'requiredServices',
  'guestCount',
  'budget',
  'notes',
  'consent',
] as const;

export type EnquiryField = (typeof ENQUIRY_FIELDS)[number];

export type EnquiryFieldErrors = Partial<Record<EnquiryField, string>>;

export type EnquiryParseResult =
  | { success: true; data: EnquiryInput }
  | { success: false; errors: EnquiryFieldErrors };

/**
 * Parses submitted `FormData`.
 *
 * Reads only the fields the schema declares, so an attacker cannot smuggle an
 * extra column (`status`, `internal_notes`, `selected_design_id`) into the
 * insert by adding a form field.
 */
export function parseEnquiryForm(
  formData: FormData,
  today: string = todayInBusinessTimezone(),
): EnquiryParseResult {
  const text = (field: string) => {
    const value = formData.get(field);
    return typeof value === 'string' ? value : '';
  };

  const result = enquirySchema(today).safeParse({
    name: text('name'),
    phone: text('phone'),
    email: text('email'),
    eventType: text('eventType'),
    eventDate: text('eventDate'),
    venue: text('venue'),
    city: text('city'),
    requiredServices: formData
      .getAll('requiredServices')
      .filter((value): value is string => typeof value === 'string'),
    guestCount: text('guestCount'),
    budget: text('budget'),
    notes: text('notes'),
    consent: text('consent'),
  });

  if (result.success) return { success: true, data: result.data };

  const errors: EnquiryFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field !== 'string') continue;
    if (!(ENQUIRY_FIELDS as readonly string[]).includes(field)) continue;
    // Keep the first message per field: the form shows one message per input.
    errors[field as EnquiryField] ??= issue.message;
  }

  return { success: false, errors };
}

/**
 * A reference image already stored in the PRIVATE bucket.
 *
 * P6 owns the relationship and its limits; P7 owns the upload itself. The
 * schema lives here so both phases validate against one definition, and so the
 * three-image ceiling is asserted in application code as well as by the
 * database trigger.
 */
export const referenceImageSchema = z.object({
  storageKey: z.string().min(1).max(512),
  originalFilename: z
    .string()
    .min(1)
    .max(255)
    .transform((value) => sanitiseText(value)),
  mimeType: z.enum(
    BUCKETS[REFERENCE_BUCKET].allowedMimeTypes as unknown as [string, ...string[]],
  ),
  sizeBytes: z.number().int().positive().max(BUCKETS[REFERENCE_BUCKET].maxBytes, {
    message: 'Each inspiration image must be 5 MB or smaller.',
  }),
});

export type ReferenceImageInput = z.infer<typeof referenceImageSchema>;

export const referenceImagesSchema = z
  .array(referenceImageSchema)
  .max(MAX_REFERENCE_IMAGES_PER_ENQUIRY, {
    message: `Please attach at most ${MAX_REFERENCE_IMAGES_PER_ENQUIRY} inspiration images.`,
  });
