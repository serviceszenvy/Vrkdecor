/**
 * Keyboard-only shortcut past the navigation. Visible only when focused.
 */
export function SkipLink({ href = '#main' }: { href?: string }) {
  return (
    <a
      href={href}
      className="bg-accent-500 text-ink-inverse sr-only rounded-md px-4 py-3 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
    >
      Skip to main content
    </a>
  );
}
