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
 * The quote engine's database contract (P6).
 *
 * Requirements & SOW section 11 and Master Implementation Specification section
 * 16: the enquiry stores `selected_design_id`, reference images stay private,
 * and the enquiry reaches the Admin Panel — not an inbox.
 *
 * These run against the real migrations on a real PostgreSQL instance, acting
 * as the roles Supabase derives from a request JWT.
 */

const INSERT_ENQUIRY = `
  insert into public.enquiries
    (name, phone, event_type, event_date, venue, city, required_services,
     consent, selected_design_id, selected_image_id)
  values ($1, $2, $3, $4, $5, $6, $7, true, $8, $9)
  returning id, status, selected_design_id, selected_image_id
`;

const SAMPLE = [
  'Meena Rajan',
  '+919994072435',
  'wedding',
  '2026-12-14',
  'Sea View Hall',
  'Nagercoil',
  ['stage-mandap-decoration'],
];

describe('creating an enquiry (server-side, service role)', () => {
  it('stores the parent Design and the photograph it started from', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);

      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        fx.publishedImageId,
      ]);

      expect(rows[0].selected_design_id).toBe(fx.publishedDesignId);
      expect(rows[0].selected_image_id).toBe(fx.publishedImageId);
    });
  });

  it('opens every enquiry at the first step of the approved pipeline', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);

      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        null,
      ]);

      expect(rows[0].status).toBe('new');
    });
  });

  it('accepts a general enquiry with no design at all', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);

      const { rows } = await client.query(INSERT_ENQUIRY, [...SAMPLE, null, null]);
      expect(rows[0].selected_design_id).toBeNull();
    });
  });

  it('refuses an enquiry without consent', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);

      const error = await attempt(
        client,
        `insert into public.enquiries
           (name, phone, event_type, city, consent, selected_design_id)
         values ('No Consent', '+919994072435', 'wedding', 'Nagercoil', false, $1)`,
        [fx.publishedDesignId],
      );

      expect(error).not.toBeNull();
    });
  });
});

describe('the photograph a quote started from', () => {
  it('must belong to the Design the enquiry names', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);

      // The draft design's image is not a child of the published design.
      const error = await attempt(client, INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        fx.draftImageId,
      ]);

      expect(error?.message).toMatch(/must belong to selected_design_id/);
    });
  });

  it('cannot be recorded without its parent Design', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);

      const error = await attempt(client, INSERT_ENQUIRY, [
        ...SAMPLE,
        null,
        fx.publishedImageId,
      ]);

      expect(error?.message).toMatch(/must also name its parent Design/);
    });
  });

  it('cannot be moved to a foreign Design by a later update', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);

      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        fx.publishedImageId,
      ]);

      const error = await attempt(
        client,
        `update public.enquiries set selected_design_id = $1 where id = $2`,
        [fx.draftDesignId, rows[0].id],
      );

      expect(error).not.toBeNull();
    });
  });

  it('is cleared, not cascaded, when the photograph is deleted', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);

      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        fx.publishedImageId,
      ]);

      await actAsOwner(client);
      await client.query('delete from public.design_images where id = $1', [
        fx.publishedImageId,
      ]);

      const { rows: after } = await client.query(
        'select selected_design_id, selected_image_id from public.enquiries where id = $1',
        [rows[0].id],
      );

      // The lead survives and keeps its parent Design.
      expect(after[0].selected_image_id).toBeNull();
      expect(after[0].selected_design_id).toBe(fx.publishedDesignId);
    });
  });
});

