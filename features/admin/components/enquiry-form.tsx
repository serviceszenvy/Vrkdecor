'use client';

import { useActionState } from 'react';
import { ENQUIRY_STATUSES, type EnquiryRow } from '@/lib/db/types';
import { INTERNAL_NOTES_MAX } from '@/lib/validation/admin';
import { updateEnquiryAction } from '../actions/enquiries';
import { idleActionState } from '../action-state';
import { Feedback, Field, SubmitButton, echoed } from './admin-ui';

/** Requirements & SOW section 15, in the customer's language. */
export const ENQUIRY_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  quotation_sent: 'Quotation sent',
  negotiation: 'In discussion',
  booked: 'Booked',
  completed: 'Completed',
  lost: 'Lost',
};

/**
 * The enquiry pipeline and internal notes.
 *
 * These are the ONLY two things an admin can change about an enquiry. The
 * customer's own answers are the record of what they asked for, and an inbox
 * that let anyone edit a lead's phone number or event date would make that
 * record worth less than the piece of paper it replaced.
 */
export function EnquiryPipelineForm({ enquiry }: { enquiry: EnquiryRow }) {
  const [state, formAction] = useActionState(updateEnquiryAction, idleActionState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      data-testid="enquiry-form"
    >
      <input type="hidden" name="enquiryId" value={enquiry.id} />
      <Feedback state={state} />

      <Field name="status" label="Pipeline step" required error={state.errors.status}>
        {(props) => (
          <select {...props} defaultValue={echoed(state, 'status', enquiry.status)}>
            {ENQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ENQUIRY_STATUS_LABELS[status] ?? status}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field
        name="internalNotes"
        label="Internal notes"
        error={state.errors.internalNotes}
        hint="Only the VRK Decor team sees these. They are never shown to the customer and never sent anywhere."
      >
        {(props) => (
          <textarea
            {...props}
            rows={6}
            maxLength={INTERNAL_NOTES_MAX}
            defaultValue={echoed(state, 'internalNotes', enquiry.internal_notes)}
          />
        )}
      </Field>

      <div>
        <SubmitButton testId="enquiry-submit">Update enquiry</SubmitButton>
      </div>
    </form>
  );
}
