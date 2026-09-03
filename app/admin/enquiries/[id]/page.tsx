import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Button, ButtonLink } from '@/components/ui';
import { requireAdminContext } from '@/lib/auth/admin';
import { createReferenceSignedUrl } from '@/lib/storage/urls';
import {
  adminFollowUpMessage,
  customerTelHref,
  customerWhatsAppHref,
} from '@/lib/navigation';
import { occasions, services as approvedServices } from '@/lib/content';
import { deleteReferenceImageAction } from '@/features/admin/actions/enquiries';
import {
  AdminCard,
  AdminPageHeading,
  AdminShell,
} from '@/features/admin/components/admin-shell';
import { EnquiryPipelineForm } from '@/features/admin/components/enquiry-form';
import { getAdminEnquiry } from '@/features/admin/data';

export const dynamic = 'force-dynamic';

const occasionNames = new Map(
  occasions.map((occasion) => [occasion.slug, occasion.name]),
);
const serviceNames = new Map(
  approvedServices.map((service) => [service.slug, service.name]),
);

/**
 * One enquiry: the customer's own answers, the pipeline, internal notes, their
 * private reference images and the two ways VRK Decor actually follows up.
 *
 * The private images are the sensitive part of this page, so they are handled
 * deliberately:
 *
 *   - the ROWS are read through the admin's session client, so Row Level
 *     Security decides whether this person may see them at all
 *   - a signed URL is requested only for a row that came back, and it is
 *     requested with that same session client, so the storage policy has to
 *     agree too
 *   - the URL lasts five minutes
 *   - they are rendered with a plain `<img>`, NOT `next/image`. The image
 *     optimiser would fetch and cache a private photograph on disk under a URL
 *     derived from the signed one, which is exactly what a private bucket
 *     exists to prevent
 *   - `referrerPolicy="no-referrer"` so the signed URL never travels in a
 *     Referer header
 */
export default async function AdminEnquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { admin, supabase } = await requireAdminContext();
  const { id } = await params;

  const detail = await getAdminEnquiry(supabase, id);
  if (!detail) notFound();

  const { enquiry, design, referenceImages } = detail;

  const signed = await Promise.all(
    referenceImages.map(async (image) => ({
      image,
      url: await createReferenceSignedUrl(supabase, image.storage_key),
    })),
  );

  const followUp = adminFollowUpMessage(enquiry.name, design?.name ?? null);

  return (
    <AdminShell admin={admin} current="/admin/enquiries">
      <AdminPageHeading
        title={enquiry.name}
        lead={`Received ${new Date(enquiry.created_at).toLocaleString('en-GB')}`}
        actions={
          <>
            <ButtonLink href="/admin/enquiries" variant="ghost" size="md">
              Back to enquiries
            </ButtonLink>
            <ButtonLink
              href={customerTelHref(enquiry.phone)}
              variant="outline"
              size="md"
              data-testid="call-customer"
            >
              Call {enquiry.phone}
            </ButtonLink>
            <ButtonLink
              href={customerWhatsAppHref(enquiry.phone, followUp)}
              variant="primary"
              size="md"
              external
              data-testid="whatsapp-customer"
            >
              WhatsApp
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <AdminCard title="What the customer asked for">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Phone / WhatsApp" value={enquiry.phone} />
              <Detail label="Email" value={enquiry.email ?? 'Not given'} />
              <Detail
                label="Occasion"
                value={occasionNames.get(enquiry.event_type) ?? enquiry.event_type}
              />
              <Detail
                label="Event date"
                value={
                  enquiry.event_date
                    ? new Date(enquiry.event_date).toLocaleDateString('en-GB')
                    : 'Not given'
                }
              />
              <Detail label="Venue" value={enquiry.venue ?? 'Not given'} />
              <Detail label="City" value={enquiry.city} />
              <Detail
                label="Guests"
                value={enquiry.guest_count ? String(enquiry.guest_count) : 'Not given'}
              />
              <Detail label="Budget" value={enquiry.budget ?? 'Not given'} />
            </dl>

            <div className="mt-4">
              <p className="text-ink-muted text-sm font-medium">Services requested</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {enquiry.required_services.map((slug) => (
                  <li key={slug}>
                    <Badge tone="neutral">{serviceNames.get(slug) ?? slug}</Badge>
                  </li>
                ))}
              </ul>
            </div>

            {enquiry.notes ? (
              <div className="mt-4">
                <p className="text-ink-muted text-sm font-medium">Their notes</p>
                <p className="mt-1 text-sm whitespace-pre-line">{enquiry.notes}</p>
              </div>
            ) : null}
          </AdminCard>

          <AdminCard
            title="Inspiration images"
            description="Private to this enquiry. They are never published and the links below expire after five minutes."
          >
            {signed.length === 0 ? (
              <p className="text-ink-muted text-sm" data-testid="no-reference-images">
                The customer did not attach any.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-3" data-testid="reference-images">
                {signed.map(({ image, url }) => (
                  <li key={image.id} className="flex flex-col gap-2">
                    <div className="bg-surface-muted border-line-soft overflow-hidden rounded-lg border">
                      {url ? (
                        /*
                          A plain img, deliberately. `next/image` would fetch
                          this through the optimiser and cache a private
                          photograph on disk.
                        */
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={`Inspiration image sent by ${enquiry.name}`}
                          referrerPolicy="no-referrer"
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <p className="text-ink-muted p-4 text-xs">
                          This image could not be opened.
                        </p>
                      )}
                    </div>
                    <p className="text-ink-muted truncate text-xs">
                      {image.original_filename}
                    </p>
                    <form action={deleteReferenceImageAction}>
                      <input type="hidden" name="enquiryId" value={enquiry.id} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Delete
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>

        <div className="flex flex-col gap-6">
          <AdminCard title="Pipeline and notes">
            <EnquiryPipelineForm enquiry={enquiry} />
          </AdminCard>

          <AdminCard title="Where this came from">
            {design ? (
              <p className="text-sm">
                <Link
                  href={`/admin/designs/${design.id}`}
                  className="font-medium underline underline-offset-4"
                  data-testid="enquiry-design-link"
                >
                  {design.name}
                </Link>
                <span className="text-ink-muted block">
                  The customer chose this design, so there is no need to ask them to
                  describe it.
                </span>
              </p>
            ) : (
              <p className="text-ink-muted text-sm">
                A general enquiry, not started from a particular design.
              </p>
            )}

            <p className="text-ink-muted mt-4 text-sm">
              {enquiry.confirmation_email_sent_at
                ? `Confirmation email sent ${new Date(enquiry.confirmation_email_sent_at).toLocaleString('en-GB')}.`
                : enquiry.email
                  ? 'No confirmation email was sent to this customer.'
                  : 'No email address was given, so no confirmation was sent.'}
            </p>
          </AdminCard>
        </div>
      </div>
    </AdminShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-muted text-sm font-medium">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
