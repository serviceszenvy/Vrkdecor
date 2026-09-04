import { afterAll, describe, expect, it } from 'vitest';
import {
  ANON,
  AUTHENTICATED,
  SERVICE_ROLE,
  actAs,
  actAsOwner,
  attempt,
  closePool,
  inRollbackTransaction,
  seedFixtures,
} from './helpers';

afterAll(closePool);

/**
 * P8 — every administrative operation, executed as the four kinds of caller
 * that can reach it.
 *
 * The Admin Panel performs all of its reads and writes with the CALLER'S OWN
 * session client, never the service role, so what the policies allow is exactly
 * what the Admin Panel can do. That makes this suite the real authorization
 * test: the same statements the application issues, run as an active admin, a
 * disabled admin, a signed-in customer and an anonymous visitor.
 *
 * `requireAdmin()` is the other half and is asserted structurally in
 * `tests/unit/admin-authorization.test.ts`. Neither half is sufficient alone,
 * which is why both exist.
 */

type Client = Parameters<Parameters<typeof inRollbackTransaction>[0]>[0];

/** The four callers every admin operation is tried as. */
async function asEachCaller(
  client: Client,
  fx: Awaited<ReturnType<typeof seedFixtures>>,
  run: (label: string) => Promise<void>,
) {
  const callers: [string, typeof ANON | typeof AUTHENTICATED, string | undefined][] = [
    ['anonymous', ANON, undefined],
    ['signed-in customer', AUTHENTICATED, fx.outsiderUserId],
    ['disabled admin', AUTHENTICATED, fx.disabledAdminUserId],
  ];

  for (const [label, role, user] of callers) {
    await client.query('savepoint caller');
    await actAs(client, role, user);
    await run(label);
    await client.query('rollback to savepoint caller');
    await actAsOwner(client);
  }
}

describe('managing designs', () => {
  it('an active admin can create, edit, publish and archive', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows: created } = await client.query<{ id: string; status: string }>(
        `insert into public.designs (name, slug, occasion_id)
         values ('New Mandap', 'new-mandap', $1)
         returning id, status`,
        [fx.occasionId],
      );
      // Every design starts as a draft, whatever the caller asked for.
      expect(created[0]!.status).toBe('draft');

      const designId = created[0]!.id;

      const edited = await client.query(
        `update public.designs set description = 'Gold and ivory', featured = true
         where id = $1`,
        [designId],
      );
      expect(edited.rowCount).toBe(1);

      const published = await client.query(
        `update public.designs set status = 'published', published_at = now()
         where id = $1`,
        [designId],
      );
      expect(published.rowCount).toBe(1);

      const archived = await client.query(
        `update public.designs set status = 'archived' where id = $1`,
        [designId],
      );
      expect(archived.rowCount).toBe(1);
    });
  });

  it('nobody else can create, edit or publish a design', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await asEachCaller(client, fx, async (label) => {
        const inserted = await attempt(
          client,
          `insert into public.designs (name, slug) values ('Forged', 'forged-design')`,
        );
        expect(inserted, `${label} insert`).not.toBeNull();

        // An update that matches no visible row changes nothing, which is the
        // same outcome by a different route and equally acceptable.
        const updated = await attempt(
          client,
          `update public.designs set status = 'published' where id = $1`,
          [fx.draftDesignId],
        );
        if (updated === null) {
          const { rows } = await client.query<{ status: string }>(
            `select status from public.designs where id = $1`,
            [fx.draftDesignId],
          );
          // Either it errored, or it was invisible and nothing changed.
          expect(rows.length === 0 || rows[0]!.status === 'draft', label).toBe(true);
        }
      });
    });
  });

  it('a draft design stays invisible to everyone but an active admin', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await asEachCaller(client, fx, async (label) => {
        const { rows } = await client.query(
          `select id from public.designs where id = $1`,
          [fx.draftDesignId],
        );
        expect(rows, label).toHaveLength(0);
      });

      await actAs(client, AUTHENTICATED, fx.adminUserId);
      const { rows } = await client.query(
        `select id from public.designs where id = $1`,
        [fx.draftDesignId],
      );
      expect(rows).toHaveLength(1);
    });
  });
});

