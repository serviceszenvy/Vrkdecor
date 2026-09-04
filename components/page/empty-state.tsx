import type { ReactNode } from 'react';

/**
 * Honest empty state.
 *
 * Used where a section is driven entirely by content VRK Decor will add through
 * the Admin Panel. Showing an empty state is deliberate: inventing placeholder
 * designs, packages or testimonials would put unapproved claims on the site.
 */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-line-soft bg-canvas-deep/50 flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-14 text-center">
      <p className="font-display text-xl font-medium">{title}</p>
      <p className="text-ink-muted max-w-md text-sm leading-relaxed">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
