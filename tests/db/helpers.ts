import { Pool, type PoolClient } from 'pg';

export const SERVICE_ROLE = 'service_role';
export const ANON = 'anon';
export const AUTHENTICATED = 'authenticated';

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.TEST_DATABASE_URL;
    if (!connectionString) throw new Error('TEST_DATABASE_URL is not set');
    pool = new Pool({ connectionString, max: 4 });
  }
  return pool;
}

export async function closePool() {
  await pool?.end();
  pool = undefined;
}

/**
 * Runs `fn` inside a transaction that is always rolled back, so tests never
 * leak fixtures into each other.
 */
export async function inRollbackTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    return await fn(client);
  } finally {
    await client.query('rollback');
    client.release();
  }
}

/**
 * Switches the current transaction to a Supabase client role and, optionally,
 * an authenticated user id — the same inputs Supabase derives from the request
 * JWT. `set local` means the change disappears with the transaction.
 */
export async function actAs(
  client: PoolClient,
  role: typeof ANON | typeof AUTHENTICATED | typeof SERVICE_ROLE,
  userId?: string,
) {
  await client.query(`select set_config('request.jwt.claim.role', $1, true)`, [role]);
  await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [
    userId ?? '',
  ]);
  await client.query(`set local role ${role}`);
}

/** Returns to the owning role so a test can seed more fixtures. */
export async function actAsOwner(client: PoolClient) {
  await client.query('reset role');
}

export type Fixtures = Awaited<ReturnType<typeof seedFixtures>>;

/**
 * Seeds a representative data set as the table owner (bypassing RLS), so the
 * policy assertions that follow are testing the policies rather than the seed.
 */
export async function seedFixtures(client: PoolClient) {
  const { rows: users } = await client.query<{ id: string; email: string }>(
    `insert into auth.users (email) values
       ('admin@example.test'), ('disabled@example.test'), ('customer@example.test')
     returning id, email`,
  );

  const adminUser = users.find((u) => u.email === 'admin@example.test')!;
  const disabledUser = users.find((u) => u.email === 'disabled@example.test')!;
  // A signed-in user who is NOT an admin. Authentication is not authorization.
  const outsiderUser = users.find((u) => u.email === 'customer@example.test')!;

  await client.query(
    `insert into public.admin_users (user_id, email, status) values ($1, $2, 'active')`,
    [adminUser.id, adminUser.email],
  );
  await client.query(
    `insert into public.admin_users (user_id, email, status) values ($1, $2, 'disabled')`,
    [disabledUser.id, disabledUser.email],
  );

  const { rows: occasions } = await client.query<{ id: string }>(
    `select id from public.occasions where slug = 'wedding'`,
  );
  const occasionId = occasions[0]!.id;

  const { rows: publishedDesigns } = await client.query<{ id: string }>(
    `insert into public.designs (name, slug, occasion_id, status, published_at, location)
     values ('Published Mandap', 'published-mandap', $1, 'published', now(), 'Nagercoil')
     returning id`,
    [occasionId],
  );
  const publishedDesignId = publishedDesigns[0]!.id;

  const { rows: draftDesigns } = await client.query<{ id: string }>(
    `insert into public.designs (name, slug, occasion_id, status, location)
     values ('Draft Mandap', 'draft-mandap', $1, 'draft', 'Madurai')
     returning id`,
    [occasionId],
  );
  const draftDesignId = draftDesigns[0]!.id;

  const { rows: publishedImages } = await client.query<{ id: string }>(
    `insert into public.design_images (design_id, storage_key, alt_text, is_cover, sort_order)
     values ($1, 'portfolio/published/cover.webp', 'Published cover', true, 0)
     returning id`,
    [publishedDesignId],
  );

  const { rows: draftImages } = await client.query<{ id: string }>(
    `insert into public.design_images (design_id, storage_key, alt_text, is_cover, sort_order)
     values ($1, 'portfolio/draft/cover.webp', 'Draft cover', true, 0)
     returning id`,
    [draftDesignId],
  );

  const { rows: enquiries } = await client.query<{ id: string }>(
    `insert into public.enquiries
       (name, phone, email, event_type, city, consent, selected_design_id)
     values ('Test Customer', '+919000000000', 'customer@example.test',
             'Wedding', 'Nagercoil', true, $1)
     returning id`,
    [publishedDesignId],
  );
  const enquiryId = enquiries[0]!.id;

  const { rows: referenceImages } = await client.query<{ id: string }>(
    `insert into public.reference_images
       (enquiry_id, design_id, storage_key, original_filename, mime_type, size_bytes)
     values ($1, $2, $3, 'inspiration.jpg', 'image/jpeg', 12345)
     returning id`,
    [enquiryId, publishedDesignId, `references/${enquiryId}/one.jpg`],
  );

  await client.query(
    `insert into storage.objects (bucket_id, name) values
       ('portfolio', 'published/cover.webp'),
       ('references', 'private/inspiration.jpg')`,
  );

  return {
    adminUserId: adminUser.id,
    disabledAdminUserId: disabledUser.id,
    outsiderUserId: outsiderUser.id,
    occasionId,
    publishedDesignId,
    draftDesignId,
    publishedImageId: publishedImages[0]!.id,
    draftImageId: draftImages[0]!.id,
    enquiryId,
    referenceImageId: referenceImages[0]!.id,
  };
}

/**
 * Runs a statement that is expected to be refused, inside a savepoint, and
 * returns the error. Without the savepoint the first refusal would abort the
 * surrounding transaction and every later statement would fail with
 * "current transaction is aborted" instead of its own real error.
 */
export async function attempt(
  client: PoolClient,
  sql: string,
  params: unknown[] = [],
): Promise<Error | null> {
  await client.query('savepoint attempt');
  try {
    await client.query(sql, params);
    await client.query('release savepoint attempt');
    return null;
  } catch (error) {
    await client.query('rollback to savepoint attempt');
    return error as Error;
  }
}