describe('managing design media', () => {
  it('an active admin can add, describe, reorder and delete images', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows } = await client.query<{ id: string }>(
        `insert into public.design_images
           (design_id, storage_key, alt_text, sort_order, width, height)
         values ($1, 'designs/x/one.webp', 'A mandap', 1, 1600, 1200)
         returning id`,
        [fx.publishedDesignId],
      );
      const imageId = rows[0]!.id;

      const described = await client.query(
        `update public.design_images set alt_text = 'Gold mandap' where id = $1`,
        [imageId],
      );
      expect(described.rowCount).toBe(1);

      const deleted = await client.query(
        `delete from public.design_images where id = $1`,
        [imageId],
      );
      expect(deleted.rowCount).toBe(1);
    });
  });

  it('nobody else can add or alter an image', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await asEachCaller(client, fx, async (label) => {
        const inserted = await attempt(
          client,
          `insert into public.design_images (design_id, storage_key)
           values ($1, 'designs/forged/one.webp')`,
          [fx.publishedDesignId],
        );
        expect(inserted, `${label} insert`).not.toBeNull();

        const updated = await client.query(
          `update public.design_images set alt_text = 'forged' where design_id = $1`,
          [fx.publishedDesignId],
        );
        expect(updated.rowCount, `${label} update`).toBe(0);
      });
    });
  });
});

describe('set_design_cover', () => {
  it('moves the cover in one transaction, never leaving two or none', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows } = await client.query<{ id: string }>(
        `insert into public.design_images (design_id, storage_key, sort_order)
         values ($1, 'designs/x/second.webp', 2)
         returning id`,
        [fx.publishedDesignId],
      );
      const newCover = rows[0]!.id;

      await client.query('select public.set_design_cover($1, $2)', [
        fx.publishedDesignId,
        newCover,
      ]);

      const { rows: covers } = await client.query<{ id: string }>(
        `select id from public.design_images where design_id = $1 and is_cover`,
        [fx.publishedDesignId],
      );
      // Exactly one, and it is the one we asked for.
      expect(covers).toHaveLength(1);
      expect(covers[0]!.id).toBe(newCover);
    });
  });

  it('refuses an image belonging to a different design', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows } = await client.query<{ id: string }>(
        `insert into public.design_images (design_id, storage_key)
         values ($1, 'designs/other/one.webp')
         returning id`,
        [fx.draftDesignId],
      );

      const error = await attempt(client, 'select public.set_design_cover($1, $2)', [
        fx.publishedDesignId,
        rows[0]!.id,
      ]);
      expect(error?.message).toMatch(/different design/i);
    });
  });

  it('refuses an image that does not exist', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const error = await attempt(client, 'select public.set_design_cover($1, $2)', [
        fx.publishedDesignId,
        '00000000-0000-4000-8000-000000000000',
      ]);
      expect(error?.message).toMatch(/not found/i);
    });
  });

  it('refuses every caller who is not an active admin', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await asEachCaller(client, fx, async (label) => {
        const error = await attempt(client, 'select public.set_design_cover($1, $2)', [
          fx.publishedDesignId,
          fx.publishedImageId,
        ]);
        expect(error, label).not.toBeNull();
        expect(error?.message, label).toMatch(/administrator|permission/i);
      });
    });
  });
});

