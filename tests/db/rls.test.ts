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
 * Row Level Security verification.
 *
 * Source of truth: Technical Development Specification section 13.
 * These tests exercise the real policies in `supabase/migrations/` against a
 * real PostgreSQL instance, acting as the `anon` and `authenticated` roles with
 * the same request claims Supabase derives from a JWT.
 */

describe('anonymous visitors', () => {
  it('can read a published design', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, ANON);

      const { rows } = await client.query('select id from public.designs');
      expect(rows.map((r) => r.id)).toEqual([fx.publishedDesignId]);
    });
  });

  it('cannot see a draft design, even by its exact id', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, ANON);

      const { rows } = await client.query(
        'select id from public.designs where id = $1',
        [fx.draftDesignId],
      );
      expect(rows).toHaveLength(0);
    });
  });

  it('cannot see media belonging to a draft design, even by its exact id', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, ANON);

      const { rows } = await client.query(
        'select id from public.design_images where id = $1',
        [fx.draftImageId],
      );
      expect(rows).toHaveLength(0);
    });
  });

  it('can see media belonging to a published design', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, ANON);

      const { rows } = await client.query(
        'select id from public.design_images where id = $1',
        [fx.publishedImageId],
      );
      expect(rows).toHaveLength(1);
    });
  });

  it('is denied access to enquiries', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, ANON);

      await expect(client.query('select * from public.enquiries')).rejects.toThrow(
        /permission denied/i,
      );
    });
  });

  it('is denied access to private reference images', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, ANON);

      await expect(
        client.query('select * from public.reference_images'),
      ).rejects.toThrow(/permission denied/i);
    });
  });

  it('is denied access to admin user records', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, ANON);

      await expect(client.query('select * from public.admin_users')).rejects.toThrow(
        /permission denied/i,
      );
    });
  });

  it('cannot create an enquiry directly; enquiries are created server-side', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, ANON);

      await expect(
        client.query(
          `insert into public.enquiries (name, phone, event_type, city, consent)
           values ('Attacker', '+910000000000', 'Wedding', 'Nagercoil', true)`,
        ),
      ).rejects.toThrow(/permission denied/i);
    });
  });

  it('cannot mutate portfolio content', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, ANON);

      const insertError = await attempt(
        client,
        `insert into public.designs (name, slug, occasion_id) values ('Hacked', 'hacked', $1)`,
        [fx.occasionId],
      );
      expect(insertError?.message).toMatch(/row-level security/i);

      // UPDATE and DELETE are not refused outright — the rows are simply
      // invisible, so they affect nothing. Both outcomes are acceptable; what
      // matters is that no row changes.
      const updated = await client.query(
        `update public.designs set name = 'Hacked' where id = $1`,
        [fx.publishedDesignId],
      );
      expect(updated.rowCount).toBe(0);

      const deleted = await client.query('delete from public.designs where id = $1', [
        fx.publishedDesignId,
      ]);
      expect(deleted.rowCount).toBe(0);
    });
  });

  it('cannot create objects in the public schema', async () => {
    await inRollbackTransaction(async (client) => {
      await actAs(client, ANON);
      await expect(
        client.query('create table public.injected (id int)'),
      ).rejects.toThrow(/permission denied/i);
    });
  });
});

describe('signed-in users who are not admins', () => {
  it('cannot read enquiries — authentication is not authorization', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      const { rows } = await client.query('select id from public.enquiries');
      expect(rows).toHaveLength(0);
    });
  });

  it('cannot read private reference images', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      const { rows } = await client.query('select id from public.reference_images');
      expect(rows).toHaveLength(0);
    });
  });

  it('cannot read the admin roster', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      const { rows } = await client.query('select user_id from public.admin_users');
      expect(rows).toHaveLength(0);
    });
  });

  it('cannot see draft designs', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      const { rows } = await client.query(
        'select id from public.designs where id = $1',
        [fx.draftDesignId],
      );
      expect(rows).toHaveLength(0);
    });
  });

  it('cannot mutate portfolio content', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      await expect(
        client.query(
          `insert into public.designs (name, slug, occasion_id) values ('Hacked', 'hacked', $1)`,
          [fx.occasionId],
        ),
      ).rejects.toThrow(/row-level security/i);
    });
  });

  it('cannot escalate by inserting itself into admin_users', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      await expect(
        client.query(
          `insert into public.admin_users (user_id, email) values ($1, 'x@example.test')`,
          [fx.outsiderUserId],
        ),
      ).rejects.toThrow(/permission denied|row-level security/i);
    });
  });
});

