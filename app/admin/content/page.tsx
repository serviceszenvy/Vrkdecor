import { Badge } from '@/components/ui';
import { requireAdminContext } from '@/lib/auth/admin';
import { PARTNER_VENDOR_LABEL } from '@/lib/content';
import {
  AdminCard,
  AdminPageHeading,
  AdminShell,
} from '@/features/admin/components/admin-shell';
import {
  OccasionForm,
  ServiceForm,
  StyleForm,
} from '@/features/admin/components/content-forms';
import {
  listAllOccasions,
  listAllServices,
  listAllStyles,
} from '@/features/admin/data';

export const dynamic = 'force-dynamic';

/**
 * Occasions, styles and services.
 *
 * These three are the vocabulary the whole site is built on: the occasion and
 * service lists drive the public pages and the quote form, and all three drive
 * the portfolio filters. Because a design refers to them and their slugs are
 * public URLs, terms are switched to inactive rather than deleted; the
 * reasoning is in `features/admin/actions/content.ts`.
 */
export default async function AdminContentPage() {
  const { admin, supabase } = await requireAdminContext();

  const [occasions, styles, services] = await Promise.all([
    listAllOccasions(supabase),
    listAllStyles(supabase),
    listAllServices(supabase),
  ]);

  return (
    <AdminShell admin={admin} current="/admin/content">
      <AdminPageHeading
        title="Occasions, styles and services"
        lead="The vocabulary the website filters and the quote form are built on. Switch a term to inactive rather than deleting it."
      />

      <AdminCard
        title="Occasions"
        description="Each design has one occasion. Shown on the Occasions page and offered on the quote form."
      >
        <ul className="divide-line-soft mb-6 divide-y" data-testid="occasion-list">
          {occasions.map((occasion) => (
            <li key={occasion.id} className="flex flex-wrap items-center gap-3 py-2">
              <span className="font-medium">{occasion.name}</span>
              {occasion.secondary_term ? (
                <span className="text-ink-muted text-sm">
                  {occasion.secondary_term}
                </span>
              ) : null}
              <Badge tone={occasion.status === 'active' ? 'brand' : 'neutral'}>
                {occasion.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-ink-muted ml-auto text-sm">{occasion.slug}</span>
            </li>
          ))}
        </ul>

        <details>
          <summary className="min-h-11 cursor-pointer text-sm font-medium">
            Add or edit an occasion
          </summary>
          <div className="mt-4 flex flex-col gap-8">
            <OccasionForm />
            {occasions.map((occasion) => (
              <div key={occasion.id} className="border-line-soft border-t pt-6">
                <h3 className="mb-3 text-sm font-medium">Edit: {occasion.name}</h3>
                <OccasionForm occasion={occasion} />
              </div>
            ))}
          </div>
        </details>
      </AdminCard>

      <AdminCard
        title="Styles"
        description="A design may carry several. They drive the style filter in the portfolio."
      >
        <ul className="divide-line-soft mb-6 divide-y" data-testid="style-list">
          {styles.map((style) => (
            <li key={style.id} className="flex flex-wrap items-center gap-3 py-2">
              <span className="font-medium">{style.name}</span>
              <Badge tone={style.status === 'active' ? 'brand' : 'neutral'}>
                {style.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-ink-muted ml-auto text-sm">{style.slug}</span>
            </li>
          ))}
        </ul>

        <details>
          <summary className="min-h-11 cursor-pointer text-sm font-medium">
            Add or edit a style
          </summary>
          <div className="mt-4 flex flex-col gap-8">
            <StyleForm />
            {styles.map((style) => (
              <div key={style.id} className="border-line-soft border-t pt-6">
                <h3 className="mb-3 text-sm font-medium">Edit: {style.name}</h3>
                <StyleForm style={style} />
              </div>
            ))}
          </div>
        </details>
      </AdminCard>

      <AdminCard
        title="Services"
        description="Shown on the Services page, offered on the quote form, and used to filter the portfolio."
      >
        <ul className="divide-line-soft mb-6 divide-y" data-testid="service-list">
          {services.map((service) => (
            <li key={service.id} className="flex flex-wrap items-center gap-3 py-2">
              <span className="font-medium">{service.name}</span>
              {service.delivery_model === 'partner_vendor' ? (
                <Badge tone="neutral">{PARTNER_VENDOR_LABEL}</Badge>
              ) : null}
              <Badge tone={service.status === 'active' ? 'brand' : 'neutral'}>
                {service.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-ink-muted ml-auto text-sm">{service.slug}</span>
            </li>
          ))}
        </ul>

        <details>
          <summary className="min-h-11 cursor-pointer text-sm font-medium">
            Add or edit a service
          </summary>
          <div className="mt-4 flex flex-col gap-8">
            <ServiceForm />
            {services.map((service) => (
              <div key={service.id} className="border-line-soft border-t pt-6">
                <h3 className="mb-3 text-sm font-medium">Edit: {service.name}</h3>
                <ServiceForm service={service} />
              </div>
            ))}
          </div>
        </details>
      </AdminCard>
    </AdminShell>
  );
}
