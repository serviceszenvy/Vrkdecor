import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/lib/site-config';

/**
 * "VRK Decor receives no email notification; Admin Panel is the internal
 * notification/inbox."
 *   — Requirements & SOW section 11, repeated in section 12, Technical
 *     Development Specification section 9, Master Implementation Specification
 *     sections 4 and 9, and CLAUDE.md core business rules.
 *
 * This is one of the few requirements stated five times, and it is easy to
 * violate by accident: adding an internal notification is the obvious thing to
 * do when building a lead form, and nothing else in the codebase would object.
 *
 * So it is asserted structurally. P7 added a transactional email provider for
 * the CUSTOMER confirmation, and this test still passes: the quote path itself
 * still contains no transport, no business address and no notification
 * variable, and the second half of this file checks the one message that DOES
 * exist and proves VRK Decor is not its recipient.
 */

const root = fileURLToPath(new URL('../../', import.meta.url));

const WATCHED_PATHS = [
  'features/enquiries',
  'app/(site)/quote',
  'lib/validation/enquiry.ts',
  'lib/rate-limit.ts',
];

function sourceFiles(relativePath: string): string[] {
  const absolute = join(root, relativePath);
  const stats = statSync(absolute);

  if (stats.isFile()) return [absolute];

  return readdirSync(absolute).flatMap((entry) =>
    sourceFiles(join(relativePath, entry)),
  );
}

function readWatchedSources(): { path: string; contents: string }[] {
  return WATCHED_PATHS.flatMap(sourceFiles)
    .filter((path) => /\.(ts|tsx)$/.test(path))
    .map((path) => ({
      path: path.replace(root, ''),
      contents: readFileSync(path, 'utf8'),
    }));
}

