'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateReferenceImageUploads } from '@/lib/uploads';
import { parseEnquiryForm } from '@/lib/validation/enquiry';
import { sendEnquiryConfirmation } from './confirmation';
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
 *   3. validate every attached file: count, size, declared type, ACTUAL bytes
 *      and pixel dimensions. A bad file is refused before anything is stored
 *   4. throttle by client, phone and request fingerprint
 *   5. persist the enquiry
 *   6. write the private reference images, under keys derived from the new
 *      enquiry id — after the lead is already safe
 *   7. attempt the customer's confirmation email — after the lead is already
 *      safe, so a provider outage cannot cost VRK Decor a customer
 *   8. redirect
 *
 * Steps 6 and 7 are best effort by design. Neither can fail the request, and
 * neither runs before the enquiry is in the Admin Panel's reach.
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

  // Files are inspected BEFORE the throttle, and before anything is written.
  // Before, because a rejected file must not consume the duplicate window: a
  // customer who fixes their attachment and resends would otherwise be told we
  // already have a request that was never created.
  //
  // The `accept` and `multiple` attributes on the input are a convenience for
  // the customer, never a control. This call reads the bytes and decides what
  // each file really is.
  const uploads = await validateReferenceImageUploads(formData);

  if (!uploads.success) {
    return { status: 'invalid', errors: {}, values, message: uploads.message };
  }

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
    const repeat = new URLSearchParams({ repeat: '1' });
    if (context.design) repeat.set('design', context.design.slug);
    redirect(`/quote/submitted?${repeat.toString()}`);
  }

  const result = await createEnquiry(
    { ...parsed.data, designId, imageId, referenceImages: uploads.images },
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

  // From here the lead exists and is in the Admin Panel. Nothing below may
  // change that, and nothing below is allowed to throw.
  const confirmation = await sendEnquiryConfirmation(result.enquiryId, parsed.data, {
    designName: context.design?.name ?? null,
    referenceImageCount: result.referenceImageCount,
  });

  const outcome = new URLSearchParams();
  // The design slug is public content, and it is what lets the confirmation
  // page offer a WhatsApp message that already says what the enquiry is about.
  if (context.design) outcome.set('design', context.design.slug);
  if (confirmation === 'sent') outcome.set('email', 'sent');
  // Told plainly rather than hidden: the enquiry arrived, the pictures did not.
  if (result.referenceImagesIncomplete) outcome.set('images', 'partial');

  const query = outcome.toString();
  redirect(query ? `/quote/submitted?${query}` : '/quote/submitted');
}

function readParam(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