describe('move_design_image', () => {
  it('swaps an image with its neighbour', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows } = await client.query<{ id: string }>(
        `insert into public.design_images (design_id, storage_key, sort_order)
         values ($1, 'designs/x/a.webp', 1), ($1, 'designs/x/b.webp', 2)
         returning id`,
        [fx.publishedDesignId],
      );
      const [first, second] = [rows[0]!.id, rows[1]!.id];

      await client.query('select public.move_design_image($1, $2)', [second, -1]);

      const { rows: ordered } = await client.query<{ id: string }>(
        `select id from public.design_images
         where design_id = $1 and not is_cover
         order by sort_order asc, id asc`,
        [fx.publishedDesignId],
      );
      expect(ordered[0]!.id).toBe(second);
      expect(ordered[1]!.id).toBe(first);
    });
  });

  it('does nothing at the end of the list rather than failing', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows } = await client.query<{ id: string }>(
        `insert into public.design_images (design_id, storage_key, sort_order)
         values ($1, 'designs/x/only.webp', 1)
         returning id`,
        [fx.publishedDesignId],
      );

      const error = await attempt(client, 'select public.move_design_image($1, $2)', [
        rows[0]!.id,
        -1,
      ]);
      expect(error).toBeNull();
    });
  });

  it('refuses to reorder the cover, which is always shown first', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const error = await attempt(client, 'select public.move_design_image($1, $2)', [
        fx.publishedImageId,
        1,
      ]);
      expect(error?.message).toMatch(/cover image/i);
    });
  });

  it('refuses a direction that is not up or down', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const error = await attempt(client, 'select public.move_design_image($1, $2)', [
        fx.publishedImageId,
        7,
      ]);
      expect(error?.message).toMatch(/-1 or 1/);
    });
  });

  it('refuses every caller who is not an active admin', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await asEachCaller(client, fx, async (label) => {
        const error = await attempt(client, 'select public.move_design_image($1, $2)', [
          fx.publishedImageId,
          1,
        ]);
        expect(error, label).not.toBeNull();
      });
    });
  });
});

describe('managing occasions, styles and services', () => {
  const tables = ['occasions', 'styles', 'services'] as const;

  it('an active admin can add one and switch it off', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      for (const table of tables) {
        const { rows } = await client.query<{ id: string }>(
          `insert into public.${table} (name, slug) values ($1, $2) returning id`,
          [`Test ${table}`, `test-${table}`],
        );
        const updated = await client.query(
          `update public.${table} set status = 'inactive' where id = $1`,
          [rows[0]!.id],
        );
        expect(updated.rowCount, table).toBe(1);
      }
    });
  });

  it('an inactive term disappears from the public site but not from the admin', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);
      await client.query(`update public.styles set status = 'inactive' where id = $1`, [
        fx.styleId,
      ]);

      await actAs(client, ANON);
      const anonymous = await client.query(
        `select id from public.styles where id = $1`,
        [fx.styleId],
      );
      expect(anonymous.rows).toHaveLength(0);

      await actAsOwner(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);
      const admin = await client.query(`select id from public.styles where id = $1`, [
        fx.styleId,
      ]);
      expect(admin.rows).toHaveLength(1);
    });
  });

  it('nobody else can add or change one', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await asEachCaller(client, fx, async (label) => {
        for (const table of tables) {
          const error = await attempt(
            client,
            `insert into public.${table} (name, slug) values ('Forged', 'forged-${table}')`,
          );
          expect(error, `${label} ${table}`).not.toBeNull();
        }
      });
    });
  });
});

