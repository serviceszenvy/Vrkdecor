import { expect, test, type Page } from '@playwright/test';

/**
 * Portfolio verification — Requirements sections 8, 9, 10 and 11.
 *
 * These run against the sample dataset that is active when no database is
 * configured, which exercises exactly the same components and data shape as
 * real published Designs.
 */

// The design detail page embeds an external video. Tests must not depend on a
// third-party network call, so the embed is stubbed out.
test.beforeEach(async ({ page }) => {
  await page.route(/youtube(-nocookie)?\.com/, (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
});

test.describe('portfolio listing', () => {
  test('lists designs with cover images and links each to its parent design', async ({
    page,
  }) => {
    await page.goto('/our-work');

    const cards = page.locator('ul > li').filter({ has: page.locator('img') });
    await expect(cards.first()).toBeVisible();

    // One stretched link per card: the whole card is the target, and there is
    // no duplicate link to the same destination.
    const cardLinks = cards.first().getByRole('link');
    await expect(cardLinks).toHaveCount(1);
    await expect(cardLinks.first()).toHaveAttribute('href', /^\/our-work\/[a-z0-9-]+$/);
    await expect(cards.first().locator('img').first()).toBeVisible();
  });

  test('filters by occasion, style and service, and each filter is linkable', async ({
    page,
  }) => {
    await page.goto('/our-work');
    const countText = page.getByRole('status');
    const unfiltered = await countText.textContent();

    await page.getByRole('link', { name: 'Wedding', exact: true }).click();
    await expect(page).toHaveURL(/occasion=wedding/);
    await expect(countText).not.toHaveText(unfiltered ?? '');

    // The filtered view is a real URL that can be shared.
    await page.goto('/our-work?occasion=wedding');
    await expect(
      page.getByRole('link', { name: 'Wedding', exact: true }),
    ).toHaveAttribute('aria-current', 'true');

    await page.goto('/our-work?style=royal');
    await expect(page.getByRole('status')).toContainText('match your filters');

    await page.goto('/our-work?service=floral-decoration');
    await expect(page.getByRole('status')).toContainText('match your filters');
  });

  test('combining filters that match nothing shows an empty state, not an error', async ({
    page,
  }) => {
    const response = await page.goto('/our-work?occasion=wedding&style=pastel');
    expect(response?.status()).toBe(200);
    await expect(page.getByText('No designs match those filters')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Clear filters' }).first(),
    ).toBeVisible();
  });

  test('works without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto('/our-work?occasion=wedding');
    await expect(page.getByRole('status')).toContainText('match your filters');
    await expect(page.locator('img').first()).toBeVisible();

    await context.close();
  });
});

test.describe('design detail', () => {
  test('shows parent metadata once and the full ordered gallery', async ({ page }) => {
    await page.goto('/our-work');
    const firstCard = page
      .locator('ul > li')
      .filter({ has: page.locator('img') })
      .first();
    await firstCard.getByRole('link').first().click();

    await expect(page).toHaveURL(/\/our-work\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    // Parent information appears once, on the design, and is inherited by every
    // related image rather than repeated per photograph.
    await expect(page.getByRole('term').filter({ hasText: 'Occasion' })).toHaveCount(1);
    await expect(page.getByRole('term').filter({ hasText: 'Services' })).toHaveCount(1);

    const thumbs = page.getByTestId('gallery-thumb');
    await expect(await thumbs.count()).toBeGreaterThan(1);
  });

  test('offers a design-level Get Quote CTA carrying the design', async ({ page }) => {
    await page.goto('/our-work/golden-mandap-setting');

    const cta = page.getByTestId('design-quote-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/quote?design=golden-mandap-setting');
  });

  test('an unknown or unpublished slug returns 404', async ({ page }) => {
    const response = await page.goto('/our-work/no-such-design');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });

  test('renders an optional video when the design has one', async ({ page }) => {
    await page.goto('/our-work/garden-reception-stage');
    await expect(page.getByRole('heading', { name: 'Video' })).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(1);
  });

  test('designs without a video show no video section', async ({ page }) => {
    await page.goto('/our-work/pastel-engagement-backdrop');
    await expect(page.getByRole('heading', { name: 'Video' })).toHaveCount(0);
  });
});

test.describe('gallery and lightbox', () => {
  test('every photograph resolves to its parent design', async ({ page }) => {
    await page.goto('/gallery');

    const thumbs = page.getByTestId('gallery-thumb');
    const count = await thumbs.count();
    expect(count).toBeGreaterThan(5);

    await thumbs.first().click();
    const lightbox = page.getByTestId('lightbox');
    await expect(lightbox).toBeVisible();

    // The photo-level quote CTA always carries a design.
    const quote = page.getByTestId('lightbox-quote-cta');
    await expect(quote).toHaveAttribute('href', /\/quote\?design=[a-z0-9-]+&photo=/);
    await expect(lightbox.getByRole('link', { name: 'View design' })).toHaveAttribute(
      'href',
      /^\/our-work\/[a-z0-9-]+$/,
    );
  });

  test('lightbox supports keyboard navigation and closes on Escape', async ({
    page,
  }) => {
    await page.goto('/gallery');
    const thumbs = page.getByTestId('gallery-thumb');
    await thumbs.first().click();

    const lightbox = page.getByTestId('lightbox');
    await expect(lightbox).toBeVisible();
    await expect(lightbox).toContainText('1 of');

    await page.keyboard.press('ArrowRight');
    await expect(lightbox).toContainText('2 of');

    await page.keyboard.press('ArrowLeft');
    await expect(lightbox).toContainText('1 of');

    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
    await expect(thumbs.first()).toBeFocused();
  });

  test('lightbox wraps around at both ends', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByTestId('gallery-thumb').first().click();

    const lightbox = page.getByTestId('lightbox');
    const total = (await lightbox.textContent())?.match(/1 of (\d+)/)?.[1];
    expect(total).toBeTruthy();

    await page.getByTestId('lightbox-previous').click();
    await expect(lightbox).toContainText(`${total} of ${total}`);
  });

  test('photo-level quote CTA differs per photograph but keeps the same design', async ({
    page,
  }) => {
    await page.goto('/our-work/golden-mandap-setting');
    await page.getByTestId('gallery-thumb').first().click();

    const cta = page.getByTestId('lightbox-quote-cta');
    const first = await cta.getAttribute('href');

    await page.getByTestId('lightbox-next').click();
    const second = await cta.getAttribute('href');

    expect(first).not.toBe(second);
    expect(first).toContain('design=golden-mandap-setting');
    expect(second).toContain('design=golden-mandap-setting');
  });
});

test.describe('mobile gallery', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('swiping moves between photographs', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByTestId('gallery-thumb').first().click();

    const lightbox = page.getByTestId('lightbox');
    await expect(lightbox).toContainText('1 of');

    const box = await lightbox.boundingBox();
    expect(box).not.toBeNull();
    const y = box!.y + box!.height / 2;

    // Swipe left -> next photograph.
    await lightbox.dispatchEvent('touchstart', {
      changedTouches: [{ clientX: 300, clientY: y, identifier: 0 }],
    });
    await lightbox.dispatchEvent('touchend', {
      changedTouches: [{ clientX: 120, clientY: y, identifier: 0 }],
    });
    await expect(lightbox).toContainText('2 of');

    // Swipe right -> previous photograph.
    await lightbox.dispatchEvent('touchstart', {
      changedTouches: [{ clientX: 120, clientY: y, identifier: 0 }],
    });
    await lightbox.dispatchEvent('touchend', {
      changedTouches: [{ clientX: 320, clientY: y, identifier: 0 }],
    });
    await expect(lightbox).toContainText('1 of');
  });

  test('a vertical drag does not change photograph', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByTestId('gallery-thumb').first().click();

    const lightbox = page.getByTestId('lightbox');
    await lightbox.dispatchEvent('touchstart', {
      changedTouches: [{ clientX: 200, clientY: 200, identifier: 0 }],
    });
    await lightbox.dispatchEvent('touchend', {
      changedTouches: [{ clientX: 210, clientY: 600, identifier: 0 }],
    });

    await expect(lightbox).toContainText('1 of');
  });
});

