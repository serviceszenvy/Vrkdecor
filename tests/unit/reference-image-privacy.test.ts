import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveImageUrl } from '@/features/portfolio/image-url';
import { REFERENCE_BUCKET, PORTFOLIO_BUCKET } from '@/lib/storage/buckets';
import { bucketForKey, referenceObjectKey } from '@/lib/storage/keys';

/**
 * "Customer reference images are private" — CLAUDE.md, Requirements & SOW
 * section 13, Technical Development Specification section 11.
 *
 * Privacy here is not one control, it is four, and any one of them failing
 * alone must not expose an image:
 *
 *   1. the bucket is private and grants `anon` nothing (proved in the database
 *      suite, `tests/db/storage-privacy.test.ts`)
 *   2. the key is server-generated and random, so it cannot be guessed
 *   3. no code path builds a public URL from a reference key
 *   4. nothing that renders publicly ever receives one
 *
 * This file covers 2, 3 and 4. The database suite covers 1.
 */

const root = fileURLToPath(new URL('../../', import.meta.url));
const ENQUIRY_ID = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d';

function sourceFiles(relative: string): string[] {
  const absolute = join(root, relative);
  if (statSync(absolute).isFile()) return [absolute];
  return readdirSync(absolute).flatMap((entry) => sourceFiles(join(relative, entry)));
}

function sources(...paths: string[]) {
  return paths
    .flatMap(sourceFiles)
    .filter((path) => /\.(ts|tsx)$/.test(path))
    .map((path) => ({
      path: path.replace(root, ''),
      code: readFileSync(path, 'utf8'),
    }));
}

describe('a reference key cannot become a public URL', () => {
  it('is routed to the private bucket', () => {
    const key = referenceObjectKey(ENQUIRY_ID, 'image/jpeg');
    expect(bucketForKey(key)).toBe(REFERENCE_BUCKET);
    expect(bucketForKey(key)).not.toBe(PORTFOLIO_BUCKET);
  });

  it('is refused by the public image resolver', () => {
    const key = referenceObjectKey(ENQUIRY_ID, 'image/jpeg');
    expect(() => resolveImageUrl(key, 'https://project.supabase.co')).toThrow(
      /private object/i,
    );
  });

  it('is refused even when it is the only thing a caller has', () => {
    expect(() =>
      resolveImageUrl('enquiries/anything/at-all.webp', 'https://project.supabase.co'),
    ).toThrow(/private object/i);
  });

  it('still resolves an ordinary portfolio key', () => {
    expect(
      resolveImageUrl('designs/abc/def.webp', 'https://project.supabase.co'),
    ).toContain(`/object/public/${PORTFOLIO_BUCKET}/`);
  });
});

describe('the key itself gives nothing away', () => {
  it('never contains the customer filename', () => {
    const key = referenceObjectKey(ENQUIRY_ID, 'image/png');
    expect(key).toMatch(/^enquiries\/[0-9a-f-]+\/[0-9a-f-]{36}\.png$/);
  });

  it('is different every time, so the images of one enquiry cannot be walked', () => {
    const keys = new Set(
      Array.from({ length: 25 }, () => referenceObjectKey(ENQUIRY_ID, 'image/jpeg')),
    );
    expect(keys.size).toBe(25);
  });
});