describe('disabled admins', () => {
  it('lose access to enquiries as soon as they are disabled', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.disabledAdminUserId);

      const { rows } = await client.query('select id from public.enquiries');
      expect(rows).toHaveLength(0);
    });
  });

  it('lose access to draft designs', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.disabledAdminUserId);

      const { rows } = await client.query(
        'select id from public.designs where id = $1',
        [fx.draftDesignId],
      );
      expect(rows).toHaveLength(0);
    });
  });
});

describe('active admins', () => {
  it('can read draft and published designs', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows } = await client.query('select id from public.designs');
      expect(rows.map((r) => r.id).sort()).toEqual(
        [fx.publishedDesignId, fx.draftDesignId].sort(),
      );
    });
  });

  it('can read enquiries and their private reference images', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const enquiries = await client.query('select id from public.enquiries');
      expect(enquiries.rows.map((r) => r.id)).toEqual([fx.enquiryId]);

      const references = await client.query('select id from public.reference_images');
      expect(references.rows.map((r) => r.id)).toEqual([fx.referenceImageId]);
    });
  });

  it('can publish a design and manage its media', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const updated = await client.query(
        `update public.designs set status = 'published', published_at = now() where id = $1`,
        [fx.draftDesignId],
      );
      expect(updated.rowCount).toBe(1);

      const inserted = await client.query(
        `insert into public.design_images (design_id, storage_key, sort_order)
         values ($1, 'portfolio/new/related-1.webp', 1) returning id`,
        [fx.draftDesignId],
      );
      expect(inserted.rowCount).toBe(1);
    });
  });

  it('can move an enquiry through the pipeline', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const updated = await client.query(
        `update public.enquiries set status = 'contacted' where id = $1`,
        [fx.enquiryId],
      );
      expect(updated.rowCount).toBe(1);
    });
  });

  it('still cannot grant admin rights from a client connection', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      await expect(
        client.query(
          `insert into public.admin_users (user_id, email) values ($1, 'new@example.test')`,
          [fx.outsiderUserId],
        ),
      ).rejects.toThrow(/permission denied|row-level security/i);
    });
  });
});

describe('every public table has RLS enabled', () => {
  it('leaves no table unprotected', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);
      const { rows } = await client.query<{ tablename: string; rowsecurity: boolean }>(
        `select tablename, rowsecurity from pg_tables where schemaname = 'public'`,
      );

      expect(rows.length).toBeGreaterThan(0);
      const unprotected = rows.filter((r) => !r.rowsecurity).map((r) => r.tablename);
      expect(unprotected).toEqual([]);
    });
  });
});

/**
 * Portfolio relationships under RLS (P5).
 *
 * The public portfolio joins designs to their occasion, styles, services,
 * images and videos. Every one of those child rows must disappear with an
 * unpublished parent, or a draft design would leak through a join.
 */
describe('portfolio tree visibility', () => {
  it('hides every child row of a draft design from anonymous visitors', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      const { rows: styleRows } = await client.query<{ id: string }>(
        `select id from public.styles limit 1`,
      );
      const { rows: serviceRows } = await client.query<{ id: string }>(
        `select id from public.services limit 1`,
      );

      for (const designId of [fx.publishedDesignId, fx.draftDesignId]) {
        await client.query(
          `insert into public.design_styles (design_id, style_id) values ($1, $2)`,
          [designId, styleRows[0]!.id],
        );
        await client.query(
          `insert into public.design_services (design_id, service_id) values ($1, $2)`,
          [designId, serviceRows[0]!.id],
        );
        await client.query(
          `insert into public.design_videos (design_id, provider, url)
           values ($1, 'youtube', 'https://www.youtube.com/watch?v=x')`,
          [designId],
        );
      }

      await actAs(client, ANON);

      for (const table of ['design_styles', 'design_services', 'design_videos']) {
        const { rows } = await client.query(
          `select design_id from public.${table} where design_id = $1`,
          [fx.draftDesignId],
        );
        expect(rows, `${table} must hide draft rows`).toHaveLength(0);

        const visible = await client.query(
          `select design_id from public.${table} where design_id = $1`,
          [fx.publishedDesignId],
        );
        expect(
          visible.rows.length,
          `${table} must show published rows`,
        ).toBeGreaterThan(0);
      }
    });
  });

  it('keeps a published design joinable to its full public tree', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, ANON);

      const { rows } = await client.query(
        `select d.id, d.name, o.name as occasion, i.id as image_id
         from public.designs d
         left join public.occasions o on o.id = d.occasion_id
         left join public.design_images i on i.design_id = d.id
         where d.id = $1`,
        [fx.publishedDesignId],
      );

      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]?.occasion).toBeTruthy();
      expect(rows[0]?.image_id).toBe(fx.publishedImageId);
    });
  });

  it('never lets a photograph exist without a parent design', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.design_images (design_id, storage_key) values (null, 'orphan.webp')`,
      );
      expect(error?.message).toMatch(/not-null|null value/i);
    });
  });
});
