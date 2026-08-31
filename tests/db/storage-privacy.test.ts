import { afterAll, describe, expect, it } from 'vitest';
import {
  ANON,
  AUTHENTICATED,
  actAs,
  actAsOwner,
  attempt,
  closePool,
  inRollbackTransaction,
  seedFixtures,
} from './helpers';

afterAll(closePool);

/**
 * Storage privacy verification.
 *
 * Source of truth: Technical Development Specification section 11 and
 * Requirements & SOW section 13 — the portfolio bucket may be publicly
 * delivered, reference images must never be.
 */

describe('bucket configuration', () => {
  it('publishes the portfolio bucket and keeps the reference bucket private', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);
      const { rows } = await client.query<{
        id: string;
        public: boolean;
        file_size_limit: string;
        allowed_mime_types: string[];
      }>(
        'select id, public, file_size_limit, allowed_mime_types from storage.buckets order by id',
      );

      const buckets = Object.fromEntries(rows.map((r) => [r.id, r]));

      expect(buckets.portfolio?.public).toBe(true);
      expect(buckets.references?.public).toBe(false);
    });
  });

  it('rejects non-image uploads by MIME type at the bucket level', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);
      const { rows } = await client.query<{ id: string; allowed_mime_types: string[] }>(
        'select id, allowed_mime_types from storage.buckets',
      );

      for (const bucket of rows) {
        expect(bucket.allowed_mime_types.every((t) => t.startsWith('image/'))).toBe(
          true,
        );
        // No executables, archives, SVG (scriptable) or PDFs.
        expect(bucket.allowed_mime_types).not.toContain('image/svg+xml');
        expect(bucket.allowed_mime_types).not.toContain('application/pdf');
        expect(bucket.allowed_mime_types).not.toContain('application/zip');
      }
    });
  });

  it('caps object size on both buckets', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);
      const { rows } = await client.query<{ id: string; file_size_limit: string }>(
        'select id, file_size_limit from storage.buckets',
      );

      for (const bucket of rows) {
        expect(Number(bucket.file_size_limit)).toBeGreaterThan(0);
        expect(Number(bucket.file_size_limit)).toBeLessThanOrEqual(10 * 1024 * 1024);
      }
    });
  });
});

describe('anonymous access to storage', () => {
  it('can read portfolio objects', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, ANON);

      const { rows } = await client.query(
        `select name from storage.objects where bucket_id = 'portfolio'`,
      );
      expect(rows).toHaveLength(1);
    });
  });

  it('cannot read any reference object', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, ANON);

      const { rows } = await client.query(
        `select name from storage.objects where bucket_id = 'references'`,
      );
      expect(rows).toHaveLength(0);
    });
  });

  it('cannot read a reference object even knowing its exact key', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, ANON);

      const { rows } = await client.query(
        `select name from storage.objects
         where bucket_id = 'references' and name = 'private/inspiration.jpg'`,
      );
      expect(rows).toHaveLength(0);
    });
  });

  it('cannot upload to either bucket', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, ANON);

      for (const bucket of ['portfolio', 'references']) {
        const error = await attempt(
          client,
          `insert into storage.objects (bucket_id, name) values ($1, 'evil.php')`,
          [bucket],
        );
        expect(error?.message, bucket).toMatch(/row-level security/i);
      }
    });
  });
});

describe('signed-in non-admin access to storage', () => {
  it('cannot read reference objects', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      const { rows } = await client.query(
        `select name from storage.objects where bucket_id = 'references'`,
      );
      expect(rows).toHaveLength(0);
    });
  });

  it('cannot write portfolio objects', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      await expect(
        client.query(
          `insert into storage.objects (bucket_id, name) values ('portfolio', 'fake.webp')`,
        ),
      ).rejects.toThrow(/row-level security/i);
    });
  });
});

describe('admin access to storage', () => {
  it('can read reference objects', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows } = await client.query(
        `select name from storage.objects where bucket_id = 'references'`,
      );
      expect(rows).toHaveLength(1);
    });
  });

  it('can manage portfolio objects', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const inserted = await client.query(
        `insert into storage.objects (bucket_id, name) values ('portfolio', 'new/photo.webp')`,
      );
      expect(inserted.rowCount).toBe(1);
    });
  });

  it('cannot upload into the private reference bucket from the browser', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      // Reference images are written only by the server during enquiry
      // submission; no client role has INSERT on that bucket.
      await expect(
        client.query(
          `insert into storage.objects (bucket_id, name) values ('references', 'x.jpg')`,
        ),
      ).rejects.toThrow(/row-level security/i);
    });
  });

  it('cannot see disabled admins gain access after being disabled', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.disabledAdminUserId);

      const { rows } = await client.query(
        `select name from storage.objects where bucket_id = 'references'`,
      );
      expect(rows).toHaveLength(0);
    });
  });
});
