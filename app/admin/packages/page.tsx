import { Badge } from '@/components/ui';
import { requireAdminContext } from '@/lib/auth/admin';
import {
  AdminCard,
  AdminPageHeading,
  AdminShell,
  StatusBadge,
} from '@/features/admin/components/admin-shell';
import { PackageForm } from '@/features/admin/components/content-forms';
import { listAllPackages } from '@/features/admin/data';

export const dynamic = 'force-dynamic';

/**
 * Packages.
 *
 * The only place on the website where a price may appear, and only as an
 * approved "starting from" figure (Requirements & SOW section 16). Individual
 * designs stay on custom quotes.
 */
export default async function AdminPackagesPage() {
  const { admin, supabase } = await requireAdminContext();
  const packages = await listAllPackages(supabase);

  return (
    <AdminShell admin={admin} current="/admin/packages">
      <AdminPageHeading
        title="Packages"
        lead="Grouped offerings shown on the Packages page. Only published packages appear on the website."
      />

      <AdminCard title="Add a package">
        <PackageForm />
      </AdminCard>

      {packages.length === 0 ? (
        <AdminCard>
          <p className="text-ink-muted text-sm" data-testid="no-packages">
            No packages yet.
          </p>
        </AdminCard>
      ) : (
        packages.map((pkg) => (
          <AdminCard key={pkg.id} id={`package-${pkg.id}`}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-xl font-medium">{pkg.name}</h2>
              <StatusBadge status={pkg.status} />
              {pkg.pricing_mode === 'starting_from' && pkg.starting_price !== null ? (
                <Badge tone="neutral">
                  From ₹{Math.round(pkg.starting_price / 100).toLocaleString('en-IN')}
                </Badge>
              ) : (
                <Badge tone="neutral">Custom quote</Badge>
              )}
            </div>
            <PackageForm pkg={pkg} />
          </AdminCard>
        ))
      )}
    </AdminShell>
  );
}
