import { createHash } from 'node:crypto';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

/**
 * The quote engine, end to end — Requirements & SOW section 11.
 *
 * Covers the journey the Master Implementation Specification section 5 names:
 * Our Work → Design → gallery photograph → Get Quote → submit → confirmation.
 *
 * Two things about these tests are deliberate.
 *
 * The suite runs against the sample dataset and the in-memory enquiry store
 * that are active when no database is configured. It exercises the same
 * components, the same Server Action, the same validation and the same
 * design-resolution path a configured environment uses; only the final write
 * differs.
 *
 * Each test presents itself as a distinct client and phone number. The quote
 * form is rate limited per client and per number, exactly as it will be in
 * production, so tests that shared an identity would throttle each other and
 * report a working limiter as a broken form.
 */

/** A per-test client address and phone number, stable across reruns. */
function identity(testInfo: TestInfo) {
  const seed = createHash('sha256')
    .update(`${testInfo.project.name}:${testInfo.titlePath.join('>')}`)
    .digest();

  const octet = (index: number) => seed[index]! % 256;

  return {
    // 198.18.0.0/15 — the RFC 2544 benchmarking range, never routable, and wide
    // enough that two tests do not collide onto one address.
    ip: `198.18.${octet(0)}.${octet(1)}`,
    phone: `9${String(seed.readUInt32BE(4) % 1_000_000_000).padStart(9, '0')}`,
  };
}

async function asFreshClient(page: Page, testInfo: TestInfo) {
  const { ip, phone } = identity(testInfo);
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip });
  return { ip, phone };
}

type FormOverrides = Partial<{
  name: string;
  phone: string;
  eventDate: string;
  venue: string;
  city: string;
  email: string;
  notes: string;
  eventType: string;
  consent: boolean;
  service: string;
}>;

async function fillQuoteForm(page: Page, phone: string, overrides: FormOverrides = {}) {
  await page.getByLabel('Your name').fill(overrides.name ?? 'Meena Rajan');
  await page.getByLabel('Phone or WhatsApp number').fill(overrides.phone ?? phone);
  if (overrides.email) await page.getByLabel('Email address').fill(overrides.email);

  await page.getByLabel('Type of event').selectOption(overrides.eventType ?? 'wedding');
  await page.getByLabel('Event date').fill(overrides.eventDate ?? '2027-02-14');
  await page.getByLabel('Venue').fill(overrides.venue ?? 'Sea View Hall');
  await page.getByLabel('City').fill(overrides.city ?? 'Nagercoil');

  await page
    .getByRole('checkbox', { name: overrides.service ?? 'Floral Decoration' })
    .check();

  if (overrides.notes) await page.getByLabel('Notes').fill(overrides.notes);
  if (overrides.consent !== false) {
    await page.getByRole('checkbox', { name: /I agree that VRK Decor/ }).check();
  }
}

