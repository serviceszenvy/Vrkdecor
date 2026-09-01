'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { parseEnquiryForm } from '@/lib/validation/enquiry';
import { createEnquiry } from './data';
import type { QuoteFormState } from './form-state';
import { resolveQuoteContext } from './quote-context';
import {
  checkQuoteThrottle,
  clientKeyFromHeaders,
  requestFingerprint,
} from './throttle';

/**
 * The quote submission handler.
 *
 * It is a Server Action rather than a public route handler for three reasons:
 * Next.js checks the request's Origin against the host before invoking one, so
 * a cross-site POST is rejected before any code runs (the CSRF/request-integrity
 * control the Technical Development Specification section 12 asks for); the
 * form degrades to a plain HTML POST and works with JavaScript disabled, as the
 * rest of the site does; and there is no public JSON endpoint left over for
 * someone to script against.
 *
 * The order of operations is the security design:
 *
 *   1. parse and validate every field server-side — nothing else runs first
 *   2. re-resolve the parent Design from its slug, publicly-eligible only
 *   3. throttle by client, phone and request fingerprint
 *   4. persist
 *   5. redirect
 *
 * The Design is resolved at step 2, not read from the submitted form, so the
 * only thing a tampered hidden field can achieve is attaching a different
 * PUBLISHED design. It cannot attach a draft one, cannot attach a photograph
 * belonging to a different design, and cannot set `status`, `internal_notes` or
 * any other admin-owned column, because the insert never reads them.
 */

function submittedValues(formData: FormData): QuoteFormState['values'] {
  const values: QuoteFormState['values'] = {};
  for (const field of [
    'name',
    'phone',
    'email',
    'eventType',
    'eventDate',
    'venue',
    'city',
    'guestCount',
    'budget',
    'notes',
    'consent',
  ]) {
    const value = formData.get(field);
    if (typeof value === 'string') values[field] = value;
  }
  values.requiredServices = formData
    .getAll('requiredServices')
    .filter((value): value is string => typeof value === 'string');
  return values;
}

export async function submitQuoteRequest(
  _previous: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const values = submittedValues(formData);

  const parsed = parseEnquiryForm(formData);
  if (!parsed.success) {
    return {
      status: 'invalid',
      errors: parsed.errors,
      values,
      message: 'Please check the highlighted fields and try again.',
    };
  }

  // The parent Design, resolved and re-verified server-side. The hidden fields
  // are only ever a lookup key; this call decides what is actually attached.
  const context = await resolveQuoteContext({
    design: readParam(formData, 'design'),
    photo: readParam(formData, 'photo'),
  });

  const designId = context.design?.id ?? null;
  const imageId = context.photo?.id ?? null;

  const fingerprint = requestFingerprint({
    phone: parsed.data.phone,
    designId,
    eventDate: parsed.data.eventDate,
    eventType: parsed.data.eventType,
  });

  const throttle = checkQuoteThrottle({
    clientKey: clientKeyFromHeaders(await headers()),
    phone: parsed.data.phone,
    fingerprint,
  });

  if (throttle.outcome === 'rate_limited') {
    return {
      status: 'rate_limited',
      errors: {},
      values,
      message:
        'We have already received several requests from you. Please wait a few minutes, or call or WhatsApp us and we will help straight away.',
    };
  }

  // An identical request within the duplicate window is treated as the same
  // enquiry: the customer sees the confirmation they expect, and the Admin
  // Panel does not fill up with copies of one lead.
  if (throttle.outcome === 'duplicate') {
    redirect('/quote/submitted?repeat=1');
  }

  const result = await createEnquiry(
    {
      ...parsed.data,
      designId,
      imageId,
      // Reference-image uploads arrive in P7; the relationship and its limit of
      // three are already implemented and enforced on the path below.
      referenceImages: [],
    },
    fingerprint,
  );

  if (result.status !== 'created') {
    return {
      status: 'failed',
      errors: {},
      values,
      message:
        'Something went wrong while sending your request. Please try again, or call or WhatsApp us and we will take the details directly.',
    };
  }

  redirect('/quote/submitted');
}

function readParam(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
