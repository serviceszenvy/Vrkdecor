import { revalidatePath } from 'next/cache';

/**
 * Helpers shared by the admin Server Actions.
 *
 * Not a `'use server'` module: those may export async functions only, so the
 * synchronous helpers below live here and are imported by the action modules.
 */

/**
 * Echoes back exactly the fields a form owns, and nothing else.
 *
 * Reading only the declared fields is the same rule the parsers follow, for the
 * same reason: an extra field in a request must not be able to travel anywhere,
 * not even into the state that re-renders the form.
 */
export function submittedValues(
  formData: FormData,
  fields: readonly string[],
  arrayFields: readonly string[] = [],
): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};

  for (const field of fields) {
    if (arrayFields.includes(field)) {
      values[field] = formData
        .getAll(field)
        .filter((value): value is string => typeof value === 'string');
      continue;
    }
    const value = formData.get(field);
    if (typeof value === 'string') values[field] = value;
  }

  return values;
}

/**
 * Refreshes every public page a portfolio change can affect.
 *
 * The home page shows featured designs, `/our-work` and `/gallery` list and
 * flatten them, and the design page renders one. A published edit that only
 * appeared on some of them would be worse than one that appeared on none.
 */
export function revalidatePublicPortfolio(slug?: string | null) {
  revalidatePath('/');
  revalidatePath('/our-work');
  revalidatePath('/gallery');
  if (slug) revalidatePath(`/our-work/${slug}`);
}

/**
 * Refreshes the public pages that render admin-managed page content.
 *
 * No `/occasions` entry: that page was retired in favour of occasion content
 * on `/services` (`next.config.ts` redirects the old URL there), which is
 * already covered below.
 */
export function revalidatePublicContent() {
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/packages');
}

/** A UUID, or null. Used for identifiers carried in hidden form fields. */
export function readUuid(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  if (typeof value !== 'string') return null;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    value,
  )
    ? value
    : null;
}