describe('the enquiry reaches the Admin Panel, and nobody else', () => {
  it('is readable by an active admin', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        fx.publishedImageId,
      ]);

      await actAs(client, AUTHENTICATED, fx.adminUserId);
      const { rows: visible } = await client.query(
        'select id, selected_design_id, selected_image_id from public.enquiries where id = $1',
        [rows[0].id],
      );

      expect(visible).toHaveLength(1);
      expect(visible[0].selected_design_id).toBe(fx.publishedDesignId);
      expect(visible[0].selected_image_id).toBe(fx.publishedImageId);
    });
  });

  it('is unreachable by an anonymous visitor, even with its exact id', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        null,
      ]);

      await actAs(client, ANON);
      // Not merely filtered out by a policy: the privilege itself is revoked,
      // so there is no query an anonymous client can phrase to reach a lead.
      await expect(
        client.query('select id from public.enquiries where id = $1', [rows[0].id]),
      ).rejects.toThrow(/permission denied/i);
    });
  });

  it('is invisible to a signed-in user who is not an admin', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      await client.query(INSERT_ENQUIRY, [...SAMPLE, fx.publishedDesignId, null]);

      await actAs(client, AUTHENTICATED, fx.outsiderUserId);
      const { rows } = await client.query('select id from public.enquiries');

      expect(rows).toHaveLength(0);
    });
  });

  it('cannot be created from the browser by an anonymous visitor', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, ANON);

      const error = await attempt(client, INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        null,
      ]);

      expect(error).not.toBeNull();
    });
  });

  it('can be advanced through the pipeline by an admin', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        null,
      ]);

      await actAs(client, AUTHENTICATED, fx.adminUserId);
      const { rows: updated } = await client.query(
        `update public.enquiries set status = 'contacted' where id = $1 returning status`,
        [rows[0].id],
      );

      expect(updated[0].status).toBe('contacted');
    });
  });
});

describe('reference images (relationship implemented in P6, upload in P7)', () => {
  it('links up to three private images to one enquiry', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        null,
      ]);
      const enquiryId = rows[0].id;

      for (let index = 0; index < 3; index += 1) {
        const error = await attempt(
          client,
          `insert into public.reference_images
             (enquiry_id, design_id, storage_key, original_filename, mime_type, size_bytes)
           values ($1, $2, $3, 'inspiration.jpg', 'image/jpeg', 204800)`,
          [enquiryId, fx.publishedDesignId, `references/${enquiryId}/${index}.jpg`],
        );
        expect(error, `image ${index}`).toBeNull();
      }

      const { rows: counted } = await client.query(
        'select count(*)::int as total from public.reference_images where enquiry_id = $1',
        [enquiryId],
      );
      expect(counted[0].total).toBe(3);
    });
  });

  it('refuses a fourth', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        null,
      ]);
      const enquiryId = rows[0].id;

      for (let index = 0; index < 3; index += 1) {
        await client.query(
          `insert into public.reference_images
             (enquiry_id, design_id, storage_key, original_filename, mime_type, size_bytes)
           values ($1, $2, $3, 'inspiration.jpg', 'image/jpeg', 204800)`,
          [enquiryId, fx.publishedDesignId, `references/${enquiryId}/${index}.jpg`],
        );
      }

      const error = await attempt(
        client,
        `insert into public.reference_images
           (enquiry_id, design_id, storage_key, original_filename, mime_type, size_bytes)
         values ($1, $2, $3, 'one-too-many.jpg', 'image/jpeg', 204800)`,
        [enquiryId, fx.publishedDesignId, `references/${enquiryId}/4.jpg`],
      );

      expect(error?.message).toMatch(/at most 3 reference images/);
    });
  });

  it('stays unreachable by anonymous visitors', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, ANON);

      await expect(
        client.query('select id from public.reference_images where id = $1', [
          fx.referenceImageId,
        ]),
      ).rejects.toThrow(/permission denied/i);
    });
  });
});

describe('a Design that has produced leads', () => {
  it('cannot be deleted out from under them', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      await client.query(INSERT_ENQUIRY, [...SAMPLE, fx.publishedDesignId, null]);

      await actAsOwner(client);
      const error = await attempt(client, 'delete from public.designs where id = $1', [
        fx.publishedDesignId,
      ]);

      // ON DELETE RESTRICT: archive the design instead of losing the lead.
      expect(error).not.toBeNull();
    });
  });

  it('can be archived, and the enquiry keeps pointing at it', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const { rows } = await client.query(INSERT_ENQUIRY, [
        ...SAMPLE,
        fx.publishedDesignId,
        null,
      ]);

      await actAsOwner(client);
      await client.query(
        `update public.designs set status = 'archived' where id = $1`,
        [fx.publishedDesignId],
      );

      const { rows: after } = await client.query(
        'select selected_design_id from public.enquiries where id = $1',
        [rows[0].id],
      );
      expect(after[0].selected_design_id).toBe(fx.publishedDesignId);
    });
  });
});
