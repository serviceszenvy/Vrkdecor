import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge, Button, ButtonLink } from '@/components/ui';
import { requireAdminContext } from '@/lib/auth/admin';
import { resolveImageUrl } from '@/features/portfolio/image-url';
import {
  AdminCard,
  AdminPageHeading,
  AdminShell,
  StatusBadge,
} from '@/features/admin/components/admin-shell';
import { DesignForm } from '@/features/admin/components/design-form';
import {
  AltTextForm,
  ImageUploadForm,
  VideoForm,
} from '@/features/admin/components/media-forms';
import {
  deleteDesignImageAction,
  deleteDesignVideoAction,
  moveDesignImageAction,
  setCoverImageAction,
} from '@/features/admin/actions/media';
import { setDesignStatusAction } from '@/features/admin/actions/designs';
import {
  getAdminDesign,
  listAllOccasions,
  listAllServices,
  listAllStyles,
} from '@/features/admin/data';

export const dynamic = 'force-dynamic';

/**
 * Edit one design: details, photographs, cover, order, alt text, videos and
 * publication.
 *
 * Everything on this page posts to a Server Action, so it works with
 * JavaScript disabled and Next.js verifies the request Origin before any of
 * them runs. Reordering is "move up / move down" rather than drag and drop for
 * the same reason: it is operable from a keyboard, needs no client state, and
 * the swap happens inside one database transaction.
 */
