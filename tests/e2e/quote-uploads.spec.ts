import { createHash } from 'node:crypto';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

/**
 * P7 end to end — private reference uploads, the customer confirmation and the
 * WhatsApp/phone continuation.
 *
 * Like the P6 suite, this runs against the in-memory enquiry store that is
 * active when no database is configured, and every test presents itself as a
 * distinct client and phone number so the rate limiter does not make one test
 * look like another one's bug.
 *
 * The upload path exercised here is the real one: the same form, the same
 * Server Action and the same server-side validation a configured environment
 * uses. Only the final write differs.
 */

/*
  Resolved from the repository root rather than from `import.meta.url`:
  Playwright transpiles a spec that uses `import.meta` as an ES module, and the
  rest of this suite is CommonJS. Playwright always runs from the project root.
*/
const fixtures = join(process.cwd(), 'tests', 'fixtures', 'images');

function identity(testInfo: TestInfo) {
  const seed = createHash('sha256')
    .update(`uploads:${testInfo.project.name}:${testInfo.titlePath.join('>')}`)
    .digest();

  const octet = (index: number) => seed[index]! % 256;

  return {
    ip: `198.19.${octet(0)}.${octet(1)}`,
    phone: `9${String(seed.readUInt32BE(4) % 1_000_000_000).padStart(9, '0')}`,
  };
}

async function asFreshClient(page: Page, testInfo: TestInfo) {
  const { ip, phone } = identity(testInfo);
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip });
  return { ip, phone };
}

async function fillQuoteForm(page: Page, phone: string, email?: string) {
  await page.getByLabel('Your name').fill('Meena Rajan');
  await page.getByLabel('Phone or WhatsApp number').fill(phone);
  if (email) await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Type of event').selectOption('wedding');
  await page.getByLabel('Event date').fill('2027-02-14');
  await page.getByLabel('Venue').fill('Sea View Hall');
  await page.getByLabel('City').fill('Nagercoil');
  await page.getByRole('checkbox', { name: 'Floral Decoration' }).check();
  await page.getByRole('checkbox', { name: /I agree that VRK Decor/ }).check();
}

/** Writes a hostile file to a temporary path so the browser can attach it. */
function temporaryFile(name: string, contents: string | Uint8Array): string {
  const dir = mkdtempSync(join(tmpdir(), 'vrk-upload-'));
  const path = join(dir, name);
  writeFileSync(path, contents);
  return path;
}

const REAL = {
  jpeg: join(fixtures, 'reference-800x600.jpg'),
  png: join(fixtures, 'reference-640x480.png'),
  webp: join(fixtures, 'reference-1024x768-lossy.webp'),
  tooSmall: join(fixtures, 'too-small-100x80.png'),
};

test.describe('the reference-image control', () => {
  test('is present, optional, and says the images stay private', async ({ page }) => {
    await page.goto('/quote?design=golden-mandap-setting');

    const field = page.getByTestId('reference-image-field');
    await expect(field).toBeVisible();
    await expect(field).toContainText('(optional)');
    await expect(field).toContainText('Up to 3 pictures');
    await expect(field).toContainText('These stay private to your enquiry');
    await expect(field).toContainText('never published on this website');
  });

  test('accepts several files of the approved types only', async ({ page }) => {
    await page.goto('/quote');

    const input = page.getByTestId('reference-image-input');
    await expect(input).toHaveAttribute('multiple', '');
    await expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    await expect(input).toHaveAttribute('name', 'referenceImages');
  });

  test('lists back what the customer chose', async ({ page }) => {
    await page.goto('/quote');
    await page
      .getByTestId('reference-image-input')
      .setInputFiles([REAL.jpeg, REAL.png]);

    const list = page.getByTestId('reference-image-list');
    await expect(list).toContainText('reference-800x600.jpg');
    await expect(list).toContainText('reference-640x480.png');
  });
});

