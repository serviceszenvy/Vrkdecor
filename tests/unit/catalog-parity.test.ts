import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { occasions, services, styles } from '@/lib/content';

/**
 * The content module and the seed migration must never disagree.
 *
 * Public pages fall back to `lib/content` when Supabase is unavailable, so a
 * drift between the two would mean visitors could see a different catalogue
 * depending on whether the database was reachable.
 */
const seedSql = readFileSync(
  fileURLToPath(
    new URL(
      '../../supabase/migrations/20260831120300_seed_reference_data.sql',
      import.meta.url,
    ),
  ),
  'utf8',
);

function slugsInInsert(table: string): string[] {
  const start = seedSql.indexOf(`insert into public.${table}`);
  expect(start, `${table} seed block`).toBeGreaterThan(-1);
  const end = seedSql.indexOf('on conflict', start);
  const block = seedSql.slice(start, end);

  return [
    ...block.matchAll(
      /'([a-z0-9-]+)',\s*'(?:in_house|partner_vendor)'|'([a-z0-9-]+)',\s*\d+\)/g,
    ),
  ]
    .map((match) => match[1] ?? match[2])
    .filter((value): value is string => Boolean(value));
}

describe('content module matches the seed migration', () => {
  it('seeds exactly the occasions the content module lists', () => {
    for (const occasion of occasions) {
      expect(seedSql, occasion.slug).toContain(`'${occasion.slug}'`);
      expect(seedSql, occasion.name).toContain(`'${occasion.name}'`);
      if (occasion.secondaryTerm) {
        expect(seedSql, occasion.secondaryTerm).toContain(
          `'${occasion.secondaryTerm}'`,
        );
      }
    }
    expect(slugsInInsert('occasions')).toHaveLength(occasions.length);
  });

  it('seeds exactly the services the content module lists, with matching delivery models', () => {
    for (const service of services) {
      expect(seedSql, service.slug).toContain(`'${service.slug}'`);
      const line = seedSql.split('\n').find((row) => row.includes(`'${service.slug}'`));
      expect(line, service.slug).toBeDefined();
      expect(line, service.slug).toContain(`'${service.deliveryModel}'`);
    }
    expect(slugsInInsert('services')).toHaveLength(services.length);
  });

  it('seeds exactly the styles the content module lists', () => {
    for (const style of styles) {
      expect(seedSql, style.slug).toContain(`'${style.slug}'`);
    }
    expect(slugsInInsert('styles')).toHaveLength(styles.length);
  });
});
