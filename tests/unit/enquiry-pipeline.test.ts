import { describe, expect, it } from 'vitest';
import { ENQUIRY_STATUSES } from '@/lib/db/types';

describe('enquiry pipeline', () => {
  it('matches the approved pipeline in the Requirements & SOW section 15', () => {
    expect([...ENQUIRY_STATUSES]).toEqual([
      'new',
      'contacted',
      'quotation_sent',
      'negotiation',
      'booked',
      'completed',
      'lost',
    ]);
  });
});
