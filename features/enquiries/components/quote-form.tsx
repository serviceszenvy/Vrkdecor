'use client';

import { useActionState, useId } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui';
import { ArrowRightIcon, ChevronRightIcon } from '@/components/layout/icons';
import { occasions } from '@/lib/content';
import { cn } from '@/lib/cn';
import {
  absoluteDesignUrl,
  designEnquiryMessage,
  routes,
  telHref,
  whatsAppHrefWithMessage,
} from '@/lib/navigation';
import {
  CITY_MAX,
  NAME_MAX,
  NOTES_MAX,
  type EnquiryField,
} from '@/lib/validation/enquiry';
import { submitQuoteRequest } from '../actions';
import { initialQuoteFormState } from '../form-state';
import type { CapturedDesign, QuoteSourcePhoto } from '../types';
import { ReferenceImageField } from './reference-image-field';

/**
 * The enquiry form.
 *
 * Short on purpose (refinement brief, section 10). Six things a customer can
 * answer in a minute, on a phone, without thinking about it:
 *
 *   Name · Phone / WhatsApp · Event type · Event date · Location · Message
 *
 * plus the consent line the requirements make mandatory. Email and up to three
 * private inspiration photographs are still available, folded into an
 * "Add more details" disclosure so the form reads as six fields rather than
 * ten.
 *
 * Unchanged behaviour:
 *   - the Design is carried in hidden fields and shown read-only above; there
 *     is deliberately no control that lets the customer pick one
 *   - the form posts to a Server Action, so it works with JavaScript disabled
 *     and the server is always the validator
 *   - submitted values are echoed back on failure, so nothing is retyped
 *   - errors appear both in a summary that takes focus and beside each field,
 *     wired with `aria-invalid` and `aria-describedby`
 *   - the event type is pre-selected from the captured Design when it has
 *     one, which the customer can change
 *   - when a submission fails or is throttled, the error carries the WhatsApp
 *     and phone continuation with it, so a customer is never left at a dead end
 */
