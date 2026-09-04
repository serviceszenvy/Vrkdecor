import type { EnquiryFieldErrors } from '@/lib/validation/enquiry';

/**
 * The state the quote form and its Server Action exchange.
 *
 * Kept out of `actions.ts` because a `'use server'` module may export async
 * functions and nothing else — a constant declared there becomes a build error.
 */
export type QuoteFormState = {
  status: 'idle' | 'invalid' | 'rate_limited' | 'failed';
  errors: EnquiryFieldErrors;
  /** Echoed back so the customer never retypes a long form after an error. */
  values: Record<string, string | string[]>;
  message?: string;
};

export const initialQuoteFormState: QuoteFormState = {
  status: 'idle',
  errors: {},
  values: {},
};
