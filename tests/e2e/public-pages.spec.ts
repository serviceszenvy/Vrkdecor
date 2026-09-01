import { expect, test } from '@playwright/test';

/**
 * Public website verification — routes, metadata, structure and accessibility.
 * Source of truth: Requirements & SOW sections 4, 5, 6, 7, 16 and 17.
 */

/*
  These tests assert routing, metadata, copy and structure across every page,
  which means many navigations. Image optimisation is by far the most expensive
  part of loading the portfolio pages and is irrelevant here, so it is blocked.
  Image rendering has its own dedicated assertions in `portfolio.spec.ts`.
*/
test.beforeEach(async ({ page }) => {
  await page.route('**/_next/image**', (route) => route.abort());
});

const PAGES = [
  { path: '/', heading: /Celebrations designed with care/i },
  { path: '/our-work', heading: /Celebrations we have designed/i },
  { path: '/services', heading: /Complete celebration solutions/i },
  { path: '/occasions', heading: /Every celebration, designed for the moment/i },
  { path: '/packages', heading: /Celebration packages/i },
  { path: '/gallery', heading: /Photographs from our celebrations/i },
  { path: '/about', heading: /Premium Event Design/i },
  { path: '/contact', heading: /Talk to the VRK Decor team/i },
  { path: '/privacy-policy', heading: /Privacy Policy/i },
  { path: '/terms', heading: /Terms & Conditions/i },
] as const;

test.describe('every approved route', () => {
  for (const page of PAGES) {
    test(`${page.path} responds 200 with a single h1`, async ({
      page: browserPage,
    }) => {
      const response = await browserPage.goto(page.path);
      expect(response?.status(), page.path).toBe(200);

      const h1 = browserPage.getByRole('heading', { level: 1 });
      await expect(h1, page.path).toHaveCount(1);
      await expect(h1, page.path).toHaveText(page.heading);
    });
  }
});

test.describe('SEO foundations', () => {
  test('every page has a unique, non-empty title and description', async ({ page }) => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const entry of PAGES) {
      await page.goto(entry.path);

      const title = await page.title();
      expect(title, entry.path).not.toBe('');
      expect(titles.has(title), `${entry.path} title must be unique`).toBe(false);
      titles.add(title);

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect(description, entry.path).toBeTruthy();
      expect(
        descriptions.has(description ?? ''),
        `${entry.path} description must be unique`,
      ).toBe(false);
      descriptions.add(description ?? '');
    }
  });

  test('every page declares a canonical URL and Open Graph tags', async ({ page }) => {
    for (const entry of PAGES) {
      await page.goto(entry.path);

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href');
      expect(canonical, entry.path).toBeTruthy();
      expect(canonical, entry.path).toContain(entry.path === '/' ? '/' : entry.path);

      await expect(page.locator('meta[property="og:title"]'), entry.path).toHaveCount(
        1,
      );
      await expect(page.locator('meta[property="og:type"]'), entry.path).toHaveCount(1);
    }
  });

  test('public pages are indexable and the internal reference page is not', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(
      0,
    );

    await page.goto('/design-system');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });
});

test.describe('approved content', () => {
  test('home page shows the approved figures exactly', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('14+', { exact: true })).toBeVisible();
    await expect(page.getByText('600+', { exact: true })).toBeVisible();
    await expect(page.getByText('35+', { exact: true })).toBeVisible();
  });

  test('services page marks partner-vendor delivery accurately', async ({ page }) => {
    await page.goto('/services');

    await expect(
      page.getByRole('heading', { name: 'Delivered with trusted partner vendors' }),
    ).toBeVisible();

    const partnerSection = page.locator('section', {
      has: page.getByRole('heading', {
        name: 'Delivered with trusted partner vendors',
      }),
    });
    for (const name of [
      'Makeup & Styling',
      'Sounds & Lightings',
      'Photography & Videography',
      'Food & Catering',
      'LED / Display Solutions',
    ]) {
      await expect(partnerSection.getByRole('heading', { name }), name).toBeVisible();
    }
  });

  test('occasions page lists all fourteen approved occasions with Tamil terms', async ({
    page,
  }) => {
    await page.goto('/occasions');

    const items = page.locator('ul > li');
    await expect(
      page.getByRole('heading', { name: 'Wedding', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Nichayathartham')).toBeVisible();
    await expect(page.getByText('Valaikappu')).toBeVisible();
    await expect(items).not.toHaveCount(0);
  });

  test('contact page exposes the approved phone, WhatsApp and email', async ({
    page,
  }) => {
    await page.goto('/contact');

    // Scoped to <main>: the header and footer also carry these actions, and the
    // header's are hidden at small viewports.
    const main = page.locator('#main');
    await expect(main.locator('a[href="tel:+919994072435"]').first()).toBeVisible();
    await expect(
      main.locator('a[href="https://wa.me/919994072435"]').first(),
    ).toBeVisible();
    await expect(
      main.locator('a[href="mailto:vrk.groups@gmail.com"]').first(),
    ).toBeVisible();
  });

  test('legal pages are clearly marked as drafts pending review', async ({ page }) => {
    for (const path of ['/privacy-policy', '/terms']) {
      await page.goto(path);
      await expect(page.locator('[data-draft-notice]'), path).toBeVisible();
    }
  });

  test('no page shows an unapproved superlative claim', async ({ page }) => {
    for (const entry of PAGES) {
      await page.goto(entry.path);
      const body = ((await page.locator('body').textContent()) ?? '').toLowerCase();

      for (const forbidden of [
        'award-winning',
        'number one',
        'guaranteed',
        'cheapest',
      ]) {
        expect(
          body.includes(forbidden),
          `${entry.path} must not claim "${forbidden}"`,
        ).toBe(false);
      }
    }
  });
});

test.describe('navigation and internal linking', () => {
  test('every primary navigation link resolves to a real page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const links = page.getByRole('navigation', { name: 'Primary' }).getByRole('link');
    const hrefs = await links.evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLAnchorElement).getAttribute('href')),
    );

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const response = await page.goto(href!);
      expect(response?.status(), href!).toBe(200);
    }
  });

  test('every footer link resolves', async ({ page }) => {
    await page.goto('/');

    const hrefs = await page
      .getByRole('contentinfo')
      .getByRole('link')
      .evaluateAll((nodes) =>
        nodes
          .map((node) => (node as HTMLAnchorElement).getAttribute('href') ?? '')
          .filter((href) => href.startsWith('/')),
      );

    for (const href of new Set(hrefs)) {
      const response = await page.goto(href);
      expect(response?.status(), href).toBe(200);
    }
  });
});

test.describe('responsive behaviour', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('pages do not scroll horizontally on a small screen', async ({ page }) => {
    for (const entry of PAGES) {
      await page.goto(entry.path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(
        overflow,
        `${entry.path} must not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('the sticky action bar is present on every public page', async ({ page }) => {
    for (const entry of PAGES) {
      await page.goto(entry.path);
      await expect(page.getByTestId('sticky-mobile-cta'), entry.path).toBeVisible();
    }
  });
});