export default async function AdminDesignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { admin, supabase } = await requireAdminContext();
  const { id } = await params;
  const query = await searchParams;

  const detail = await getAdminDesign(supabase, id);
  // Missing and not-visible are the same answer. An admin whose account was
  // disabled between requests learns nothing about what exists.
  if (!detail) notFound();

  const [occasions, styles, services] = await Promise.all([
    listAllOccasions(supabase),
    listAllStyles(supabase),
    listAllServices(supabase),
  ]);

  const { design, images, videos, styleIds, serviceIds } = detail;
  const cover = images.find((image) => image.is_cover) ?? null;
  const related = images.filter((image) => !image.is_cover);

  const notice = describeNotice(query);

  return (
    <AdminShell admin={admin} current="/admin/designs">
      <AdminPageHeading
        title={design.name}
        lead={`${design.slug} · last edited ${new Date(design.updated_at).toLocaleDateString('en-GB')}`}
        actions={
          <>
            <ButtonLink href="/admin/designs" variant="ghost" size="md">
              Back to designs
            </ButtonLink>
            {design.status === 'published' ? (
              <ButtonLink
                href={`/our-work/${design.slug}`}
                variant="outline"
                size="md"
                external
              >
                View on the website
              </ButtonLink>
            ) : null}
          </>
        }
      />

      {notice ? (
        <p
          role="status"
          data-testid="design-notice"
          className={
            notice.tone === 'error'
              ? 'rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900'
              : 'border-accent-400/70 bg-accent-50 text-accent-900 rounded-2xl border p-4 text-sm'
          }
        >
          {notice.message}
        </p>
      ) : null}

      <AdminCard
        title="Publication"
        description="Only published designs appear on the website. A design needs a cover image before it can be published."
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={design.status} />
          {cover ? null : <Badge tone="neutral">No cover image yet</Badge>}

          <div className="ml-auto flex flex-wrap gap-2">
            {design.status !== 'published' ? (
              <form action={setDesignStatusAction}>
                <input type="hidden" name="designId" value={design.id} />
                <input type="hidden" name="status" value="published" />
                <Button type="submit" variant="primary" size="sm" data-testid="publish">
                  Publish
                </Button>
              </form>
            ) : (
              <form action={setDesignStatusAction}>
                <input type="hidden" name="designId" value={design.id} />
                <input type="hidden" name="status" value="draft" />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  data-testid="unpublish"
                >
                  Unpublish
                </Button>
              </form>
            )}

            {design.status !== 'archived' ? (
              <form action={setDesignStatusAction}>
                <input type="hidden" name="designId" value={design.id} />
                <input type="hidden" name="status" value="archived" />
                <Button type="submit" variant="ghost" size="sm">
                  Archive
                </Button>
              </form>
            ) : null}
          </div>
        </div>
        <p className="text-ink-muted mt-3 text-xs">
          Archiving hides a design from the website but keeps it, so enquiries that came
          from it still point somewhere. Designs are never deleted for that reason.
        </p>
      </AdminCard>

      <AdminCard title="Details">
        <DesignForm
          design={design}
          occasions={occasions}
          styles={styles}
          services={services}
          selectedStyleIds={styleIds}
          selectedServiceIds={serviceIds}
        />
      </AdminCard>

      <AdminCard
        title="Photographs"
        description="The cover image is used on every card and listing. Related images share this design's occasion, styles, services and description."
      >
        <ImageUploadForm designId={design.id} hasCover={cover !== null} />

        <div className="mt-8 flex flex-col gap-6">
          <div>
            <h3 className="font-display mb-2 text-lg font-medium">Cover image</h3>
            {cover ? (
              <ImageRow
                designId={design.id}
                image={cover}
                isCover
                canMoveUp={false}
                canMoveDown={false}
              />
            ) : (
              <p className="text-ink-muted text-sm" data-testid="no-cover">
                No cover image yet. Upload one with “Use as the cover image” ticked.
              </p>
            )}
          </div>

          <div>
            <h3 className="font-display mb-2 text-lg font-medium">
              Related images ({related.length})
            </h3>
            {related.length === 0 ? (
              <p className="text-ink-muted text-sm">
                No related images yet. They appear in the gallery and each one can start
                a quote request for this design.
              </p>
            ) : (
              <ul className="flex flex-col gap-4" data-testid="related-images">
                {related.map((image, index) => (
                  <li key={image.id}>
                    <ImageRow
                      designId={design.id}
                      image={image}
                      isCover={false}
                      canMoveUp={index > 0}
                      canMoveDown={index < related.length - 1}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Videos"
        description="Phase 1 links to a video hosted elsewhere rather than uploading one. Only YouTube, Instagram and Vimeo links are accepted."
      >
        {videos.length > 0 ? (
          <ul className="divide-line-soft mb-6 divide-y">
            {videos.map((video) => (
              <li key={video.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="text-sm font-medium">{video.provider}</span>
                <span className="text-ink-muted truncate text-sm">{video.url}</span>
                <form action={deleteDesignVideoAction} className="ml-auto">
                  <input type="hidden" name="designId" value={design.id} />
                  <input type="hidden" name="videoId" value={video.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}

        <VideoForm designId={design.id} />
      </AdminCard>
    </AdminShell>
  );
}

function ImageRow({
  designId,
  image,
  isCover,
  canMoveUp,
  canMoveDown,
}: {
  designId: string;
  image: {
    id: string;
    storage_key: string;
    alt_text: string | null;
    width: number | null;
    height: number | null;
  };
  isCover: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const src = safeImageUrl(image.storage_key);

  return (
    <div
      className="border-line-soft flex flex-wrap gap-4 rounded-xl border p-3"
      data-testid="admin-image"
      data-image-id={image.id}
    >
      <div className="bg-surface-muted relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
        {src ? (
          <Image
            src={src}
            alt={image.alt_text ?? ''}
            fill
            sizes="128px"
            className="object-cover"
          />
        ) : (
          <span className="text-ink-muted flex h-full items-center justify-center text-xs">
            Preview unavailable
          </span>
        )}
      </div>

      <div className="min-w-[16rem] flex-1">
        <AltTextForm designId={designId} imageId={image.id} altText={image.alt_text} />
      </div>

      <div className="flex flex-col gap-2">
        {image.width && image.height ? (
          <p className="text-ink-muted text-xs">
            {image.width} × {image.height}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {!isCover ? (
            <form action={setCoverImageAction}>
              <input type="hidden" name="designId" value={designId} />
              <input type="hidden" name="imageId" value={image.id} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                data-testid="make-cover"
              >
                Make cover
              </Button>
            </form>
          ) : null}

          {canMoveUp ? (
            <form action={moveDesignImageAction}>
              <input type="hidden" name="designId" value={designId} />
              <input type="hidden" name="imageId" value={image.id} />
              <input type="hidden" name="direction" value="up" />
              <Button type="submit" variant="ghost" size="sm" aria-label="Move earlier">
                ↑
              </Button>
            </form>
          ) : null}

          {canMoveDown ? (
            <form action={moveDesignImageAction}>
              <input type="hidden" name="designId" value={designId} />
              <input type="hidden" name="imageId" value={image.id} />
              <input type="hidden" name="direction" value="down" />
              <Button type="submit" variant="ghost" size="sm" aria-label="Move later">
                ↓
              </Button>
            </form>
          ) : null}

          <form action={deleteDesignImageAction}>
            <input type="hidden" name="designId" value={designId} />
            <input type="hidden" name="imageId" value={image.id} />
            <Button type="submit" variant="ghost" size="sm">
              Delete
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * A preview URL, or null.
 *
 * `resolveImageUrl` throws for a private reference key and for an unconfigured
 * environment, both of which are conditions this page should survive rather
 * than crash on: an admin editing a design does not need the preview badly
 * enough to lose the page over it.
 */
function safeImageUrl(storageKey: string): string | null {
  try {
    return resolveImageUrl(storageKey);
  } catch {
    return null;
  }
}

function describeNotice(
  query: Record<string, string | string[] | undefined>,
): { tone: 'error' | 'ok'; message: string } | null {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const error = first(query.error);
  if (error === 'cover-required') {
    return {
      tone: 'error',
      message:
        'This design needs a cover image before it can be published. Upload one with “Use as the cover image” ticked.',
    };
  }
  if (error) {
    return {
      tone: 'error',
      message: 'That change could not be saved. Please try again.',
    };
  }

  if (first(query.created) === '1') {
    return {
      tone: 'ok',
      message: 'Design created. Add photographs and a cover image, then publish it.',
    };
  }

  const status = first(query.status);
  if (status === 'published') return { tone: 'ok', message: 'Design published.' };
  if (status === 'draft') {
    return {
      tone: 'ok',
      message: 'Design unpublished. It is no longer on the website.',
    };
  }
  if (status === 'archived') return { tone: 'ok', message: 'Design archived.' };

  const saved = first(query.saved);
  if (saved === 'cover') return { tone: 'ok', message: 'Cover image updated.' };
  if (saved === 'order') return { tone: 'ok', message: 'Image order updated.' };
  if (saved === 'delete') return { tone: 'ok', message: 'Image deleted.' };
  if (saved === 'video') return { tone: 'ok', message: 'Video removed.' };

  return null;
}
