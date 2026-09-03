import Link from 'next/link';
import { routes } from '@/lib/navigation';

/**
 * Shown when the link carried a design that could not be attached.
 *
 * The design may be a draft, archived, deleted or simply invented; the visitor
 * is told the same thing in every case, because saying which would confirm
 * whether an unpublished Design exists. The request still goes through as a
 * general enquiry rather than being silently attached to nothing.
 */
export function UnavailableDesignNotice() {
  return (
    <div
      data-testid="unavailable-design-notice"
      className="border-line-soft bg-canvas-deep/60 rounded-2xl border p-4 text-sm"
    >
      <p>
        <strong>That design is not available.</strong> We could not attach the design
        from your link, so this will reach us as a general enquiry. Please describe what
        you have in mind in the notes.{' '}
        <Link
          href={routes.work}
          className="text-brand-700 underline underline-offset-4"
        >
          Browse our work
        </Link>{' '}
        to pick another design.
      </p>
    </div>
  );
}
