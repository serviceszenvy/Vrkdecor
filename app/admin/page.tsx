import Link from 'next/link';
import { ButtonLink } from '@/components/ui';
import { requireAdminContext } from '@/lib/auth/admin';
import {
  AdminCard,
  AdminPageHeading,
  AdminRow,
  AdminShell,
} from '@/features/admin/components/admin-shell';
import { ENQUIRY_STATUS_LABELS } from '@/features/admin/components/enquiry-form';
import { getAdminDashboardCounts, listAdminEnquiries } from '@/features/admin/data';

export const dynamic = 'force-dynamic';

/**
 * The Admin Panel overview.
 *
 * The first thing it shows is new enquiries, because the Admin Panel IS the
 * internal enquiry notification (Requirements & SOW section 11): nobody is
 * emailed when a lead arrives, so this page has to make an unanswered one
 * obvious the moment someone signs in.
 */
export default async function AdminOverviewPage() {
  const { admin, supabase } = await requireAdminContext();

  const [counts, recent] = await Promise.all([
    getAdminDashboardCounts(supabase),
    listAdminEnquiries(supabase, { limit: 8 }),
  ]);

  return (
    <AdminShell admin={admin} current="/admin">
      <AdminPageHeading
        title="Overview"
        lead="New enquiries arrive here. Nobody is emailed when one does, so this is the inbox."
        actions={
          <>
            <ButtonLink href="/admin/enquiries" variant="primary" size="md">
              Open enquiries
            </ButtonLink>
            <ButtonLink href="/admin/designs/new" variant="outline" size="md">
              Add a design
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New enquiries" value={counts.newEnquiries} highlight />
        <Stat label="Enquiries in total" value={counts.enquiries} />
        <Stat label="Published designs" value={counts.published} />
        <Stat label="Designs in draft" value={counts.drafts} />
      </div>

      <AdminCard title="Latest enquiries" padded={recent.length === 0}>
        {recent.length === 0 ? (
          <p className="text-ink-muted text-sm" data-testid="no-enquiries">
            No enquiries yet. When someone sends one from the website it appears here.
          </p>
        ) : (
          <ul data-testid="recent-enquiries">
            {recent.map((enquiry) => (
              <AdminRow key={enquiry.id}>
                <Link
                  href={`/admin/enquiries/${enquiry.id}`}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 underline-offset-4 hover:underline"
                >
                  <span className="font-medium">{enquiry.name}</span>
                  <span className="text-ink-muted text-sm">
                    {enquiry.city} ·{' '}
                    {ENQUIRY_STATUS_LABELS[enquiry.status] ?? enquiry.status}
                  </span>
                  {enquiry.designName ? (
                    <span className="text-ink-muted text-sm">{enquiry.designName}</span>
                  ) : null}
                </Link>
              </AdminRow>
            ))}
          </ul>
        )}
      </AdminCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Packages" value={counts.packages} />
        <Stat label="Testimonials awaiting review" value={counts.pendingTestimonials} />
        <Stat label="Designs" value={counts.designs} />
      </div>
    </AdminShell>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? 'border-brand-300 from-brand-50 to-surface-tint shadow-card rounded-2xl border bg-gradient-to-br p-5'
          : 'border-line-soft bg-surface shadow-card rounded-2xl border p-5'
      }
    >
      <p
        className={
          highlight
            ? 'font-display text-brand-800 text-3xl font-medium'
            : 'font-display text-ink text-3xl font-medium'
        }
      >
        {value}
      </p>
      <p className="text-ink-muted mt-0.5 text-sm">{label}</p>
    </div>
  );
}
