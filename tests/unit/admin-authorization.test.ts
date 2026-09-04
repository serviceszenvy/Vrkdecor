import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * "Ensure all administrative operations are properly authorized server-side."
 *   — Prompt 08, and CLAUDE.md's non-negotiable security list.
 *
 * This is the kind of rule that holds on the day it is written and quietly
 * stops holding six months later, when somebody adds one more admin page and
 * forgets one line. Nothing else in the codebase would object: the page would
 * render, the query would return rows for whoever asked, and the mistake would
 * only be visible to whoever found it first.
 *
 * So it is asserted structurally. Every page under `app/admin` and every
 * exported Server Action under `features/admin/actions` must call the guard,
 * and none of them may reach for the service-role client, which bypasses Row
 * Level Security and would leave the guard as the only check standing.
 */

const root = fileURLToPath(new URL('../../', import.meta.url));

function walk(relative: string): string[] {
  const absolute = join(root, relative);
  if (statSync(absolute).isFile()) return [relative];
  return readdirSync(absolute).flatMap((entry) => walk(join(relative, entry)));
}

function read(relative: string): string {
  return readFileSync(join(root, relative), 'utf8');
}

/** Comments discuss authorization constantly; only real code is checked. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const ADMIN_PAGES = walk('app/admin').filter((path) => path.endsWith('page.tsx'));
const ADMIN_ACTIONS = walk('features/admin/actions').filter((path) =>
  path.endsWith('.ts'),
);

/**
 * The two pages that must NOT require an admin, and why:
 *   - the sign-in page, which is how someone becomes one
 */
const PUBLIC_ADMIN_PAGES = ['app/admin/login/page.tsx'];

/** Action modules with no admin-only exports. */
const PUBLIC_ACTION_MODULES = [
  // Sign-in and sign-out are reachable before and after being an admin.
  'features/admin/actions/auth.ts',
  // Synchronous helpers, not a `'use server'` module.
  'features/admin/actions/shared.ts',
];

describe('the admin surface exists and is being checked', () => {
  it('found the pages and actions to check', () => {
    expect(ADMIN_PAGES.length).toBeGreaterThanOrEqual(8);
    expect(ADMIN_ACTIONS.length).toBeGreaterThanOrEqual(5);
  });
});

describe('every admin page requires an admin', () => {
  for (const page of ADMIN_PAGES) {
    if (PUBLIC_ADMIN_PAGES.includes(page)) continue;

    it(`${page} calls the guard`, () => {
      const code = stripComments(read(page));
      expect(code).toMatch(/requireAdmin(Context)?\(\)/);
    });
  }

  it('the sign-in page is the only unguarded one, and it shows nothing', () => {
    const login = stripComments(read('app/admin/login/page.tsx'));
    // It may read the current admin in order to redirect one away, but it must
    // never read enquiries, designs or any other admin data.
    expect(login).not.toMatch(/listAdmin|getAdmin(Design|Enquiry|Dashboard)/);
    expect(login).toContain('getCurrentAdmin');
  });
});

