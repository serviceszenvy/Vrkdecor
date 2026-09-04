/**
 * Shown whenever the portfolio is rendering procedurally generated sample
 * content because no database is configured. It cannot appear in staging or
 * production, where Supabase is configured and real published Designs are
 * shown.
 */
export function SampleContentNotice() {
  return (
    <div
      data-sample-content-notice
      className="border-accent-400/70 bg-accent-50 text-accent-900 rounded-2xl border p-4 text-sm"
    >
      <p>
        <strong>Sample content.</strong> These designs and images are generated
        placeholders for layout review only. They are not VRK Decor&rsquo;s work, and
        they disappear as soon as the portfolio database is connected.
      </p>
    </div>
  );
}
