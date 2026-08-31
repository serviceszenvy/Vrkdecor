/**
 * Marks page copy that has been drafted from the system's actual behaviour but
 * has not yet been reviewed or approved. Used on the legal pages, which must be
 * checked by VRK Decor and their legal adviser before launch.
 *
 * P11/P12 must confirm every notice has been removed before production sign-off.
 */
export function DraftNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-draft-notice
      className="border-accent-400 bg-accent-50 text-accent-900 rounded-lg border p-4 text-sm"
    >
      <p>
        <strong>Draft, pending review.</strong> {children}
      </p>
    </div>
  );
}
