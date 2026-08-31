import { afterAll, describe, expect, it } from 'vitest';
import { actAsOwner, closePool, inRollbackTransaction } from './helpers';
import type { Database } from '@/lib/db/types';

afterAll(closePool);

/**
 * Type/schema drift guard.
 *
 * `lib/db/types.ts` is hand-maintained because generating types needs a linked
 * Supabase project. This test introspects the migrated database and fails if
 * the TypeScript types and the real schema disagree, which gives the same
 * protection a generator would and runs in CI.
 */

const declaredTables = [
  'admin_users',
  'occasions',
  'services',
  'styles',
  'designs',
  'design_styles',
  'design_services',
  'design_images',
  'design_videos',
  'packages',
  'testimonials',
  'enquiries',
  'reference_images',
] as const satisfies readonly (keyof Database['public']['Tables'])[];

/** Columns declared in lib/db/types.ts, per table. */
const declaredColumns: Record<string, string[]> = {
  admin_users: ['user_id', 'email', 'role', 'status', 'created_at', 'updated_at'],
  occasions: [
    'id',
    'name',
    'secondary_term',
    'slug',
    'description',
    'status',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  services: [
    'id',
    'name',
    'slug',
    'description',
    'delivery_model',
    'status',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  styles: ['id', 'name', 'slug', 'status', 'sort_order', 'created_at', 'updated_at'],
  designs: [
    'id',
    'name',
    'slug',
    'occasion_id',
    'description',
    'location',
    'quote_mode',
    'starting_price',
    'featured',
    'status',
    'seo_title',
    'seo_description',
    'published_at',
    'created_at',
    'updated_at',
  ],
  design_styles: ['design_id', 'style_id'],
  design_services: ['design_id', 'service_id'],
  design_images: [
    'id',
    'design_id',
    'storage_key',
    'alt_text',
    'sort_order',
    'is_cover',
    'status',
    'width',
    'height',
    'created_at',
    'updated_at',
  ],
  design_videos: [
    'id',
    'design_id',
    'provider',
    'url',
    'caption',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  packages: [
    'id',
    'name',
    'slug',
    'description',
    'pricing_mode',
    'starting_price',
    'status',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  testimonials: [
    'id',
    'name',
    'body',
    'event_type',
    'approval_status',
    'display_order',
    'created_at',
    'updated_at',
  ],
  enquiries: [
    'id',
    'name',
    'phone',
    'email',
    'event_type',
    'event_date',
    'venue',
    'city',
    'guest_count',
    'budget',
    'required_services',
    'notes',
    'selected_design_id',
    'status',
    'consent',
    'internal_notes',
    'confirmation_email_sent_at',
    'created_at',
    'updated_at',
  ],
  reference_images: [
    'id',
    'enquiry_id',
    'design_id',
    'storage_key',
    'original_filename',
    'mime_type',
    'size_bytes',
    'created_at',
  ],
};

describe('lib/db/types.ts matches the migrated schema', () => {
  it('declares exactly the tables the migrations create', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);
      const { rows } = await client.query<{ table_name: string }>(
        `select table_name from information_schema.tables
         where table_schema = 'public' and table_type = 'BASE TABLE'
         order by table_name`,
      );

      expect(rows.map((r) => r.table_name)).toEqual([...declaredTables].sort());
    });
  });

  it('declares exactly the columns each table has', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);

      for (const table of declaredTables) {
        const { rows } = await client.query<{ column_name: string }>(
          `select column_name from information_schema.columns
           where table_schema = 'public' and table_name = $1
           order by column_name`,
          [table],
        );

        expect(
          rows.map((r) => r.column_name),
          table,
        ).toEqual([...declaredColumns[table]!].sort());
      }
    });
  });
});

describe('storage limits in lib/storage match the migrated buckets', () => {
  it('agrees on visibility, size limit and allowed types', async () => {
    const { BUCKETS } = await import('@/lib/storage/buckets');

    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);
      const { rows } = await client.query<{
        id: string;
        public: boolean;
        file_size_limit: string;
        allowed_mime_types: string[];
      }>('select id, public, file_size_limit, allowed_mime_types from storage.buckets');

      expect(rows).toHaveLength(2);

      for (const bucket of rows) {
        const declared = BUCKETS[bucket.id as keyof typeof BUCKETS];
        expect(declared, bucket.id).toBeDefined();
        expect(declared.public, bucket.id).toBe(bucket.public);
        expect(declared.maxBytes, bucket.id).toBe(Number(bucket.file_size_limit));
        expect([...declared.allowedMimeTypes], bucket.id).toEqual(
          bucket.allowed_mime_types,
        );
      }
    });
  });
});
