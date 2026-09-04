'use client';

import { useActionState, useId } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui';
import { PARTNER_VENDOR_LABEL, occasions, services } from '@/lib/content';
import { cn } from '@/lib/cn';
import {
  designEnquiryMessage,
  routes,
  telHref,
  whatsAppHrefWithMessage,
} from '@/lib/navigation';
import {
  BUDGET_MAX,
  CITY_MAX,
  NAME_MAX,
  NOTES_MAX,
  VENUE_MAX,
  type EnquiryField,
} from '@/lib/validation/enquiry';
import { submitQuoteRequest } from '../actions';
import { initialQuoteFormState } from '../form-state';
import type { CapturedDesign, QuoteSourcePhoto } from '../types';
import { ReferenceImageField } from './reference-image-field';

/**
 * The quote request form.
 *
 * Requirements section 11 defines the fields exactly:
 *   required — name, WhatsApp/phone, event type, event date, venue, city,
 *              required services, consent
 *   optional — email, guest count, budget, notes
 *
 * Notable behaviour:
 *   - the Design is carried in hidden fields and shown read-only above; there
 *     is deliberately no control that lets the customer pick one
 *   - the form posts to a Server Action, so it works with JavaScript disabled
 *     and the server is always the validator
 *   - submitted values are echoed back on failure, so nothing is retyped
 *   - errors appear both in a summary that takes focus and beside each field,
 *     wired with `aria-invalid` and `aria-describedby`
 *   - the event type and services are pre-selected from the captured Design
 *     when it has them, which the customer can change: they are stating their
 *     own requirement, not re-selecting the design
 *   - up to three PRIVATE inspiration images may be attached (P7). The control
 *     is a plain file input, so it degrades too; every file is validated
 *     server-side by its actual bytes before anything is stored
 *   - when a submission fails or is throttled, the error carries the WhatsApp
 *     and phone continuation with it, so a customer is never left at a dead end
 */
