import { ButtonLink } from '@/components/ui';
import { requireAdminContext } from '@/lib/auth/admin';
import {
  AdminCard,
  AdminPageHeading,
  AdminShell,
} from '@/features/admin/components/admin-shell';
import { DesignForm } from '@/features/admin/components/design-form';
import {
  listAllOccasions,
  listAllServices,
  listAllStyles,
} from '@/features/admin/data';

export const dynamic = 'force-dynamic';

/**
 * Create a design.
 *
 * Images come after the design exists, because an image's storage key is
 * namespaced by its parent design's id. The form says so rather than pretending
 * a photograph can be attached to something that has not been created yet.
 */
export default async function NewDesignPage() {
  const { admin, supabase } = await requireAdminContext();

  const [occasions, styles, services] = await Promise.all([
    listAllOccasions(supabase),
    listAllStyles(supabase),
    listAllServices(supabase),
  ]);

  return (
    <AdminShell admin={admin} current="/admin/designs">
      <AdminPageHeading
        title="Add a design"
        lead="Enter the details first. Photographs, the cover image and publishing come next."
        actions={
          <ButtonLink href="/admin/designs" variant="ghost" size="md">
            Back to designs
          </ButtonLink>
        }
      />

      <AdminCard>
        <DesignForm
          design={null}
          occasions={occasions}
          styles={styles}
          services={services}
          selectedStyleIds={[]}
          selectedServiceIds={[]}
        />
      </AdminCard>
    </AdminShell>
  );
}
