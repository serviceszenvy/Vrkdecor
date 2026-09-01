import { isSupabaseConfigured } from '@/lib/auth/supabase-anon';
import { MAX_REFERENCE_IMAGES_PER_ENQUIRY } from '@/lib/storage';
import type { CreateEnquiryInput, EnquirySummary } from './types';

/**
 * LOCAL-ONLY enquiry store — never a production code path.
 *
 * The quote flow has to be demonstrable and end-to-end testable before a
 * Supabase project exists, in exactly the same situation P5 faced with sample
 * portfolio content. The answer is the same one, and it is gated the same way:
 *
 *   SAFETY INVARIANT: this store is used only when Supabase is NOT configured.
 *   Staging and production configure Supabase, so every enquiry there is
 *   written to the database by the service role and nothing here can run.
 *   `tests/unit/enquiry-store.test.ts` asserts the invariant, and the quote page
 *   displays a visible notice whenever this store is active, so no visitor can
 *   be led to believe a request was delivered when it was not.
 *
 * It holds records in process memory only. Nothing is written to disk, the
 * contents disappear on restart, and the record count is capped. There is no
 * customer data to leak because there is no real customer: this state exists on
 * a developer's machine and in CI.
 */

type StoredEnquiry = EnquirySummary & { fingerprint: string };

const records: StoredEnquiry[] = [];

/** Bounds memory during a long local session or an E2E run. */
const MAX_LOCAL_RECORDS = 200;

/** True when enquiries are being kept in memory instead of the database. */
export function isUsingLocalEnquiryStore(): boolean {
  return !isSupabaseConfigured();
}

function assertLocalOnly() {
  if (isSupabaseConfigured()) {
    // Defence in depth: the callers already branch on this, and a mistake in a
    // future refactor must fail loudly rather than quietly drop a real lead.
    throw new Error(
      'The local enquiry store must never be used while Supabase is configured.',
    );
  }
}

export function storeEnquiryLocally(
  input: CreateEnquiryInput,
  fingerprint: string,
): EnquirySummary {
  assertLocalOnly();

  const referenceImages = (input.referenceImages ?? []).slice(
    0,
    MAX_REFERENCE_IMAGES_PER_ENQUIRY,
  );

  const record: StoredEnquiry = {
    id: `local-enquiry-${records.length + 1}`,
    name: input.name,
    phone: input.phone,
    email: input.email,
    eventType: input.eventType,
    eventDate: input.eventDate,
    venue: input.venue,
    city: input.city,
    requiredServices: input.requiredServices,
    status: 'new',
    designId: input.designId,
    imageId: input.imageId,
    referenceImageCount: referenceImages.length,
    createdAt: new Date().toISOString(),
    fingerprint,
  };

  records.unshift(record);
  if (records.length > MAX_LOCAL_RECORDS) records.length = MAX_LOCAL_RECORDS;

  return record;
}

/** Locally stored enquiries, newest first. Used by the local-mode E2E checks. */
export function listLocalEnquiries(): EnquirySummary[] {
  assertLocalOnly();
  return records.map(({ fingerprint: _fingerprint, ...summary }) => summary);
}

export function countLocalEnquiries(): number {
  assertLocalOnly();
  return records.length;
}

/** Test-only helper. Never call this from application code. */
export function resetLocalEnquiries() {
  records.length = 0;
}
