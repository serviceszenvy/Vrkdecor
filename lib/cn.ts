/**
 * Joins conditional class names.
 *
 * Deliberately dependency-free — but that means it does NOT resolve conflicting
 * Tailwind utilities. Class order in the attribute is irrelevant to CSS; the
 * stylesheet order decides. In particular the button base sets `inline-flex`,
 * so passing `hidden` through a component's `className` will NOT hide it.
 *
 * Rule: use `className` for spacing and colour additions only. Control
 * responsive visibility and layout by wrapping the component in an element that
 * carries those utilities.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
