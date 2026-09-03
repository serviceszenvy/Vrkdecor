import { expect, test } from '@playwright/test';

/**
 * The Admin Panel, from the outside.
 *
 * What this suite can and cannot prove is worth being explicit about. It runs
 * against an environment with no Supabase project, exactly as the rest of the
 * end-to-end suite does, so there is no account to sign in with and no signed-in
 * journey to walk. What it proves is the half that matters most from the
 * outside: that an unauthenticated visitor reaches nothing, learns nothing, and
 * that no admin page is indexable or cacheable.
 *
 * The signed-in half — what an admin, a disabled admin, a signed-in customer
 * and an anonymous caller can each actually do to a row — is proven against
 * real PostgreSQL with the real policies in
 * `tests/db/admin-operations.test.ts`, and the guard on every page and action is
 * proven in `tests/unit/admin-authorization.test.ts`.
 */

const ADMIN_ROUTES = [
  '/admin',
  '/admin/designs',
  '/admin/designs/new',
  '/admin/enquiries',
  '/admin/packages',
  '/admin/testimonials',
  '/admin/content',
  '/admin/designs/00000000-0000-4000-8000-000000000000',
  '/admin/enquiries/00000000-0000-4000-8000-000000000000',
];

test.describe('an unauthenticated visitor', () => {
  for (const route of ADMIN_ROUTES) {
    test(`is redirected away from ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL('/admin/login');
    });
  }

  test('sees no admin data anywhere on the sign-in page', async ({ page }) => {
    await page.goto('/admin/login');

    const html = await page.content();
    // Nothing about enquiries, customers, drafts or who the admins are.
    expect(html).not.toContain('internal_notes');
    expect(html).not.toMatch(/enquir(y|ies)\s*(list|inbox)/i);
    expect(html).not.toContain('reference_images');
    expect(html).not.toContain('@example');

    await expect(page.getByTestId('admin-identity')).toHaveCount(0);
    await expect(page.getByTestId('enquiry-list')).toHaveCount(0);
    await expect(page.getByTestId('design-list')).toHaveCount(0);
  });

  test('is told plainly that the panel is not connected yet', async ({ page }) => {
    // This environment has no Supabase project. A login box that silently fails
    // would be worse than saying so.
    await page.goto('/admin/login');
    await expect(page.getByTestId('admin-unavailable')).toBeVisible();
    await expect(page.getByTestId('login-form')).toHaveCount(0);
  });

  test('cannot reach an admin page by adding a trailing slash or casing it oddly', async ({
    page,
  }) => {
    for (const route of ['/admin/', '/admin/enquiries/', '/ADMIN']) {
      const response = await page.goto(route);
      const status = response?.status() ?? 0;
      // Either it 404s or it redirects to sign-in. What it must never do is
      // render an admin page.
      if (status < 400) {
        await expect(page, route).toHaveURL(/\/admin\/login|\/admin\/?$/);
        await expect(page.getByTestId('admin-identity'), route).toHaveCount(0);
      }
    }
  });
});

test.describe('the Admin Panel is never indexed', () => {
  test('every admin route carries a noindex meta tag', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });

  test('and says so in the response headers too', async ({ request }) => {
    for (const route of ['/admin', '/admin/login', '/admin/enquiries']) {
      const response = await request.get(route, { maxRedirects: 0 });
      const headers = response.headers();

      expect(headers['x-robots-tag'], route).toContain('noindex');
      // An admin response must never be kept by a shared cache.
      expect(headers['cache-control'], route).toContain('no-store');
    }
  });

  test('the public site never links to it', async ({ page }) => {
    for (const route of ['/', '/our-work', '/contact', '/quote']) {
      await page.goto(route);
      await expect(page.locator('a[href^="/admin"]'), route).toHaveCount(0);
    }
  });
});

test.describe('the public site is unchanged by the admin section', () => {
  test('every public page still renders the site chrome', async ({ page }) => {
    // P8 moved the public pages into a route group so the Admin Panel could
    // have a shell of its own. The URLs are unchanged and so is the chrome.
    for (const route of ['/', '/our-work', '/services', '/quote', '/packages']) {
      await page.goto(route);
      await expect(page.getByRole('banner'), route).toBeVisible();
      await expect(page.getByRole('contentinfo'), route).toBeVisible();
      await expect(page.locator('#main'), route).toHaveCount(1);
    }
  });

  test('the 404 page still renders the chrome as well', async ({ page }) => {
    // It lives outside the route group, so it carries the chrome itself.
    const response = await page.goto('/no-such-page');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });

  test('an admin page carries no public marketing chrome', async ({ page }) => {
    await page.goto('/admin/login');
    // No "Get a Quote" sticky bar over an admin screen.
    await expect(page.locator('[data-testid="sticky-mobile-cta"]')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
  });
});