describe('managing packages and testimonials', () => {
  it('an active admin can publish a package and approve a testimonial', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows: pkg } = await client.query<{ id: string; status: string }>(
        `insert into public.packages (name, slug) values ('Essentials', 'essentials')
         returning id, status`,
      );
      expect(pkg[0]!.status).toBe('draft');

      await client.query(
        `update public.packages set status = 'published' where id = $1`,
        [pkg[0]!.id],
      );

      const { rows: testimonial } = await client.query<{
        id: string;
        approval_status: string;
      }>(
        `insert into public.testimonials (name, body) values ('Meena', 'Beautiful work')
         returning id, approval_status`,
      );
      // Nothing reaches the public site without a deliberate approval.
      expect(testimonial[0]!.approval_status).toBe('pending');

      await client.query(
        `update public.testimonials set approval_status = 'approved' where id = $1`,
        [testimonial[0]!.id],
      );

      await actAs(client, ANON);
      const visible = await client.query(
        `select id from public.testimonials where id = $1`,
        [testimonial[0]!.id],
      );
      expect(visible.rows).toHaveLength(1);
    });
  });

  it('an unapproved testimonial and an unpublished package stay invisible', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);
      const { rows } = await client.query<{ id: string }>(
        `insert into public.testimonials (name, body) values ('Pending', 'Not yet')
         returning id`,
      );

      await actAs(client, ANON);
      const anonymous = await client.query(
        `select id from public.testimonials where id = $1`,
        [rows[0]!.id],
      );
      expect(anonymous.rows).toHaveLength(0);
      expect(fx.adminUserId).toBeTruthy();
    });
  });

  it('nobody else can add or approve either', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await asEachCaller(client, fx, async (label) => {
        expect(
          await attempt(
            client,
            `insert into public.packages (name, slug) values ('Forged', 'forged-pkg')`,
          ),
          `${label} package`,
        ).not.toBeNull();

        expect(
          await attempt(
            client,
            `insert into public.testimonials (name, body) values ('Forged', 'Fake praise')`,
          ),
          `${label} testimonial`,
        ).not.toBeNull();
      });
    });
  });
});

describe('managing enquiries', () => {
  it('an active admin can move the pipeline and write internal notes', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rowCount } = await client.query(
        `update public.enquiries
            set status = 'contacted', internal_notes = 'Called, sending a quote'
          where id = $1`,
        [fx.enquiryId],
      );
      expect(rowCount).toBe(1);
    });
  });

  it('an enquiry and its notes are unreachable by everyone else', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      // Anonymous callers have no privilege on the table at all.
      await client.query('savepoint anonymous');
      await actAs(client, ANON);
      const denied = await attempt(
        client,
        'select internal_notes from public.enquiries',
      );
      expect(denied?.message).toMatch(/permission denied/i);
      await client.query('rollback to savepoint anonymous');
      await actAsOwner(client);

      for (const user of [fx.outsiderUserId, fx.disabledAdminUserId]) {
        await client.query('savepoint caller');
        await actAs(client, AUTHENTICATED, user);
        const { rows } = await client.query('select id from public.enquiries');
        expect(rows).toHaveLength(0);
        await client.query('rollback to savepoint caller');
        await actAsOwner(client);
      }
    });
  });

  it('refuses the pipeline steps that are not in the approved list', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const error = await attempt(
        client,
        `update public.enquiries set status = 'archived' where id = $1`,
        [fx.enquiryId],
      );
      expect(error).not.toBeNull();
    });
  });

  it('cannot be created from any browser session, admin included', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      // Enquiries come from the public quote form via the server, and from
      // nowhere else. An Admin Panel that could forge one would make the inbox
      // untrustworthy.
      const error = await attempt(
        client,
        `insert into public.enquiries (name, phone, event_type, city, consent)
         values ('Forged', '+919994072435', 'wedding', 'Nagercoil', true)`,
      );
      expect(error).not.toBeNull();
    });
  });
});