describe('nothing public ever receives a reference image', () => {
  // `app/(site)` is every public page. `app/admin` is excluded deliberately and
  // is covered by its own assertions below: the Admin Panel is the one place a
  // reference image may be looked at, and how it does that is checked, not
  // forbidden.
  const publicSources = sources('app/(site)', 'features/portfolio', 'components');

  it('has sources to check', () => {
    expect(publicSources.length).toBeGreaterThan(20);
  });

  it('never names the private bucket in a public page or portfolio component', () => {
    for (const { path, code } of publicSources) {
      expect(code, path).not.toContain("'references'");
      expect(code, path).not.toContain('REFERENCE_BUCKET');
      expect(code, path).not.toContain('createReferenceSignedUrl');
      expect(code, path).not.toContain('reference_images');
    }
  });

  it('keeps the signed-URL helper behind server-only, with a short life', () => {
    const urls = readFileSync(join(root, 'lib/storage/urls.ts'), 'utf8');
    expect(urls).toContain("import 'server-only'");
    expect(urls).toMatch(/REFERENCE_SIGNED_URL_TTL_SECONDS\s*=\s*300/);
  });

  it('keeps the private upload path behind server-only', () => {
    const upload = readFileSync(join(root, 'lib/storage/reference-upload.ts'), 'utf8');
    expect(upload).toContain("import 'server-only'");
    // Never overwrite: an existing object cannot be replaced by a later upload.
    expect(upload).toContain('upsert: false');
  });

  it('does not export the private upload path from the shared storage index', () => {
    // `lib/storage/index.ts` is imported by client components. A server-only
    // module reached through it would be a build error at best.
    const index = readFileSync(join(root, 'lib/storage/index.ts'), 'utf8');
    expect(index).not.toContain('reference-upload');
    expect(index).not.toContain('./urls');
  });

  it('returns only a count of reference images to the enquiry summary', () => {
    const types = readFileSync(join(root, 'features/enquiries/types.ts'), 'utf8');
    const summary = types.slice(types.indexOf('export type EnquirySummary'));
    expect(summary).toContain('referenceImageCount: number');
    expect(summary).not.toContain('storageKey');
    expect(summary).not.toContain('signedUrl');
  });
});

describe('the Admin Panel is the only place a reference image is viewable', () => {
  const enquiryPage = readFileSync(
    join(root, 'app/admin/enquiries/[id]/page.tsx'),
    'utf8',
  );

  it("signs the URL with the ADMIN'S OWN SESSION, never the service role", () => {
    // Two checks then stand between a stranger and a customer's photograph:
    // `requireAdmin()` and the storage policy. A service-role client here would
    // leave only the first.
    expect(enquiryPage).toContain('requireAdminContext()');
    expect(enquiryPage).toMatch(/createReferenceSignedUrl\(\s*supabase,/);
    expect(enquiryPage).not.toContain('createSupabaseServiceRoleClient');
  });

  it('reads the rows through Row Level Security before signing anything', () => {
    // The storage key reaches the signer only if a policy handed the row over.
    const rowsAt = enquiryPage.indexOf('getAdminEnquiry(supabase');
    // The CALL, not the import at the top of the file.
    const signAt = enquiryPage.indexOf('createReferenceSignedUrl(supabase');
    expect(rowsAt).toBeGreaterThan(-1);
    expect(signAt).toBeGreaterThan(rowsAt);
  });

  it('renders a private image with a plain img, never next/image', () => {
    // The image optimiser would fetch and cache a private photograph on disk.
    const gallery = enquiryPage.slice(enquiryPage.indexOf('reference-images'));
    expect(gallery).toContain('<img');
    expect(gallery).not.toContain('<Image');
    expect(gallery).toContain('referrerPolicy="no-referrer"');
  });

  it('keeps the signed URL short-lived and unstored', () => {
    const urls = readFileSync(join(root, 'lib/storage/urls.ts'), 'utf8');
    expect(urls).toMatch(/REFERENCE_SIGNED_URL_TTL_SECONDS\s*=\s*300/);
    // Nothing persists a signed URL: it is issued per render and expires.
    expect(enquiryPage).not.toMatch(/signed_url|signedUrl\s*:/);
  });

  it('never lets the image optimiser near the private bucket', () => {
    const config = readFileSync(join(root, 'next.config.ts'), 'utf8');
    const patterns = config.slice(config.indexOf('portfolioImagePatterns'));
    expect(patterns).toContain('/storage/v1/object/public/portfolio/**');
    expect(patterns).not.toContain('references');
  });
});
