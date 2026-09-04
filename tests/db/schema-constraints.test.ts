import { afterAll, describe, expect, it } from 'vitest';
import {
  actAsOwner,
  attempt,
  closePool,
  inRollbackTransaction,
  seedFixtures,
} from './helpers';

afterAll(closePool);

/**
 * Database contract verification.
 *
 * Source of truth: Technical Development Specification sections 6–7 and Master
 * Implementation Specification section 7. These are business rules that must
 * hold even if an application path is wrong, so they are enforced in the
 * database and tested here.
 */

describe('Design is the parent entity', () => {
  it('cascades child media when a design is deleted', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      await client.query('delete from public.designs where id = $1', [
        fx.draftDesignId,
      ]);

      const { rows } = await client.query(
        'select id from public.design_images where design_id = $1',
        [fx.draftDesignId],
      );
      expect(rows).toHaveLength(0);
    });
  });

  it('refuses to delete a design that an enquiry points at', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(client, 'delete from public.designs where id = $1', [
        fx.publishedDesignId,
      ]);
      expect(error?.message).toMatch(/violates foreign key constraint/i);
    });
  });

  it('allows at most one cover image per design', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.design_images (design_id, storage_key, is_cover)
         values ($1, 'portfolio/published/second-cover.webp', true)`,
        [fx.publishedDesignId],
      );
      expect(error?.message).toMatch(/duplicate key|unique/i);
    });
  });

  it('keeps storage keys globally unique', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.design_images (design_id, storage_key)
         values ($1, 'portfolio/published/cover.webp')`,
        [fx.draftDesignId],
      );
      expect(error?.message).toMatch(/duplicate key|unique/i);
    });
  });

  it('keeps design slugs unique', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.designs (name, slug, occasion_id)
         values ('Another', 'published-mandap', $1)`,
        [fx.occasionId],
      );
      expect(error?.message).toMatch(/duplicate key|unique/i);
    });
  });
});

describe('pricing rules', () => {
  it('refuses a starting price on a custom-quote design', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.designs (name, slug, occasion_id, quote_mode, starting_price)
         values ('Priced', 'priced', $1, 'custom_quote', 5000000)`,
        [fx.occasionId],
      );
      expect(error?.message).toMatch(/designs_starting_price_matches_mode/i);
    });
  });

  it('refuses a "starting from" design with no price', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.designs (name, slug, occasion_id, quote_mode)
         values ('Unpriced', 'unpriced', $1, 'starting_from')`,
        [fx.occasionId],
      );
      expect(error?.message).toMatch(/designs_starting_price_matches_mode/i);
    });
  });
});

describe('enquiry rules', () => {
  it('requires consent', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.enquiries (name, phone, event_type, city, consent)
         values ('No Consent', '+919000000001', 'Wedding', 'Nagercoil', false)`,
      );
      expect(error?.message).toMatch(/consent/i);
    });
  });

  it('requires a name and a phone number', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.enquiries (name, phone, event_type, city, consent)
         values ('   ', '+919000000001', 'Wedding', 'Nagercoil', true)`,
      );
      expect(error).not.toBeNull();
    });
  });

  it('starts every enquiry at the beginning of the pipeline', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAsOwner(client);

      const { rows } = await client.query<{ status: string }>(
        `insert into public.enquiries (name, phone, event_type, city, consent)
         values ('Pipeline', '+919000000002', 'Wedding', 'Nagercoil', true)
         returning status`,
      );
      expect(rows[0]?.status).toBe('new');
    });
  });

  it('rejects a status outside the approved pipeline', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.enquiries (name, phone, event_type, city, consent, status)
         values ('Bad Status', '+919000000003', 'Wedding', 'Nagercoil', true, 'invoiced')`,
      );
      expect(error).not.toBeNull();
    });
  });
});

describe('reference image rules', () => {
  it('allows at most 3 reference images per enquiry', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      for (const index of [2, 3]) {
        const inserted = await client.query(
          `insert into public.reference_images
             (enquiry_id, storage_key, original_filename, mime_type, size_bytes)
           values ($1, $2, 'more.jpg', 'image/jpeg', 1000)`,
          [fx.enquiryId, `references/${fx.enquiryId}/${index}.jpg`],
        );
        expect(inserted.rowCount).toBe(1);
      }

      const error = await attempt(
        client,
        `insert into public.reference_images
           (enquiry_id, storage_key, original_filename, mime_type, size_bytes)
         values ($1, $2, 'fourth.jpg', 'image/jpeg', 1000)`,
        [fx.enquiryId, `references/${fx.enquiryId}/4.jpg`],
      );
      expect(error?.message).toMatch(/at most 3 reference images/i);
    });
  });

  it('accepts only the approved image types', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      const error = await attempt(
        client,
        `insert into public.reference_images
           (enquiry_id, storage_key, original_filename, mime_type, size_bytes)
         values ($1, $2, 'payload.svg', 'image/svg+xml', 1000)`,
        [fx.enquiryId, `references/${fx.enquiryId}/svg.svg`],
      );
      expect(error?.message).toMatch(/mime_type/i);
    });
  });

  it('deletes reference images with their enquiry', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAsOwner(client);

      await client.query('delete from public.enquiries where id = $1', [fx.enquiryId]);

      const { rows } = await client.query(
        'select id from public.reference_images where enquiry_id = $1',
        [fx.enquiryId],
      );
      expect(rows).toHaveLength(0);
    });
  });
});

describe('approved reference data', () => {
  it('seeds every approved occasion, service and style', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);

      const occasions = await client.query(
        'select count(*)::int as n from public.occasions',
      );
      const services = await client.query(
        'select count(*)::int as n from public.services',
      );
      const styles = await client.query('select count(*)::int as n from public.styles');

      expect(occasions.rows[0]?.n).toBe(14);
      expect(services.rows[0]?.n).toBe(12);
      expect(styles.rows[0]?.n).toBe(10);
    });
  });

  it('marks partner-vendor services accurately', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);

      const { rows } = await client.query<{ slug: string }>(
        `select slug from public.services where delivery_model = 'partner_vendor' order by slug`,
      );

      expect(rows.map((r) => r.slug)).toEqual([
        'food-catering',
        'led-display-solutions',
        'makeup-styling',
        'photography-videography',
        'sounds-lightings',
      ]);
    });
  });

  it('carries the Tamil secondary terms from the requirements', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);

      const { rows } = await client.query<{ secondary_term: string }>(
        `select secondary_term from public.occasions where slug = 'baby-shower'`,
      );
      expect(rows[0]?.secondary_term).toBe('Valaikappu');
    });
  });

  it('is idempotent when re-applied', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);

      await client.query(
        `insert into public.occasions (name, secondary_term, slug, sort_order)
         values ('Wedding', null, 'wedding', 10)
         on conflict (slug) do nothing`,
      );

      const { rows } = await client.query(
        'select count(*)::int as n from public.occasions',
      );
      expect(rows[0]?.n).toBe(14);
    });
  });
});
