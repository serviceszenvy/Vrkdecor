/**
 * Proves that server-only secrets never reach the browser bundle.
 *
 * Builds are performed with sentinel values in the server-only environment
 * variables; this script then scans every asset the browser can download for
 * those sentinels. A hit means a server module was imported into client code
 * and the secret would have shipped to users.
 *
 * Run via `npm run verify:bundle` after `npm run build`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CLIENT_DIRS = ['.next/static'];

/** Sentinels must match the values used for the build. */
const SENTINELS = [
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.EMAIL_PROVIDER_API_KEY,
].filter((value) => typeof value === 'string' && value.length >= 8);

if (SENTINELS.length === 0) {
  console.error(
    'check-client-bundle: no server-only sentinel values were set; nothing to verify.',
  );
  process.exit(1);
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

let scanned = 0;
const leaks = [];

for (const dir of CLIENT_DIRS) {
  for (const file of walk(dir)) {
    scanned += 1;
    const content = readFileSync(file, 'utf8');
    for (const sentinel of SENTINELS) {
      if (content.includes(sentinel)) leaks.push({ file, sentinel });
    }
  }
}

if (scanned === 0) {
  console.error(
    'check-client-bundle: no client assets found. Run `npm run build` first.',
  );
  process.exit(1);
}

if (leaks.length > 0) {
  console.error('check-client-bundle: SERVER-ONLY SECRET FOUND IN CLIENT BUNDLE');
  for (const leak of leaks) console.error(`  ${leak.file}`);
  process.exit(1);
}

console.log(
  `check-client-bundle: OK — scanned ${scanned} client assets, no server-only secret present.`,
);
