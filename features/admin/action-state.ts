/**
 * The state every admin form and its Server Action exchange.
 *
 * Kept out of the `'use server'` modules because such a module may export async
 * functions and nothing else: a type or a constant declared there is a build
 * error.
 *
 * `values` echoes what was submitted so a validation failure never costs an
 * admin their typing. File inputs are the one thing that cannot be echoed back,
 * because no browser will let a page repopulate one, so the upload messages say
 * plainly that the files need choosing again.
 */
export type AdminActionState = {
  status: 'idle' | 'invalid' | 'failed' | 'saved';
  message?: string;
  errors: Record<string, string>;
  values?: Record<string, string | string[]>;
};

export const idleActionState: AdminActionState = { status: 'idle', errors: {} };

export function invalid(
  errors: Record<string, string>,
  values?: Record<string, string | string[]>,
  message = 'Please check the highlighted fields and try again.',
): AdminActionState {
  return { status: 'invalid', errors, values, message };
}

export function failed(
  message: string,
  values?: Record<string, string | string[]>,
): AdminActionState {
  return { status: 'failed', errors: {}, values, message };
}

export function saved(message: string): AdminActionState {
  return { status: 'saved', errors: {}, message };
}

/**
 * Turns a database error into something an admin can act on.
 *
 * Only the shapes we can name are translated. Everything else becomes one
 * generic sentence: a raw PostgREST error can carry column names, constraint
 * definitions and occasionally row values, none of which belongs on a screen.
 */
export function describeWriteFailure(
  error: { code?: string; message?: string } | null,
  subject: string,
): string {
  if (error?.code === '23505') {
    return `That web address is already in use by another ${subject}. Please choose a different one.`;
  }
  if (error?.code === '23503') {
    return `Something this ${subject} refers to no longer exists. Please reload the page and try again.`;
  }
  if (error?.code === '23514') {
    return `Those details are not a valid combination for a ${subject}.`;
  }
  if (error?.code === '42501' || error?.code === 'PGRST301') {
    return 'Your account is not permitted to make that change.';
  }
  return `Could not save this ${subject}. Please try again.`;
}