export function QuoteForm({
  design,
  photo,
  today,
  maxEventDate,
}: {
  design: CapturedDesign | null;
  photo: QuoteSourcePhoto | null;
  today: string;
  maxEventDate: string;
}) {
  const [state, formAction] = useActionState(submitQuoteRequest, initialQuoteFormState);
  const summaryId = useId();

  const value = (field: string, fallback = '') => {
    const submitted = state.values[field];
    return typeof submitted === 'string' ? submitted : fallback;
  };

  const checkedServices = (): string[] => {
    const submitted = state.values.requiredServices;
    if (Array.isArray(submitted)) return submitted;
    return design?.serviceSlugs ?? [];
  };

  const selectedServices = checkedServices();
  const errorEntries = Object.entries(state.errors) as [EnquiryField, string][];
  const hasErrors = errorEntries.length > 0;

  return (
    <form
      action={formAction}
      noValidate
      encType="multipart/form-data"
      className="flex flex-col gap-8"
    >
      {/*
        The parent Design. Hidden, because the customer does not choose it — and
        harmless if tampered with, because the server re-resolves the slug and
        accepts only a published Design and only a photograph belonging to it.
      */}
      {design ? <input type="hidden" name="design" value={design.slug} /> : null}
      {photo ? <input type="hidden" name="photo" value={photo.id} /> : null}

      {hasErrors || state.message ? (
        <div
          id={summaryId}
          role="alert"
          tabIndex={-1}
          data-testid="quote-error-summary"
          className="motion-safe:animate-fade-in rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
        >
          <p className="font-medium">
            {state.message ?? 'Please check the highlighted fields and try again.'}
          </p>
          {hasErrors ? (
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
              {errorEntries.map(([field, message]) => (
                <li key={field}>
                  <a href={`#field-${field}`} className="underline underline-offset-4">
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {/*
            A failed or throttled submission is exactly the moment a customer
            gives up. Both are offered a way through that does not depend on
            this form working at all.
          */}
          {state.status === 'failed' || state.status === 'rate_limited' ? (
            <div
              className="mt-4 flex flex-wrap gap-3"
              data-testid="quote-error-continuation"
            >
              <ButtonLink
                href={whatsAppHrefWithMessage(designEnquiryMessage(design?.name))}
                variant="primary"
                size="md"
              >
                WhatsApp us instead
              </ButtonLink>
              <ButtonLink href={telHref} variant="outline" size="md">
                Call us
              </ButtonLink>
            </div>
          ) : null}
        </div>
      ) : null}

      <Fieldset legend="Your details">
        <Field
          field="name"
          label="Your name"
          required
          error={state.errors.name}
          hint="So we know who to ask for."
        >
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              maxLength={NAME_MAX}
              defaultValue={value('name')}
            />
          )}
        </Field>

        <Field
          field="phone"
          label="Phone or WhatsApp number"
          required
          error={state.errors.phone}
          hint="We follow up by phone and on WhatsApp, so this is how we reach you."
        >
          {(props) => (
            <input
              {...props}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              placeholder="99940 72435"
              defaultValue={value('phone')}
            />
          )}
        </Field>

        <Field
          field="email"
          label="Email address"
          error={state.errors.email}
          hint="Optional. Add it and we will email you a confirmation of this request straight away."
        >
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="email"
              maxLength={254}
              defaultValue={value('email')}
            />
          )}
        </Field>
      </Fieldset>

      <Fieldset legend="About your event">
        <Field
          field="eventType"
          label="Type of event"
          required
          error={state.errors.eventType}
        >
          {(props) => (
            <select
              {...props}
              defaultValue={value('eventType', design?.occasionSlug ?? '')}
            >
              <option value="">Please choose…</option>
              {occasions.map((occasion) => (
                <option key={occasion.slug} value={occasion.slug}>
                  {occasion.name}
                  {occasion.secondaryTerm ? ` / ${occasion.secondaryTerm}` : ''}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          field="eventDate"
          label="Event date"
          required
          error={state.errors.eventDate}
          hint="If the date is not fixed yet, give us your best estimate."
        >
          {(props) => (
            <input
              {...props}
              type="date"
              min={today}
              max={maxEventDate}
              defaultValue={value('eventDate')}
            />
          )}
        </Field>

        <Field
          field="venue"
          label="Venue"
          required
          error={state.errors.venue}
          hint="Hall, hotel, temple or home, whichever you have in mind."
        >
          {(props) => (
            <input
              {...props}
              type="text"
              maxLength={VENUE_MAX}
              defaultValue={value('venue')}
            />
          )}
        </Field>

        <Field field="city" label="City" required error={state.errors.city}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="address-level2"
              maxLength={CITY_MAX}
              defaultValue={value('city')}
            />
          )}
        </Field>

        <Field
          field="guestCount"
          label="Approximate number of guests"
          error={state.errors.guestCount}
          hint="Optional."
        >
          {(props) => (
            <input
              {...props}
              type="number"
              inputMode="numeric"
              min={1}
              max={100000}
              defaultValue={value('guestCount')}
            />
          )}
        </Field>
      </Fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-display text-xl font-medium">
          What do you need?{' '}
          <span className="text-ink-muted text-sm font-normal">(required)</span>
        </legend>
        <p className="text-ink-muted text-sm" id="field-requiredServices">
          Choose everything you would like quoted. Some services are delivered with our
          trusted partner vendors.
        </p>
        {state.errors.requiredServices ? (
          <FieldError id="error-requiredServices">
            {state.errors.requiredServices}
          </FieldError>
        ) : null}
        <ul className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <li key={service.slug}>
              <label className="border-line-soft hover:border-accent-300/50 hover:bg-white/5 has-[:checked]:border-accent-300 has-[:checked]:bg-accent-900/40 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors duration-200">
                <input
                  type="checkbox"
                  name="requiredServices"
                  value={service.slug}
                  defaultChecked={selectedServices.includes(service.slug)}
                  aria-invalid={state.errors.requiredServices ? true : undefined}
                  aria-describedby={
                    state.errors.requiredServices ? 'error-requiredServices' : undefined
                  }
                  className="accent-brand-700 mt-0.5 size-5 shrink-0"
                />
                <span className="text-sm">
                  {service.name}
                  {service.deliveryModel === 'partner_vendor' ? (
                    <span className="text-ink-muted block text-xs">
                      {PARTNER_VENDOR_LABEL}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <Fieldset legend="Anything else?">
        <Field
          field="budget"
          label="Budget in mind"
          error={state.errors.budget}
          hint="Optional. Tell us in your own words. We do not publish price ranges."
        >
          {(props) => (
            <input
              {...props}
              type="text"
              maxLength={BUDGET_MAX}
              defaultValue={value('budget')}
            />
          )}
        </Field>

        <Field
          field="notes"
          label="Notes"
          error={state.errors.notes}
          hint="Optional. Colours, themes, timings, anything you would like us to know."
        >
          {(props) => (
            <textarea
              {...props}
              rows={5}
              maxLength={NOTES_MAX}
              defaultValue={value('notes')}
            />
          )}
        </Field>

        <ReferenceImageField />
      </Fieldset>

      <div className="flex flex-col gap-3">
        <label
          id="field-consent"
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors duration-200',
            state.errors.consent
              ? 'border-red-400 bg-red-50'
              : 'border-line-soft has-[:checked]:border-accent-300 has-[:checked]:bg-accent-900/40',
          )}
        >
          <input
            type="checkbox"
            name="consent"
            value="on"
            defaultChecked={value('consent') === 'on'}
            aria-invalid={state.errors.consent ? true : undefined}
            aria-describedby={state.errors.consent ? 'error-consent' : undefined}
            className="accent-brand-700 mt-0.5 size-5 shrink-0"
          />
          <span className="text-sm">
            I agree that VRK Decor may contact me by phone, WhatsApp or email about this
            enquiry, and store the details I have given here.{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
            <span className="text-ink-muted mt-1 block">
              See our{' '}
              <Link href={routes.privacy} className="underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </span>
          </span>
        </label>
        {state.errors.consent ? (
          <FieldError id="error-consent">{state.errors.consent}</FieldError>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <SubmitButton />
        <p className="text-ink-muted text-sm">
          We will get back to you by phone or WhatsApp. We never calculate a final
          quotation automatically. Every design is priced by our team.
        </p>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      disabled={pending}
      data-testid="quote-submit"
      className="sm:self-start"
    >
      {pending ? 'Sending…' : 'Send quote request'}
    </Button>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="font-display text-xl font-medium">{legend}</legend>
      {children}
    </fieldset>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-sm text-red-400">
      {children}
    </p>
  );
}

type ControlProps = {
  id: string;
  name: string;
  required?: boolean;
  'aria-invalid'?: true | undefined;
  'aria-describedby'?: string | undefined;
  className: string;
};

/**
 * One labelled control.
 *
 * The control itself is supplied by the caller so the markup stays honest —
 * an `input`, a `select` and a `textarea` are different elements and are not
 * papered over by a generic wrapper — while labelling, hints, error wiring and
 * the 44px touch target stay identical across all of them.
 */
function Field({
  field,
  label,
  hint,
  error,
  required = false,
  children,
}: {
  field: EnquiryField;
  label: string;
  hint?: string;
  error?: string | undefined;
  required?: boolean;
  children: (props: ControlProps) => React.ReactNode;
}) {
  const hintId = hint ? `hint-${field}` : undefined;
  const errorId = error ? `error-${field}` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`field-${field}`} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="text-red-400" aria-hidden="true">
            {' '}
            *
          </span>
        ) : (
          <span className="text-ink-muted font-normal"> (optional)</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="text-ink-muted text-sm">
          {hint}
        </p>
      ) : null}

      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}

      {children({
        id: `field-${field}`,
        name: field,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        className: cn(
          'border-line-soft bg-surface text-ink w-full rounded-xl border px-3 py-2.5 text-base',
          'min-h-12 focus-visible:outline-2 focus-visible:outline-offset-2',
          'transition-[border-color,box-shadow] duration-200 hover:border-accent-300/50',
          'focus:border-accent-300 focus:shadow-focus-glow',
          error && 'border-red-400',
        ),
      })}
    </div>
  );
}
