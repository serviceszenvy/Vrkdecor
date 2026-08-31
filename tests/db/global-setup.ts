import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

/**
 * Rebuilds the test database from scratch before the database suite runs.
 *
 * Every run applies the real migrations in `supabase/migrations/` in order, so
 * the suite verifies the migrations themselves, not a hand-maintained copy of
 * the schema. The local Supabase shim (roles, `auth`, `storage`) is applied
 * first; it is a test fixture and never reaches a Supabase project.
 *
 * Requires TEST_DATABASE_URL. Never point this at production or staging
 * (Technical Development Specification section 4).
 */
const migrationsDir = fileURLToPath(
  new URL('../../supabase/migrations', import.meta.url),
);
const shimPath = fileURLToPath(new URL('./supabase-shim.sql', import.meta.url));

function psql(databaseUrl: string, args: string[]) {
  execFileSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-q', ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

export default async function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL is required for the database suite. See docs/DATABASE.md.',
    );
  }

  const target = new URL(url);
  const databaseName = target.pathname.replace(/^\//, '');
  if (!databaseName) throw new Error('TEST_DATABASE_URL must name a database');

  if (/prod/i.test(databaseName)) {
    throw new Error(
      'Refusing to run the database suite against a production-looking database',
    );
  }

  const adminUrl = new URL(url);
  adminUrl.pathname = '/postgres';

  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  await admin.query(
    `select pg_terminate_backend(pid) from pg_stat_activity where datname = $1 and pid <> pg_backend_pid()`,
    [databaseName],
  );
  await admin.query(
    `drop database if exists ${JSON.stringify(databaseName).replace(/"/g, '"')}`,
  );
  await admin.query(`create database "${databaseName}"`);
  await admin.end();

  psql(url, ['-f', shimPath]);

  const migrations = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrations.length === 0) throw new Error('No migrations found to apply');

  for (const migration of migrations) {
    psql(url, ['-f', `${migrationsDir}/${migration}`]);
  }
}
