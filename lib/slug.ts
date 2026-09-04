/**
 * URL slug generation.
 *
 * Slugs are part of the public URL of a Design or a Package, so they are
 * generated from the name rather than typed, and they are restricted to
 * lowercase ASCII letters, digits and single hyphens. That keeps every public
 * URL clean (Requirements & SOW section 17) and means a slug can never carry a
 * path segment, a query string, a percent-encoded sequence or a script.
 *
 * An admin may override a generated slug, but the override runs through exactly
 * the same function, so there is no path by which an unsafe value becomes one.
 */

const MAX_SLUG_LENGTH = 80;

export function slugify(value: string): string {
  return (
    value
      .normalize('NFKD')
      // Strip combining marks so "Nichayathārtham" becomes "nichayathartham"
      // rather than losing the letter entirely.
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, MAX_SLUG_LENGTH)
      .replace(/-+$/g, '')
  );
}

/** True when a value is already a well-formed slug. */
export function isSlug(value: string): boolean {
  return value.length > 0 && value === slugify(value);
}
