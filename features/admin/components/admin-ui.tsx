'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { AdminActionState } from '../action-state';

/**
 * Shared building blocks for the admin forms.
 *
 * The Admin Panel uses the same design tokens as the public site but a denser,
 * plainer layout: it is a working tool used repeatedly by one team, not a page
 * that has to persuade anybody. What it keeps from the public side is the parts
 * that are about being usable rather than being pretty — 44px touch targets,
 * visible focus, labels tied to controls, errors announced and wired with
 * `aria-describedby`, and forms that work when a submission fails.
 */

export function Feedback({ state }: { state: AdminActionState }) {
  if (state.status === 'idle' || !state.message) return null;

  const tone =
    state.status === 'saved'
      ? 'border-brand-300 bg-brand-50 text-brand-900'
      : 'border-red-300 bg-red-50 text-red-900';

  return (
    <div
      role="alert"
      tabIndex={-1}
      data-testid="admin-feedback"
      data-status={state.status}
      className={cn('rounded-2xl border p-4 text-sm', tone)}
    >
      <p className="font-medium">{state.message}</p>
      {Object.keys(state.errors).length > 0 ? (
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
          {Object.entries(state.errors).map(([field, message]) => (
            <li key={field}>
              <a href={`#field-${field}`} className="underline underline-offset-4">
                {message}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function SubmitButton({
  children = 'Save',
  pendingLabel = 'Saving…',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  testId,
}: {
  children?: ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  testId?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={pending}
      data-testid={testId}
    >
      {pending ? pendingLabel : children}
    </Button>
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

export function Field({
  name,
  label,
  hint,
  error,
  required = false,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string | undefined;
  required?: boolean;
  children: (props: ControlProps) => ReactNode;
}) {
  const hintId = hint ? `hint-${name}` : undefined;
  const errorId = error ? `error-${name}` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`field-${name}`} className="text-sm font-medium">
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

      {hint ? (
        <p id={hintId} className="text-ink-muted text-sm">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {children({
        id: `field-${name}`,
        name,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        className: cn(
          'border-line-soft bg-surface w-full rounded-xl border px-3 py-2 text-base',
          'min-h-11 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
          'hover:border-brand-300',
          error && 'border-red-400',
        ),
      })}
    </div>
  );
}

export function CheckboxGroup({
  legend,
  name,
  options,
  selected,
  hint,
}: {
  legend: string;
  name: string;
  options: { id: string; label: string; note?: string }[];
  selected: string[];
  hint?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      {hint ? <p className="text-ink-muted text-sm">{hint}</p> : null}
      {options.length === 0 ? (
        <p className="text-ink-muted text-sm">Nothing to choose from yet.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <li key={option.id}>
              <label className="border-line-soft hover:border-brand-300 hover:bg-brand-50/60 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition-colors">
                <input
                  type="checkbox"
                  name={name}
                  value={option.id}
                  defaultChecked={selected.includes(option.id)}
                  className="accent-brand-700 mt-0.5 size-5 shrink-0"
                />
                <span className="text-sm">
                  {option.label}
                  {option.note ? (
                    <span className="text-ink-muted block text-xs">{option.note}</span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}

/** Reads an echoed value out of the action state, falling back to the row. */
export function echoed(
  state: AdminActionState,
  field: string,
  fallback: string | number | null | undefined,
): string {
  const submitted = state.values?.[field];
  if (typeof submitted === 'string') return submitted;
  if (fallback === null || fallback === undefined) return '';
  return String(fallback);
}

export function echoedList(
  state: AdminActionState,
  field: string,
  fallback: string[],
): string[] {
  const submitted = state.values?.[field];
  return Array.isArray(submitted) ? submitted : fallback;
}