test.describe('reaching the quote form', () => {
  test('the site-wide CTA opens a general quote request', async ({ page }) => {
    await page.goto('/');
    // The header CTA on a wide viewport, the sticky action bar on a narrow one:
    // whichever is actually on screen must reach the quote form.
    await page
      .getByRole('link', { name: /^Get a Quote$|^Get Quote$/ })
      .filter({ visible: true })
      .first()
      .click();

    await expect(page).toHaveURL('/quote');
    await expect(
      page.getByRole('heading', { name: 'Request a quotation' }),
    ).toBeVisible();
    await expect(page.getByTestId('captured-design')).toHaveCount(0);
  });

  test('a design-level CTA carries the parent Design into the form', async ({
    page,
  }) => {
    await page.goto('/our-work/golden-mandap-setting');
    await page.getByTestId('design-quote-cta').click();

    await expect(page).toHaveURL('/quote?design=golden-mandap-setting');

    const captured = page.getByTestId('captured-design');
    await expect(captured).toBeVisible();
    await expect(captured).toHaveAttribute('data-design-slug', 'golden-mandap-setting');
    await expect(captured).toContainText('Quote for this design');
  });

  test('a photo-level CTA carries the same parent Design, plus the photograph', async ({
    page,
  }) => {
    await page.goto('/gallery');
    await page.getByTestId('gallery-thumb').nth(2).click();

    const cta = page.getByTestId('lightbox-quote-cta');
    const href = await cta.getAttribute('href');
    expect(href).toMatch(/\/quote\?design=[a-z0-9-]+&photo=/);
    const slug = new URL(href!, 'http://localhost').searchParams.get('design');

    await cta.click();

    const captured = page.getByTestId('captured-design');
    await expect(captured).toBeVisible();
    await expect(captured).toHaveAttribute('data-design-slug', slug!);
    await expect(captured).toContainText('Quote for this photograph');
  });

  test('every photograph of a design leads to a quote for that same design', async ({
    page,
  }) => {
    await page.goto('/our-work/golden-mandap-setting');
    const thumbs = page.getByTestId('gallery-thumb');
    const count = await thumbs.count();
    expect(count).toBeGreaterThan(1);

    for (let index = 0; index < count; index += 1) {
      await thumbs.nth(index).click();
      const href = await page.getByTestId('lightbox-quote-cta').getAttribute('href');
      expect(href, `photograph ${index}`).toContain('design=golden-mandap-setting');
      await page.keyboard.press('Escape');
    }
  });
});

test.describe('the customer never re-selects the design', () => {
  test('the form offers no control for choosing a design', async ({ page }) => {
    await page.goto('/quote?design=golden-mandap-setting');

    // The captured design is presented, not offered as a choice.
    await expect(page.getByTestId('captured-design')).toBeVisible();
    await expect(page.getByTestId('captured-design')).toContainText(
      'You do not need to choose it again',
    );

    // No visible control anywhere on the page is bound to the design.
    const form = page.locator('form');
    await expect(form.locator('select[name="design"]')).toHaveCount(0);
    await expect(form.locator('input[name="design"]:not([type="hidden"])')).toHaveCount(
      0,
    );
    await expect(form.locator('input[name="design"][type="hidden"]')).toHaveCount(1);

    // Nothing on the form lets a visitor pick a design by name either.
    const selects = form.locator('select');
    await expect(selects).toHaveCount(1);
    await expect(selects.first()).toHaveAccessibleName(/Type of event/);
  });

  test('the design shown is the one in the link, not the one clicked last', async ({
    page,
  }) => {
    await page.goto('/quote?design=pastel-engagement-backdrop');
    await expect(page.getByTestId('captured-design-name')).toHaveText(
      /pastel|engagement/i,
    );
  });

  test('a photograph from another design is discarded, and the parent stands', async ({
    page,
  }) => {
    // Take a real photo id that belongs to a different design.
    await page.goto('/our-work/pastel-engagement-backdrop');
    await page.getByTestId('gallery-thumb').first().click();
    const foreign = new URL(
      (await page.getByTestId('lightbox-quote-cta').getAttribute('href'))!,
      'http://localhost',
    ).searchParams.get('photo');

    await page.goto(`/quote?design=golden-mandap-setting&photo=${foreign}`);

    const captured = page.getByTestId('captured-design');
    await expect(captured).toHaveAttribute('data-design-slug', 'golden-mandap-setting');
    // The mismatched photograph is dropped, so this is a design-level quote.
    await expect(captured).toContainText('Quote for this design');
    await expect(page.locator('input[name="photo"]')).toHaveCount(0);
  });

  test('a design that is not publicly available is refused, not silently attached', async ({
    page,
  }) => {
    await page.goto('/quote?design=some-unpublished-design');

    await expect(page.getByTestId('unavailable-design-notice')).toBeVisible();
    await expect(page.getByTestId('captured-design')).toHaveCount(0);
    await expect(page.locator('input[name="design"]')).toHaveCount(0);
  });
});

