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
 * P7 — private reference images and the confirmation timestamp, at the database
 * level.
 *
 * The application checks in `lib/uploads` are the first line and are covered by
 * the unit suite. These are the second: the rules that hold even if a future
 * code path forgets them, running against the real migrations on real
 * PostgreSQL as the roles Supabase derives from a request JWT.
 */

const INSERT_ENQUIRY = `
  insert into public.enquiries
    (name, phone, email, event_type, event_date, venue, city, required_services,
     consent, selected_design_id)
  values ($1, $2, $3, 'wedding', '2026-12-14', 'Sea View Hall', 'Nagercoil',
          array['stage-mandap-decoration'], true, $4)
  returning id, confirmation_email_sent_at
`;

const INSERT_REFERENCE = `
  insert into public.reference_images
    (enquiry_id, design_id, storage_key, original_filename, mime_type, size_bytes)
  values ($1, $2, $3, $4, $5, $6)
  returning id
`;

async function newEnquiry(
  client: Parameters<Parameters<typeof inRollbackTransaction>[0]>[0],
  designId: string | null,
  email: string | null = 'meena@example.test',
) {
  const { rows } = await client.query(INSERT_ENQUIRY, [
    'Meena Rajan',
    '+919994072435',
    email,
    designId,
  ]);
  return rows[0] as { id: string; confirmation_email_sent_at: string | null };
}

describe('what a reference image row may contain', () => {
  it('accepts only the three approved image types', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const enquiry = await newEnquiry(client, fx.publishedDesignId);

      for (const mime of ['image/jpeg', 'image/png', 'image/webp']) {
        const error = await attempt(client, INSERT_REFERENCE, [
          enquiry.id,
          fx.publishedDesignId,
          `enquiries/${enquiry.id}/${mime.replace('/', '-')}`,
          'inspiration.jpg',
          mime,
          204800,
        ]);
        expect(error, mime).toBeNull();
      }
    });
  });

  it('refuses a scriptable or executable type, even from the service role', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const enquiry = await newEnquiry(client, fx.publishedDesignId);

      for (const mime of [
        'image/svg+xml',
        'application/pdf',
        'application/zip',
        'text/html',
        'image/avif',
      ]) {
        const error = await attempt(client, INSERT_REFERENCE, [
          enquiry.id,
          fx.publishedDesignId,
          `enquiries/${enquiry.id}/${mime.replace(/\W/g, '-')}`,
          'inspiration.jpg',
          mime,
          204800,
        ]);
        expect(error?.message, mime).toMatch(/violates check constraint/i);
      }
    });
  });

  it('refuses an empty file', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const enquiry = await newEnquiry(client, fx.publishedDesignId);

      const error = await attempt(client, INSERT_REFERENCE, [
        enquiry.id,
        fx.publishedDesignId,
        `enquiries/${enquiry.id}/empty.jpg`,
        'empty.jpg',
        'image/jpeg',
        0,
      ]);
      expect(error?.message).toMatch(/violates check constraint/i);
    });
  });

  it('refuses a storage key that is already in use', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const first = await newEnquiry(client, fx.publishedDesignId);
      const second = await newEnquiry(client, fx.publishedDesignId);

      const key = `enquiries/${first.id}/shared.jpg`;
      await client.query(INSERT_REFERENCE, [
        first.id,
        fx.publishedDesignId,
        key,
        'a.jpg',
        'image/jpeg',
        1024,
      ]);

      // One enquiry's image can never be claimed by, or overwritten from,
      // another enquiry.
      const error = await attempt(client, INSERT_REFERENCE, [
        second.id,
        fx.publishedDesignId,
        key,
        'b.jpg',
        'image/jpeg',
        1024,
      ]);
      expect(error?.message).toMatch(/duplicate key|unique constraint/i);
    });
  });
});