/** Comments discuss the rule constantly; only real code is being checked. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('the quote flow never notifies VRK Decor by email', () => {
  const sources = readWatchedSources().map(({ path, contents }) => ({
    path,
    code: stripComments(contents),
  }));

  it('has sources to check', () => {
    expect(sources.length).toBeGreaterThan(5);
  });

  it('does not address the business email anywhere in the quote path', () => {
    for (const { path, code } of sources) {
      expect(code, path).not.toContain(siteConfig.contact.email);
      expect(code.toLowerCase(), path).not.toContain('mailto:');
    }
  });

  it('does not import or call a mail transport', () => {
    const transports = [
      'nodemailer',
      'sendgrid',
      '@sendgrid',
      'postmark',
      'mailgun',
      'ses-client',
      '@aws-sdk/client-ses',
      'smtp',
      'resend',
    ];

    for (const { path, code } of sources) {
      const lowered = code.toLowerCase();
      for (const transport of transports) {
        expect(lowered, `${path} must not use ${transport}`).not.toContain(transport);
      }
    }
  });

  it('does not read an admin notification address from the environment', () => {
    for (const { path, code } of sources) {
      expect(code, path).not.toMatch(/ADMIN_(EMAIL|NOTIFICATION)/);
      expect(code, path).not.toMatch(/NOTIFY_[A-Z_]+/);
    }
  });
});

describe('the enquiry reaches the Admin Panel instead', () => {
  it('exposes the query the Admin Panel reads its inbox from', () => {
    // Read as source rather than imported: `data.ts` is `server-only`, which is
    // exactly the property that keeps the service-role client off the browser.
    const data = readFileSync(join(root, 'features/enquiries/data.ts'), 'utf8');

    expect(data).toContain("import 'server-only'");
    expect(data).toMatch(/export async function listEnquiries/);
    // The inbox read runs as the caller, so Row Level Security decides. It must
    // never be widened to the service role.
    expect(data).toMatch(/listEnquiries[\s\S]*createSupabaseServerClient/);
  });

  it('creates every enquiry with the pipeline status "new"', () => {
    const migration = readFileSync(
      join(root, 'supabase/migrations/20260831120000_initial_schema.sql'),
      'utf8',
    );

    expect(migration).toMatch(/status\s+enquiry_status not null default 'new'/);
  });

  it('never writes an enquiry status from the public request path', () => {
    const data = readFileSync(join(root, 'features/enquiries/data.ts'), 'utf8');
    const insertBlock = data.slice(
      data.indexOf(".from('enquiries')"),
      data.indexOf(".select('id')"),
    );

    expect(insertBlock).not.toMatch(/\bstatus:/);
    expect(insertBlock).not.toMatch(/internal_notes:/);
    expect(insertBlock).not.toMatch(/confirmation_email_sent_at:/);
  });
});

describe('P7 — the one message that exists goes to the customer', () => {
  function readEmailModule(name: string): string {
    return readFileSync(join(root, 'lib/email', name), 'utf8');
  }

  it("addresses the enquiry's own email address and nothing else", () => {
    const message = stripComments(readEmailModule('confirmation-message.ts'));

    // The recipient comes from the enquiry, never from configuration.
    expect(message).toMatch(/to:\s*details\.email/);
    expect(message).not.toMatch(/to:\s*siteConfig\.contact\.email/);
  });

  it('uses the business address only as a reply path', () => {
    const message = stripComments(readEmailModule('confirmation-message.ts'));
    const businessMentions = [...message.matchAll(/siteConfig\.contact\.email/g)]
      .length;

    expect(businessMentions).toBe(1);
    expect(message).toMatch(/replyTo:\s*siteConfig\.contact\.email/);
  });

  it('sends exactly one message per enquiry, to one recipient', () => {
    const transport = stripComments(readEmailModule('transport.ts'));
    expect(transport).toMatch(/to:\s*\[message\.to\]/);
    expect(transport).not.toMatch(/\bcc\b|\bbcc\b/i);
  });

  it('sends nothing when the customer gave no email address', () => {
    const send = stripComments(readEmailModule('send-confirmation.ts'));
    expect(send).toMatch(/if \(!details\.email\) return/);
  });
});

describe('P7 — the enquiry is persisted before anything else is attempted', () => {
  const action = readFileSync(join(root, 'features/enquiries/actions.ts'), 'utf8');

  it('creates the enquiry before it tries to send a confirmation', () => {
    const created = action.indexOf('await createEnquiry(');
    const confirmed = action.indexOf('await sendEnquiryConfirmation(');

    expect(created).toBeGreaterThan(-1);
    expect(confirmed).toBeGreaterThan(created);
  });

  it('returns a failure to the customer only for a failed enquiry, never a failed email', () => {
    const afterCreate = action.slice(action.indexOf('await createEnquiry('));
    const failureBranch = afterCreate.slice(
      0,
      afterCreate.indexOf('sendEnquiryConfirmation'),
    );

    // The only `status: 'failed'` after persistence is the one that reports the
    // enquiry itself failing. Nothing downstream may add another.
    expect(failureBranch).toContain("status: 'failed'");
    expect(
      afterCreate.slice(afterCreate.indexOf('sendEnquiryConfirmation')),
    ).not.toContain("status: 'failed'");
  });

  it('validates uploaded files before the enquiry is stored', () => {
    const validated = action.indexOf('validateReferenceImageUploads');
    const created = action.indexOf('await createEnquiry(');
    expect(validated).toBeGreaterThan(-1);
    expect(validated).toBeLessThan(created);
  });

  it('marks the confirmation timestamp only after a successful send', () => {
    const confirmation = stripComments(
      readFileSync(join(root, 'features/enquiries/confirmation.ts'), 'utf8'),
    );
    const guard = confirmation.indexOf("if (delivery.status !== 'sent') return");
    const mark = confirmation.indexOf('markConfirmationEmailSent(enquiryId)');

    expect(guard).toBeGreaterThan(-1);
    expect(mark).toBeGreaterThan(guard);
  });
});