test.describe('submitting a quote request', () => {
  test('a complete request from a photograph reaches the confirmation', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/gallery');
    await page.getByTestId('gallery-thumb').first().click();
    await page.getByTestId('lightbox-quote-cta').click();

    await expect(page.getByTestId('captured-design')).toBeVisible();
    await fillQuoteForm(page, phone, { email: 'meena@example.test' });
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote/submitted');
    await expect(
      page.getByRole('heading', { name: 'Your request has reached us' }),
    ).toBeVisible();
    await expect(page.getByTestId('quote-next-steps')).toBeVisible();
  });

  test('a general request with no design also succeeds', async ({ page }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote');
    await fillQuoteForm(page, phone);
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote/submitted');
  });

  test('the confirmation page cannot be resubmitted by refreshing', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote?design=golden-mandap-setting');
    await fillQuoteForm(page, phone);
    await page.getByTestId('quote-submit').click();
    await expect(page).toHaveURL('/quote/submitted');

    await page.reload();
    await expect(page).toHaveURL('/quote/submitted');
    await expect(
      page.getByRole('heading', { name: 'Your request has reached us' }),
    ).toBeVisible();
  });

  test('the same request sent twice produces one enquiry, not two', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote?design=golden-mandap-setting');
    await fillQuoteForm(page, phone);
    await page.getByTestId('quote-submit').click();
    await expect(page).toHaveURL('/quote/submitted');

    await page.goto('/quote?design=golden-mandap-setting');
    await fillQuoteForm(page, phone);
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote/submitted?repeat=1');
    await expect(
      page.getByRole('heading', { name: 'We already have your request' }),
    ).toBeVisible();
  });
});

test.describe('validation', () => {
  test('an empty submission is refused and stays on the form', async ({
    page,
  }, testInfo) => {
    await asFreshClient(page, testInfo);
    await page.goto('/quote');

    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote');
    const summary = page.getByTestId('quote-error-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('Please enter your name.');
    await expect(summary).toContainText('Please enter a phone or WhatsApp number.');
    await expect(summary).toContainText('Please choose your event date.');
    await expect(summary).toContainText('Please enter the venue.');
    await expect(summary).toContainText('Please enter the city.');
    await expect(summary).toContainText('Please choose at least one service');
    await expect(summary).toContainText('Please agree to us contacting you');
  });

  test('a request without consent is refused', async ({ page }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);
    await page.goto('/quote?design=golden-mandap-setting');

    await fillQuoteForm(page, phone, { consent: false });
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL(/\/quote\?design=golden-mandap-setting/);
    await expect(page.getByTestId('quote-error-summary')).toContainText(
      'Please agree to us contacting you',
    );
  });

  test('an invalid phone number is refused with a helpful message', async ({
    page,
  }, testInfo) => {
    await asFreshClient(page, testInfo);
    await page.goto('/quote');

    await fillQuoteForm(page, '12345');
    await page.getByTestId('quote-submit').click();

    await expect(page.getByTestId('quote-error-summary')).toContainText(
      'valid mobile number',
    );
  });

  test('a date in the past is refused', async ({ page }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);
    await page.goto('/quote');

    await fillQuoteForm(page, phone, { eventDate: '2020-01-01' });
    await page.getByTestId('quote-submit').click();

    await expect(page.getByTestId('quote-error-summary')).toContainText(
      'has not already passed',
    );
  });

  test('what the customer already typed is preserved after an error', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);
    await page.goto('/quote');

    await fillQuoteForm(page, phone, {
      name: 'Anitha Kumar',
      venue: 'Kanyakumari Grand',
      notes: 'Two ceremonies, morning and evening.',
      consent: false,
    });
    await page.getByTestId('quote-submit').click();

    await expect(page.getByTestId('quote-error-summary')).toBeVisible();
    await expect(page.getByLabel('Your name')).toHaveValue('Anitha Kumar');
    await expect(page.getByLabel('Venue')).toHaveValue('Kanyakumari Grand');
    await expect(page.getByLabel('Notes')).toHaveValue(
      'Two ceremonies, morning and evening.',
    );
    await expect(
      page.getByRole('checkbox', { name: 'Floral Decoration' }),
    ).toBeChecked();
  });

  test('the captured design survives a validation failure', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);
    await page.goto('/quote?design=golden-mandap-setting&photo=wedding-royal-image-2');

    await fillQuoteForm(page, phone, { consent: false });
    await page.getByTestId('quote-submit').click();

    await expect(page.getByTestId('quote-error-summary')).toBeVisible();
    await expect(page.getByTestId('captured-design')).toHaveAttribute(
      'data-design-slug',
      'golden-mandap-setting',
    );
    await expect(page.locator('input[name="photo"]')).toHaveValue(
      'wedding-royal-image-2',
    );
  });

  test('errors are announced and each one links to its field', async ({
    page,
  }, testInfo) => {
    await asFreshClient(page, testInfo);
    await page.goto('/quote');
    await page.getByTestId('quote-submit').click();

    const summary = page.getByTestId('quote-error-summary');
    await expect(summary).toHaveAttribute('role', 'alert');
    await expect(
      summary.getByRole('link', { name: 'Please enter your name.' }),
    ).toHaveAttribute('href', '#field-name');
    await expect(page.getByLabel('Your name')).toHaveAttribute('aria-invalid', 'true');
  });
});