describe('who can reach a reference image', () => {
  it('is unreachable by an anonymous visitor holding the exact key', async () => {
    await inRollbackTransaction(async (client) => {
      await seedFixtures(client);
      await actAs(client, ANON);

      await expect(
        client.query('select id from public.reference_images where storage_key = $1', [
          'private/inspiration.jpg',
        ]),
      ).rejects.toThrow(/permission denied/i);
    });
  });

  it('is invisible to a signed-in customer who is not an admin', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      const { rows } = await client.query('select id from public.reference_images');
      expect(rows).toHaveLength(0);
    });
  });

  it('is readable by an active admin, which is how the Admin Panel shows it', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.adminUserId);

      const { rows } = await client.query('select id from public.reference_images');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  it('cannot be created from a browser by anyone at all', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);

      for (const [role, user] of [
        [ANON, undefined],
        [AUTHENTICATED, fx.outsiderUserId],
        [AUTHENTICATED, fx.adminUserId],
      ] as const) {
        await client.query('savepoint attempt');
        await actAs(client, role, user);

        const error = await attempt(client, INSERT_REFERENCE, [
          fx.enquiryId,
          fx.publishedDesignId,
          `enquiries/forged-${role}-${user ?? 'anon'}.jpg`,
          'forged.jpg',
          'image/jpeg',
          1024,
        ]);

        expect(error, `${role}/${user ?? 'anon'}`).not.toBeNull();
        await client.query('rollback to savepoint attempt');
        await actAsOwner(client);
      }
    });
  });

  it('disappears with the enquiry it belongs to', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const enquiry = await newEnquiry(client, fx.publishedDesignId);

      await client.query(INSERT_REFERENCE, [
        enquiry.id,
        fx.publishedDesignId,
        `enquiries/${enquiry.id}/a.jpg`,
        'a.jpg',
        'image/jpeg',
        1024,
      ]);

      await actAsOwner(client);
      await client.query('delete from public.enquiries where id = $1', [enquiry.id]);

      const { rows } = await client.query(
        'select id from public.reference_images where enquiry_id = $1',
        [enquiry.id],
      );
      // Deleting a lead must not leave its private images behind with nothing
      // pointing at them.
      expect(rows).toHaveLength(0);
    });
  });
});

describe('the confirmation email timestamp', () => {
  it('is empty when the enquiry is created', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const enquiry = await newEnquiry(client, fx.publishedDesignId);

      expect(enquiry.confirmation_email_sent_at).toBeNull();
    });
  });

  it('is set by the server after a successful send, and only then', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      const enquiry = await newEnquiry(client, fx.publishedDesignId);

      const { rows } = await client.query(
        `update public.enquiries set confirmation_email_sent_at = now()
         where id = $1 returning confirmation_email_sent_at`,
        [enquiry.id],
      );
      expect(rows[0].confirmation_email_sent_at).not.toBeNull();
    });
  });

  it('cannot be set from a browser by an anonymous visitor', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, ANON);

      const error = await attempt(
        client,
        'update public.enquiries set confirmation_email_sent_at = now() where id = $1',
        [fx.enquiryId],
      );
      expect(error).not.toBeNull();
    });
  });

  it('cannot be set by a signed-in customer who is not an admin', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, AUTHENTICATED, fx.outsiderUserId);

      const { rowCount } = await client.query(
        'update public.enquiries set confirmation_email_sent_at = now() where id = $1',
        [fx.enquiryId],
      );
      // Row Level Security makes the row invisible, so the update matches
      // nothing rather than changing someone else's lead.
      expect(rowCount).toBe(0);
    });
  });

  it('survives regardless of whether an email was ever sent', async () => {
    await inRollbackTransaction(async (client) => {
      const fx = await seedFixtures(client);
      await actAs(client, SERVICE_ROLE);
      // An enquiry with no email address at all is still a complete lead.
      const enquiry = await newEnquiry(client, fx.publishedDesignId, null);

      await actAs(client, AUTHENTICATED, fx.adminUserId);
      const { rows } = await client.query(
        'select id, status, email, confirmation_email_sent_at from public.enquiries where id = $1',
        [enquiry.id],
      );

      expect(rows[0].status).toBe('new');
      expect(rows[0].email).toBeNull();
      expect(rows[0].confirmation_email_sent_at).toBeNull();
    });
  });
});

describe('the private bucket accepts nothing the application would not', () => {
  it('limits reference objects to 5 MB and the three approved types', async () => {
    await inRollbackTransaction(async (client) => {
      await actAsOwner(client);
      const { rows } = await client.query<{
        file_size_limit: string;
        allowed_mime_types: string[];
        public: boolean;
      }>(
        `select public, file_size_limit, allowed_mime_types
         from storage.buckets where id = 'references'`,
      );

      const bucket = rows[0]!;
      expect(bucket.public).toBe(false);
      expect(Number(bucket.file_size_limit)).toBe(5 * 1024 * 1024);
      expect(bucket.allowed_mime_types.sort()).toEqual([
        'image/jpeg',
        'image/png',
        'image/webp',
      ]);
    });
  });
});