test.describe('portfolio images actually render', () => {
  /**
   * A file can be present, valid on disk and served with a 200 and still fail
   * to decode in the browser, leaving a silently blank tile. These tests assert
   * the rendered result rather than the response.
   *
   * Images are checked WHILE THEY ARE IN VIEW. Lazily-loaded images that scroll
   * back out of the viewport can have their in-flight load abandoned by the
   * browser, so a single end-of-page check would report healthy images as
   * broken.
   */
  async function brokenImagesInView(page: Page, selector: string) {
    return page.evaluate((sel) => {
      const inView = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      };

      return [...document.querySelectorAll<HTMLImageElement>(sel)]
        .filter(inView)
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src || '(no source)');
    }, selector);
  }

  test('every gallery photograph decodes as it comes into view', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/gallery');

    const selector = '[data-testid="gallery-thumb"] img';
    const total = await page.locator(selector).count();
    expect(total).toBeGreaterThan(5);

    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const step = await page.evaluate(() => Math.round(window.innerHeight * 0.8));

    let checked = 0;
    for (let y = 0; y < pageHeight; y += step) {
      await page.evaluate((top) => window.scrollTo(0, top), y);

      await expect
        .poll(() => brokenImagesInView(page, selector), {
          timeout: 15_000,
          message: `images visible at scroll position ${y} must decode`,
        })
        .toEqual([]);

      checked += (await page.locator(selector).count()) > 0 ? 1 : 0;
    }

    expect(checked).toBeGreaterThan(0);
  });

  test('design cover images decode on the listing', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/our-work');

    await expect
      .poll(() => brokenImagesInView(page, 'main img'), {
        timeout: 20_000,
        message: 'every visible cover image must decode',
      })
      .toEqual([]);
  });

  test('the lightbox image decodes when opened', async ({ page }) => {
    await page.goto('/our-work/golden-mandap-setting');
    await page.getByTestId('gallery-thumb').first().click();

    await expect
      .poll(() => brokenImagesInView(page, '[data-testid="lightbox"] img'), {
        timeout: 20_000,
        message: 'the opened photograph must decode',
      })
      .toEqual([]);
  });
});

test.describe('sample content is clearly labelled', () => {
  test('shows a notice on every portfolio surface while samples are active', async ({
    page,
  }) => {
    for (const path of ['/our-work', '/gallery', '/our-work/golden-mandap-setting']) {
      await page.goto(path);
      await expect(page.locator('[data-sample-content-notice]'), path).toBeVisible();
    }
  });
});
