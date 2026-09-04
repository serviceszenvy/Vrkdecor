import Link from 'next/link';
import { Badge } from '@/components/ui';
import { requireAdminContext } from '@/lib/auth/admin';
import { ENQUIRY_STATUSES, type EnquiryStatus } from '@/lib/db/types';
import {
  AdminCard,
  AdminFilterNav,
  AdminPageHeading,
  AdminRow,
  AdminShell,
} from '@/features/admin/components/admin-shell';
import { ENQUIRY_STATUS_LABELS } from '@/features/admin/components/enquiry-form';
import { listAdminEnquiries } from '@/features/admin/data';

export const dynamic = 'force-dynamic';

/**
 * The enquiry inbox.
 *
 * This page is the internal notification. Requirements & SOW section 11 says
 * VRK Decor receives no email when a lead arrives, so an unanswered enquiry has
 * to be visible here and nowhere else.
 *
 * The list shows what is needed to triage: who, where, when, which design, and
 * whether the customer was sent a confirmation. It does NOT show the notes or
 * the private images, which belong on the detail page behind a deliberate
 * click rather than on a screen someone might have open in an office.
 */
export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { admin, supabase } = await requireAdminContext();

  const params = await searchParams;
  const requested = typeof params.status === 'string' ? params.status : '';
  const status = (ENQUIRY_STATUSES as readonly string[]).includes(requested)
    ? (requested as EnquiryStatus)
    : undefined;

  const enquiries = await listAdminEnquiries(supabase, { status });

  return (
    <AdminShell admin={admin} current="/admin/enquiries">
      <AdminPageHeading
        title="Enquiries"
        lead="Every quote request from the website. Nobody is emailed when one arrives, so this is the inbox."
      />

      <AdminFilterNav
        label="Filter by pipeline step"
        active={status ?? ''}
        options={[
          { value: '', label: 'All', href: '/admin/enquiries' },
          ...ENQUIRY_STATUSES.map((value) => ({
            value,
            label: ENQUIRY_STATUS_LABELS[value] ?? value,
            href: `/admin/enquiries?status=${value}`,
          })),
        ]}
      />

      <AdminCard padded={enquiries.length === 0}>
        {enquiries.length === 0 ? (
          <p className="text-ink-muted text-sm" data-testid="no-enquiries">
            No enquiries here yet.
          </p>
        ) : (
          <ul data-testid="enquiry-list">
            {enquiries.map((enquiry) => (
              <AdminRow key={enquiry.id}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Link
                    href={`/admin/enquiries/${enquiry.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                    data-testid="enquiry-link"
                  >
                    {enquiry.name}
                  </Link>

                  <Badge tone={enquiry.status === 'new' ? 'accent' : 'neutral'}>
                    {ENQUIRY_STATUS_LABELS[enquiry.status] ?? enquiry.status}
                  </Badge>

                  {enquiry.referenceImageCount > 0 ? (
                    <Badge tone="neutral">
                      {enquiry.referenceImageCount} image
                      {enquiry.referenceImageCount === 1 ? '' : 's'}
                    </Badge>
                  ) : null}

                  <span className="text-ink-muted ml-auto text-sm">
                    {new Date(enquiry.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>

                <p className="text-ink-muted mt-1 text-sm">
                  {enquiry.event_type} · {enquiry.city}
                  {enquiry.event_date
                    ? ` · ${new Date(enquiry.event_date).toLocaleDateString('en-GB')}`
                    : ''}
                  {enquiry.designName ? ` · ${enquiry.designName}` : ''}
                </p>
              </AdminRow>
            ))}
          </ul>
        )}
      </AdminCard>
    </AdminShell>
  );
}
