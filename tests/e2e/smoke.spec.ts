import { expect, test } from '@playwright/test';

test.describe('foundation smoke', () => {
  test('home page renders and is titled for the brand', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/VRK Decor/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('VRK Decor');
  });

  test('unknown routes return the not-found page', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });

  test('health endpoint responds for deployment smoke tests', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  test('baseline security headers are present', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['x-powered-by']).toBeUndefined();
  });
});
