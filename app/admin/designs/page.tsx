import Link from 'next/link';
import { Badge, ButtonLink } from '@/components/ui';
import { requireAdminContext } from '@/lib/auth/admin';
import type { PublicationStatus } from '@/lib/db/types';
import {
  AdminCard,
  AdminFilterNav,
  AdminPageHeading,
  AdminRow,
  AdminShell,
  StatusBadge,
} from '@/features/admin/components/admin-shell';
import { listAdminDesigns } from '@/features/admin/data';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const;

/** The portfolio, as its owner sees it: drafts included. */
export default async function AdminDesignsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { admin, supabase } = await requireAdminContext();

  const params = await searchParams;
  const requested = typeof params.status === 'string' ? params.status : '';
  const status = FILTERS.some((filter) => filter.value === requested && filter.value)
    ? (requested as PublicationStatus)
    : undefined;

  const designs = await listAdminDesigns(supabase, { status });

  return (
    <AdminShell admin={admin} current="/admin/designs">
      <AdminPageHeading
        title="Designs"
        lead="Every celebration in the portfolio. Only published designs appear on the website."
        actions={
          <ButtonLink href="/admin/designs/new" variant="primary" size="md">
            Add a design
          </ButtonLink>
        }
      />

      <AdminFilterNav
        label="Filter by status"
        active={status ?? ''}
        options={FILTERS.map((filter) => ({
          value: filter.value,
          label: filter.label,
          href: filter.value
            ? `/admin/designs?status=${filter.value}`
            : '/admin/designs',
        }))}
      />

      <AdminCard padded={designs.length === 0}>
        {designs.length === 0 ? (
          <p className="text-ink-muted text-sm" data-testid="no-designs">
            No designs yet. Add one, upload a cover image, then publish it.
          </p>
        ) : (
          <ul data-testid="design-list">
            {designs.map((design) => (
              <AdminRow key={design.id} className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/admin/designs/${design.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {design.name}
                </Link>

                <StatusBadge status={design.status} />

                {design.featured ? <Badge tone="accent">Featured</Badge> : null}
                {!design.hasCover ? <Badge tone="neutral">No cover image</Badge> : null}

                <span className="text-ink-muted ml-auto text-sm">
                  {design.occasionName ?? 'No occasion'} · {design.imageCount} image
                  {design.imageCount === 1 ? '' : 's'}
                </span>
              </AdminRow>
            ))}
          </ul>
        )}
      </AdminCard>
    </AdminShell>
  );
}