test.describe('rate limiting', () => {
  test('a client sending request after request is asked to wait', async ({
    page,
  }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    // The per-phone limit is lower than the per-client limit, so vary the
    // number: this test is about one client, not one customer.
    for (let index = 0; index < 5; index += 1) {
      await page.goto('/quote');
      await fillQuoteForm(
        page,
        `9${phone.slice(1, 8)}${String(index).padStart(2, '0')}`,
        {
          eventDate: `2027-03-${String(index + 10).padStart(2, '0')}`,
        },
      );
      await page.getByTestId('quote-submit').click();
      await expect(page, `submission ${index}`).toHaveURL(/\/quote\/submitted/);
    }

    await page.goto('/quote');
    await fillQuoteForm(page, `9${phone.slice(1, 8)}99`, { eventDate: '2027-04-01' });
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote');
    await expect(page.getByTestId('quote-error-summary')).toContainText(
      'already received several requests',
    );
  });
});

test.describe('without JavaScript', () => {
  test('the quote form still validates and still submits', async ({
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
      await expect(page.getByTestId('captured-design')).toBeVisible();

      // An invalid submission comes back rendered by the server.
      await page.getByTestId('quote-submit').click();
      await expect(page.getByTestId('quote-error-summary')).toBeVisible();
      await expect(page.getByTestId('captured-design')).toBeVisible();

      await fillQuoteForm(page, phone);
      await page.getByTestId('quote-submit').click();

      await expect(page).toHaveURL('/quote/submitted');
    } finally {
      await context.close();
    }
  });
});

test.describe('demonstration mode', () => {
  test('says plainly that nothing is delivered while no database is connected', async ({
    page,
  }) => {
    await page.goto('/quote');
    await expect(page.locator('[data-local-enquiry-notice]')).toBeVisible();
    await expect(page.locator('[data-local-enquiry-notice]')).toContainText(
      'not delivered to VRK Decor',
    );
  });
});

test.describe('the confirmation page', () => {
  test('is not indexable', async ({ page }) => {
    await page.goto('/quote/submitted');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });

  test('carries no enquiry identifier in its URL', async ({ page }, testInfo) => {
    const { phone } = await asFreshClient(page, testInfo);

    await page.goto('/quote');
    await fillQuoteForm(page, phone);
    await page.getByTestId('quote-submit').click();

    await expect(page).toHaveURL('/quote/submitted');
    expect(page.url()).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/);
  });
});