test.describe('submitting with reference images', () => {
  test('three images are accepted and the enquiry reaches the confirmation', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote?design=golden-mandap-setting');
    await fillQuoteForm(page, phone);
    await page
      .getByTestId('reference-image-input')
      .setInputFiles([REAL.jpeg, REAL.png, REAL.webp]);
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote/submitted?design=golden-mandap-setting');
    await expect(
      page.getByRole('heading', { name: 'Your request has reached us' }),
    ).toBeVisible();
    // The enquiry arrived whole, so nothing warns about a missing attachment.
    await expect(page.getByTestId('reference-images-partial')).toHaveCount(0);
  });

  test('an enquiry with no images at all still succeeds', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote');
    await fillQuoteForm(page, phone);
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote/submitted');
  });

  test('a fourth image is refused on the server, not silently dropped', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote');
    await fillQuoteForm(page, phone);
    await page
      .getByTestId('reference-image-input')
      .setInputFiles([REAL.jpeg, REAL.png, REAL.webp, REAL.jpeg]);
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote');
    await expect(page.getByTestId('quote-error-summary')).toContainText(
      'at most 3 inspiration images',
    );
  });

  test('a script renamed as a photograph is refused on its bytes', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);
    // The name says JPEG, the picker will report image/jpeg, and the content is
    // a PHP web shell. The server reads the bytes and refuses it.
    const hostile = temporaryFile(
      'holiday.jpg',
      `<?php system($_GET["c"]); ?>${' '.repeat(400)}`,
    );

    await page.goto('/quote');
    await fillQuoteForm(page, phone);
    await page.getByTestId('reference-image-input').setInputFiles(hostile);
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote');
    await expect(page.getByTestId('quote-error-summary')).toContainText(
      'not a JPG, PNG or WEBP image',
    );
  });

  test('an SVG is refused, whatever it is named', async ({ page }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);
    const svg = temporaryFile(
      'decor.png',
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><script>alert(1)</script></svg>',
    );

    await page.goto('/quote');
    await fillQuoteForm(page, phone);
    await page.getByTestId('reference-image-input').setInputFiles(svg);
    await page.getByTestId('quote-submit').click();

    await expect(page.getByTestId('quote-error-summary')).toBeVisible();
    await expect(page).toHaveURL('/quote');
  });

  test('an image far too small to be useful is refused', async ({ page }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote');
    await fillQuoteForm(page, phone);
    await page.getByTestId('reference-image-input').setInputFiles(REAL.tooSmall);
    await page.getByTestId('quote-submit').click();

    await expect(page.getByTestId('quote-error-summary')).toContainText('200x200');
  });

  test('a rejected attachment does not consume the duplicate window', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);
    const hostile = temporaryFile('bad.jpg', 'not an image at all'.repeat(20));

    await page.goto('/quote?design=golden-mandap-setting');
    await fillQuoteForm(page, phone);
    await page.getByTestId('reference-image-input').setInputFiles(hostile);
    await page.getByTestId('quote-submit').click();
    await expect(page.getByTestId('quote-error-summary')).toBeVisible();

    // The customer fixes the attachment and sends the same request again. It
    // must be accepted as a NEW enquiry, not answered "we already have it" for
    // a lead that was never created.
    await page.goto('/quote?design=golden-mandap-setting');
    await fillQuoteForm(page, phone);
    await page.getByTestId('reference-image-input').setInputFiles(REAL.jpeg);
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote/submitted?design=golden-mandap-setting');
    await expect(
      page.getByRole('heading', { name: 'Your request has reached us' }),
    ).toBeVisible();
  });

  test('the rest of the form survives a rejected attachment', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);
    const hostile = temporaryFile('bad.jpg', 'still not an image'.repeat(20));

    await page.goto('/quote');
    await fillQuoteForm(page, phone);
    await page.getByLabel('Venue').fill('Kanyakumari Grand');
    await page.getByTestId('reference-image-input').setInputFiles(hostile);
    await page.getByTestId('quote-submit').click();

    await expect(page.getByTestId('quote-error-summary')).toBeVisible();
    await expect(page.getByLabel('Venue')).toHaveValue('Kanyakumari Grand');
    await expect(page.getByLabel('Your name')).toHaveValue('Meena Rajan');
  });
});

test.describe('without JavaScript', () => {
  test('the upload control is a plain file input that still works', async ({
    browser,
  }, testInfo) => {
    const { ip, phone } = identity(testInfo);
    const context = await browser.newContext({
      javaScriptEnabled: false,
      extraHTTPHeaders: { 'x-forwarded-for': ip },
    });
    const page = await context.newPage();

    try {
      await page.goto('/quote?design=golden-mandap-setting');

      const input = page.getByTestId('reference-image-input');
      await expect(input).toBeVisible();
      await expect(page.locator('form')).toHaveAttribute(
        'enctype',
        'multipart/form-data',
      );

      await fillQuoteForm(page, phone);
      await input.setInputFiles([REAL.jpeg, REAL.png]);
      await page.getByTestId('quote-submit').click();

      await expect(page).toHaveURL('/quote/submitted?design=golden-mandap-setting');
    } finally {
      await context.close();
    }
  });

  test('a bad attachment is refused server-side and rendered server-side', async ({
    browser,
  }, testInfo) => {
    const { ip, phone } = identity(testInfo);
    const hostile = temporaryFile('no-js.jpg', 'plain text pretending'.repeat(20));
    const context = await browser.newContext({
      javaScriptEnabled: false,
      extraHTTPHeaders: { 'x-forwarded-for': ip },
    });
    const page = await context.newPage();

    try {
      await page.goto('/quote');
      await fillQuoteForm(page, phone);
      await page.getByTestId('reference-image-input').setInputFiles(hostile);
      await page.getByTestId('quote-submit').click();

      await expect(page.getByTestId('quote-error-summary')).toContainText(
        'not a JPG, PNG or WEBP image',
      );
    } finally {
      await context.close();
    }
  });
});