export function QuoteForm({
  design,
  photo,
  today,
  maxEventDate,
  heading = 'Tell us about your celebration',
}: {
  design: CapturedDesign | null;
  photo: QuoteSourcePhoto | null;
  today: string;
  maxEventDate: string;
  heading?: string;
}) {
  const [state, formAction] = useActionState(submitQuoteRequest, initialQuoteFormState);
  const summaryId = useId();

  const value = (field: string, fallback = '') => {
    const submitted = state.values[field];
    return typeof submitted === 'string' ? submitted : fallback;
  };

  const errorEntries = Object.entries(state.errors) as [EnquiryField, string][];
  const hasErrors = errorEntries.length > 0;
  const extrasOpen = Boolean(value('email')) || Boolean(state.errors.email);

  const whatsAppFallback = whatsAppHrefWithMessage(
    designEnquiryMessage(design?.name, design ? absoluteDesignUrl(design.slug) : null),
  );

  return (
    <form
      action={formAction}
      noValidate
      encType="multipart/form-data"
      className="flex flex-col gap-7"
      data-testid="quote-form"
    >
      {/*
        The parent Design. Hidden, because the customer does not choose it — and
        harmless if tampered with, because the server re-resolves the slug and
        accepts only a published Design and only a photograph belonging to it.
      */}
      {design ? <input type="hidden" name="design" value={design.slug} /> : null}
      {photo ? <input type="hidden" name="photo" value={photo.id} /> : null}

      <div className="flex flex-col gap-2">
        <h2 id="quote-form-heading" className="font-display text-3xl font-medium">
          {heading}
        </h2>
        <p className="text-ink-muted text-sm">
          Six quick things and we will take it from there. Fields marked{' '}
          <span className="text-red-700" aria-hidden="true">
            *
          </span>
          <span className="sr-only">with an asterisk</span> are required.
        </p>
      </div>

      {hasErrors || state.message ? (
        <div
          id={summaryId}
          role="alert"
          tabIndex={-1}
          data-testid="quote-error-summary"
          className="motion-safe:animate-slide-down rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
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
              <ButtonLink href={whatsAppFallback} variant="primary" size="md">
                WhatsApp us instead
              </ButtonLink>
              <ButtonLink href={telHref} variant="outline" size="md">
                Call us
              </ButtonLink>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field field="name" label="Name" required error={state.errors.name}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              maxLength={NAME_MAX}
              placeholder="Your name"
              defaultValue={value('name')}
            />
          )}
        </Field>

        <Field
          field="phone"
          label="Phone / WhatsApp"
          required
          error={state.errors.phone}
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
          field="eventType"
          label="Event type"
          required
          error={state.errors.eventType}
        >
          {(props) => (
            <select
              {...props}
              defaultValue={value('eventType', design?.occasionSlug ?? '')}
            >
              <option value="">Choose the occasion</option>
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
          hint="Not fixed yet? Give us your best estimate."
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
          field="city"
          label="Location"
          required
          error={state.errors.city}
          className="sm:col-span-2"
        >
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="address-level2"
              maxLength={CITY_MAX}
              placeholder="Town or city, and the venue if you know it"
              defaultValue={value('city')}
            />
          )}
        </Field>

        <Field
          field="notes"
          label="Tell us what you have in mind"
          error={state.errors.notes}
          className="sm:col-span-2"
        >
          {(props) => (
            <textarea
              {...props}
              rows={4}
              maxLength={NOTES_MAX}
              placeholder="Colours, themes, the number of guests, anything you would like us to know"
              defaultValue={value('notes')}
            />
          )}
        </Field>
      </div>

      {/*
        Everything else, folded away. A native disclosure, so it works without
        JavaScript and opens itself when a value inside it needs attention.
      */}
      <details
        className="group border-line-soft rounded-2xl border bg-white/70 open:bg-white"
        open={extrasOpen || undefined}
        data-testid="quote-extras"
      >
        <summary className="text-brand-800 flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold select-none [&::-webkit-details-marker]:hidden">
          Add more details (optional)
          <ChevronRightIcon className="size-4 transition-transform duration-300 group-open:rotate-90" />
        </summary>
        <div className="border-line-soft flex flex-col gap-5 border-t px-4 pt-4 pb-5">
          <Field
            field="email"
            label="Email"
            error={state.errors.email}
            hint="Add it and we will email you a confirmation of this request straight away."
          >
            {(props) => (
              <input
                {...props}
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="you@example.com"
                defaultValue={value('email')}
              />
            )}
          </Field>

          <ReferenceImageField />
        </div>
      </details>

      <div className="flex flex-col gap-3">
        <label
          id="field-consent"
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-2xl border p-4',
            state.errors.consent
              ? 'border-red-400 bg-red-50'
              : 'border-line-soft bg-white/70',
          )}
        >
          <input
            type="checkbox"
            name="consent"
            value="on"
            defaultChecked={value('consent') === 'on'}
            aria-invalid={state.errors.consent ? true : undefined}
            aria-describedby={state.errors.consent ? 'error-consent' : undefined}
            className="accent-brand-700 mt-0.5 size-6 shrink-0 sm:size-5"
          />
          <span className="text-sm">
            I agree that VRK Decor may contact me by phone, WhatsApp or email about this
            enquiry, and store the details I have given here.{' '}
            <span aria-hidden="true" className="text-red-700">
              *
            </span>
            <span className="text-ink-muted mt-1 block text-xs">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton />
        <p className="text-ink-muted max-w-md text-sm">
          We will come back to you on the phone or on WhatsApp. Every design is priced
          by our team, so nothing here is a final quotation.
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
      {pending ? 'Sending…' : 'Send Enquiry'}
      {pending ? null : <ArrowRightIcon className="size-4" />}
    </Button>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-sm text-red-700">
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
  className,
  children,
}: {
  field: EnquiryField;
  label: string;
  hint?: string;
  error?: string | undefined;
  required?: boolean;
  className?: string;
  children: (props: ControlProps) => React.ReactNode;
}) {
  const hintId = hint ? `hint-${field}` : undefined;
  const errorId = error ? `error-${field}` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={`field-${field}`} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="text-red-700" aria-hidden="true">
            {' '}
            *
          </span>
        ) : (
          <span className="text-ink-muted font-normal"> (optional)</span>
        )}
      </label>

      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}

      {children({
        id: `field-${field}`,
        name: field,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        className: cn(
          'border-line-soft bg-white w-full rounded-xl border px-3.5 py-2.5 text-base',
          'min-h-12 placeholder:text-sand-400 transition-[border-color,box-shadow] duration-200',
          'hover:border-brand-300 focus:border-brand-600 focus:shadow-[0_0_0_4px_rgb(142_200_64/0.18)] focus-visible:outline-none',
          error && 'border-red-400',
        ),
      })}

      {hint ? (
        <p id={hintId} className="text-ink-muted text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