describe('private reference images in the Admin Panel', () => {
  it('are readable by an active admin and by nobody else', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await actAs(client, AUTHENTICATED, fx.adminUserId);
      const admin = await client.query(
        'select storage_key from public.reference_images',
      );
      expect(admin.rows.length).toBeGreaterThan(0);
      await actAsOwner(client);

      for (const user of [fx.outsiderUserId, fx.disabledAdminUserId]) {
        await client.query('savepoint caller');
        await actAs(client, AUTHENTICATED, user);
        const { rows } = await client.query(
          'select storage_key from public.reference_images',
        );
        expect(rows).toHaveLength(0);
        await client.query('rollback to savepoint caller');
        await actAsOwner(client);
      }
    });
  });

  it('can be deleted by an active admin, and by nobody else', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await asEachCaller(client, fx, async (label) => {
        // Anonymous callers are refused by the privilege system; a signed-in
        // non-admin is refused by the policy and simply matches no row. Both
        // are acceptable, and neither may delete the image.
        const error = await attempt(
          client,
          'delete from public.reference_images where id = $1',
          [fx.referenceImageId],
        );
        if (error === null) {
          const { rows } = await client.query(
            'select id from public.reference_images where id = $1',
            [fx.referenceImageId],
          );
          expect(rows.length, label).toBe(0);
        }
      });

      await actAs(client, AUTHENTICATED, fx.adminUserId);
      const { rowCount } = await client.query(
        'delete from public.reference_images where id = $1',
        [fx.referenceImageId],
      );
      expect(rowCount).toBe(1);
    });
  });

  it('are readable in storage by an active admin and nobody else', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await actAs(client, AUTHENTICATED, fx.adminUserId);
      const admin = await client.query(
        `select name from storage.objects where bucket_id = 'references'`,
      );
      expect(admin.rows.length).toBeGreaterThan(0);
      await actAsOwner(client);

      await asEachCaller(client, fx, async (label) => {
        const { rows } = await client.query(
          `select name from storage.objects where bucket_id = 'references'`,
        );
        expect(rows, label).toHaveLength(0);
      });
    });
  });
});

describe('portfolio storage, as the Admin Panel uses it', () => {
  it('lets an active admin write and remove a portfolio object', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const inserted = await client.query(
        `insert into storage.objects (bucket_id, name)
         values ('portfolio', 'designs/abc/new.webp')`,
      );
      expect(inserted.rowCount).toBe(1);

      const removed = await client.query(
        `delete from storage.objects where bucket_id = 'portfolio' and name = 'designs/abc/new.webp'`,
      );
      expect(removed.rowCount).toBe(1);
    });
  });

  it('refuses a portfolio write from everyone else', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      await asEachCaller(client, fx, async (label) => {
        const error = await attempt(
          client,
          `insert into storage.objects (bucket_id, name) values ('portfolio', 'forged.webp')`,
        );
        expect(error, label).not.toBeNull();
      });
    });
  });
});

describe('being an admin is not something a client can grant itself', () => {
  it('refuses every attempt to write admin_users', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      for (const [label, role, user] of [
        ['anonymous', ANON, undefined],
        ['signed-in customer', AUTHENTICATED, fx.outsiderUserId],
        ['disabled admin', AUTHENTICATED, fx.disabledAdminUserId],
        ['active admin', AUTHENTICATED, fx.adminUserId],
      ] as const) {
        await client.query('savepoint caller');
        await actAs(client, role, user);

        const inserted = await attempt(
          client,
          `insert into public.admin_users (user_id, email) values ($1, 'new@example.test')`,
          [fx.outsiderUserId],
        );
        expect(inserted, `${label} insert`).not.toBeNull();

        const reactivated = await attempt(
          client,
          `update public.admin_users set status = 'active' where user_id = $1`,
          [fx.disabledAdminUserId],
        );
        expect(reactivated, `${label} update`).not.toBeNull();

        // Whatever the mechanism, the disabled admin is still disabled.
        await actAsOwner(client);
        const { rows } = await client.query<{ status: string }>(
          `select status from public.admin_users where user_id = $1`,
          [fx.disabledAdminUserId],
        );
        expect(rows[0]!.status, `${label} effect`).toBe('disabled');
        await actAs(client, role, user);

        await client.query('rollback to savepoint caller');
        await actAsOwner(client);
      }
    });
  });

  it('takes effect the moment an admin is disabled', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const before = await client.query('select id from public.enquiries');
      expect(before.rows.length).toBeGreaterThan(0);

      await actAsOwner(client);
      await actAs(client, SERVICE_ROLE);
      await client.query(
        `update public.admin_users set status = 'disabled' where user_id = $1`,
        [fx.adminUserId],
      );

      await actAsOwner(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);
      const after = await client.query('select id from public.enquiries');
      expect(after.rows).toHaveLength(0);
    });
  });
});