describe('every admin mutation requires an admin', () => {
  for (const actionModule of ADMIN_ACTIONS) {
    if (PUBLIC_ACTION_MODULES.includes(actionModule)) continue;

    const code = stripComments(read(actionModule));
    const exported = [...code.matchAll(/export async function (\w+)\s*\(/g)].map(
      (match) => match[1]!,
    );

    it(`${actionModule} exports actions and guards each one`, () => {
      expect(exported.length).toBeGreaterThan(0);

      for (const name of exported) {
        const start = code.indexOf(`export async function ${name}`);
        const next = exported
          .map((other) => code.indexOf(`export async function ${other}`))
          .filter((index) => index > start)
          .sort((a, b) => a - b)[0];
        const body = code.slice(start, next === undefined ? code.length : next);

        expect(body, `${actionModule}: ${name}`).toMatch(/requireAdmin(Context)?\(\)/);
      }
    });

    it(`${actionModule} guards before it writes`, () => {
      // The guard redirects, so anything before it runs for an unauthorized
      // caller. It has to be the first thing in the function.
      const firstGuard = code.indexOf('requireAdmin');
      const firstWrite = Math.min(
        ...['.insert(', '.update(', '.delete(', '.rpc(', '.upload(']
          .map((token) => code.indexOf(token))
          .filter((index) => index > -1)
          .concat([Number.MAX_SAFE_INTEGER]),
      );

      if (firstWrite !== Number.MAX_SAFE_INTEGER) {
        expect(firstGuard, actionModule).toBeGreaterThan(-1);
        expect(firstGuard, actionModule).toBeLessThan(firstWrite);
      }
    });
  }
});

describe('the admin never bypasses Row Level Security', () => {
  const adminSources = [...walk('features/admin'), ...walk('app/admin')].filter(
    (path) => /\.(ts|tsx)$/.test(path),
  );

  it('has sources to check', () => {
    expect(adminSources.length).toBeGreaterThan(10);
  });

  it('never uses the service-role client anywhere', () => {
    // The service role bypasses every policy. If an admin page used it, the
    // `requireAdmin()` guard would be the ONLY thing standing between a
    // request and the whole database, and a single missed call would be total.
    for (const path of adminSources) {
      const code = stripComments(read(path));
      expect(code, path).not.toContain('createSupabaseServiceRoleClient');
      expect(code, path).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(code, path).not.toContain('supabase-service');
    }
  });

  it('reads and writes through the caller session client', () => {
    const data = read('features/admin/data.ts');
    // Every reader takes a client rather than making one, and the only client
    // the callers have is the session client `requireAdminContext` hands back.
    expect(data).toMatch(/supabase: Client/);
    expect(data).toContain("import 'server-only'");
    expect(read('lib/auth/admin.ts')).toMatch(
      /requireAdminContext[\s\S]*createSupabaseServerClient/,
    );
  });
});

describe('admin input is validated even though the caller is trusted', () => {
  it('parses every form through a schema rather than spreading it into a row', () => {
    for (const actionModule of ADMIN_ACTIONS) {
      if (PUBLIC_ACTION_MODULES.includes(actionModule)) continue;
      const code = stripComments(read(actionModule));
      if (!code.includes('.insert(') && !code.includes('.update(')) continue;

      expect(code, actionModule).toMatch(/parseAdminForm|safeParse/);
      // A spread into a write is how an unexpected field reaches a column.
      expect(code, actionModule).not.toMatch(/\.(insert|update)\(\s*\{\s*\.\.\./);
    }
  });

  it('never lets an admin form write an identifier or a timestamp column', () => {
    for (const actionModule of ADMIN_ACTIONS) {
      const code = stripComments(read(actionModule));
      expect(code, actionModule).not.toMatch(/\bid:\s*input\./);
      expect(code, actionModule).not.toMatch(/created_at:/);
      expect(code, actionModule).not.toMatch(/updated_at:/);
    }
  });

  it('writes only the two fields an enquiry may ever have changed', () => {
    const code = stripComments(read('features/admin/actions/enquiries.ts'));
    const update = code.slice(
      code.indexOf(".from('enquiries')"),
      code.indexOf(".select('id')"),
    );

    expect(update).toContain('status:');
    expect(update).toContain('internal_notes:');
    // The customer's own answers are the record of what they asked for.
    for (const column of ['name:', 'phone:', 'email:', 'event_date:', 'consent:']) {
      expect(update, column).not.toContain(column);
    }
  });
});

describe('the Admin Panel is never indexed', () => {
  it('sets robots metadata on the segment and the sign-in page', () => {
    expect(read('app/admin/layout.tsx')).toMatch(/robots:\s*\{\s*index:\s*false/);
    expect(read('app/admin/login/page.tsx')).toMatch(/robots:\s*\{\s*index:\s*false/);
  });

  it('sends the header too, so a crawler that ignores the tag still hears it', () => {
    const config = read('next.config.ts');
    expect(config).toContain("source: '/admin/:path*'");
    expect(config).toMatch(/X-Robots-Tag/);
    expect(config).toMatch(/'no-store, max-age=0'/);
  });
});

describe('sign-in is treated as the anonymous write surface it is', () => {
  const auth = stripComments(read('features/admin/actions/auth.ts'));

  it('is rate limited per client and per email address', () => {
    expect(auth).toContain('consumeRateLimit');
    expect(auth).toMatch(/admin:signin:client:/);
    expect(auth).toMatch(/admin:signin:email:/);
  });

  it('answers a wrong password and an unknown address identically', () => {
    // Two different messages would turn the form into an address checker.
    const failures = [...auth.matchAll(/GENERIC_FAILURE/g)];
    expect(failures.length).toBeGreaterThanOrEqual(2);
    expect(auth).not.toMatch(/no such (user|account)/i);
  });

  it('never echoes the password back into the form', () => {
    // The password is passed to Supabase Auth, which is the point of it; what
    // must never happen is it travelling back into the state that re-renders
    // the form, where it would sit in the DOM, in a page cache and in a
    // screenshot.
    const values = auth.slice(
      auth.indexOf('const values'),
      auth.indexOf('if (!parsed'),
    );
    expect(values).not.toContain('password');

    const form = stripComments(read('app/admin/login/login-form.tsx'));
    const passwordField = form.slice(form.indexOf('name="password"'));
    expect(passwordField).not.toContain('defaultValue');
  });

  it('never logs the address or the password', () => {
    for (const match of auth.matchAll(/console\.error\(([^)]*)\)/g)) {
      expect(match[1]).not.toContain('email');
      expect(match[1]).not.toContain('password');
    }
  });
});
