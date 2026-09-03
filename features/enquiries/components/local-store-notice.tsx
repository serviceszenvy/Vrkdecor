/**
 * Shown whenever quote requests are being kept in this server's memory because
 * no database is configured.
 *
 * The invariant is the same one the sample portfolio content uses: it cannot
 * appear in staging or production, where Supabase is configured. It exists so
 * that nobody — a reviewer, a developer, VRK Decor during a walkthrough — can
 * submit the form on an unconfigured environment and believe the enquiry was
 * delivered.
 */
export function LocalStoreNotice() {
  return (
    <div
      data-local-enquiry-notice
      className="border-accent-400/70 bg-accent-50 text-accent-900 rounded-2xl border p-4 text-sm"
    >
      <p>
        <strong>Demonstration mode.</strong> No enquiry database is connected, so
        anything sent from this form is kept in memory for testing only. It is not
        delivered to VRK Decor and disappears when the server restarts.
      </p>
    </div>
  );
}