test.describe('nothing private is ever exposed', () => {
  test('no page in the quote flow references the private bucket', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote?design=golden-mandap-setting');
    await fillQuoteForm(page, phone);
    await page.getByTestId('reference-image-input').setInputFiles([REAL.jpeg]);
    await page.getByTestId('quote-submit').click();
    await expect(page).toHaveURL(/\/quote\/submitted/);

    for (const path of ['/quote/submitted?design=golden-mandap-setting', '/gallery']) {
      await page.goto(path);
      const html = await page.content();
      expect(html, path).not.toContain('/references/');
      expect(html, path).not.toContain('object/public/references');
      expect(html, path).not.toMatch(/enquiries\/[0-9a-f-]{36}\//);
      expect(html, path).not.toContain('reference-800x600.jpg');
    }
  });

  test('the confirmation URL carries no enquiry identifier', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote?design=golden-mandap-setting');
    await fillQuoteForm(page, phone, 'meena@example.test');
    await page.getByTestId('reference-image-input').setInputFiles([REAL.png]);
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL(/\/quote\/submitted/);
    expect(page.url()).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/);
    expect(page.url()).not.toContain('meena@example.test');
    expect(page.url()).not.toContain(phone);
  });
});

test.describe('the customer confirmation email', () => {
  test('is offered honestly on the form', async ({ page }) => {
    await page.goto('/quote');
    await expect(page.getByText('email you a confirmation')).toBeVisible();
  });

  test('is not promised when no provider is configured', async ({ page }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote');
    await fillQuoteForm(page, phone, 'meena@example.test');
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote/submitted');
    // No provider is configured in this environment, so no message was sent,
    // so the page must not claim one was. A promise nobody kept is worse than
    // no promise at all.
    await expect(page.getByTestId('confirmation-email-sent')).toHaveCount(0);
  });
});

test.describe('WhatsApp and phone continuation', () => {
  test('the confirmation offers both channels, with the design already written', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote?design=golden-mandap-setting');
    await fillQuoteForm(page, phone);
    await page.getByTestId('quote-submit').click();
    await expect(page).toHaveURL('/quote/submitted?design=golden-mandap-setting');

    const whatsApp = page.getByTestId('continue-whatsapp');
    const href = await whatsApp.getAttribute('href');
    expect(href).toMatch(/^https:\/\/wa\.me\/919994072435\?text=/);

    const message = decodeURIComponent(href!.split('text=')[1]!);
    expect(message).toContain('Golden Mandap Setting');
    // The message is built from public content only.
    expect(message).not.toContain(phone);
    expect(message).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/);

    await expect(page.getByTestId('continue-call')).toHaveAttribute(
      'href',
      'tel:+919994072435',
    );
    await expect(page.getByTestId('continuation-design')).toContainText(
      'Golden Mandap Setting',
    );
  });

  test('a general enquiry still gets a usable WhatsApp link', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote');
    await fillQuoteForm(page, phone);
    await page.getByTestId('quote-submit').click();
    await expect(page).toHaveURL('/quote/submitted');

    const href = await page.getByTestId('continue-whatsapp').getAttribute('href');
    expect(href).toMatch(/^https:\/\/wa\.me\/919994072435\?text=/);
    await expect(page.getByTestId('continuation-design')).toHaveCount(0);
  });

  test('the quote form itself offers WhatsApp with the design already written', async ({
    page,
  }) => {
    await page.goto('/quote?design=golden-mandap-setting');

    const href = await page
      .getByTestId('quote-whatsapp-continuation')
      .getAttribute('href');
    expect(decodeURIComponent(href!)).toContain('Golden Mandap Setting');
  });

  test('an invented design slug produces a plain link, revealing nothing', async ({
    page,
  }) => {
    await page.goto('/quote/submitted?design=some-unpublished-design');

    const href = await page.getByTestId('continue-whatsapp').getAttribute('href');
    expect(decodeURIComponent(href!)).not.toContain('some-unpublished-design');
    await expect(page.getByTestId('continuation-design')).toHaveCount(0);
  });
});
