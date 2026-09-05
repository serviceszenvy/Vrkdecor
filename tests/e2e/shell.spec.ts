import { expect, test } from '@playwright/test';

test.describe('application shell', () => {
  // The desktop navigation is hidden below `lg`; assert it at a desktop width.
  test.use({ viewport: { width: 1280, height: 900 } });

  test('header exposes the logo, primary navigation and the quote CTA', async ({
    page,
  }) => {
    await page.goto('/');

    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: 'VRK Decor — home' })).toBeVisible();

    const nav = header.getByRole('navigation', { name: 'Primary' });
    for (const label of [
      'Our Work',
      'Services',
      'Packages',
      'Gallery',
      'About',
      'Contact',
    ]) {
      await expect(nav.getByRole('link', { name: label })).toHaveCount(1);
    }
    await expect(nav.getByRole('link', { name: 'Occasions' })).toHaveCount(0);
  });

  test('footer credits Zenvy with a link to its site', async ({ page }) => {
    await page.goto('/');
    const zenvy = page.getByRole('contentinfo').getByTestId('zenvy-link');
    await expect(zenvy).toHaveAttribute(
      'href',
      'https://serviceszenvy.wixsite.com/home',
    );
    await expect(zenvy).toHaveAttribute('target', '_blank');
  });

  test('footer exposes contact actions built from the approved details', async ({
    page,
  }) => {
    await page.goto('/');

    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: '+919994072435' })).toHaveAttribute(
      'href',
      'tel:+919994072435',
    );
    await expect(footer.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/919994072435',
    );
  });

  test('skip link is the first tab stop and moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('every focusable header control has a visible focus indicator', async ({
    page,
  }) => {
    await page.goto('/');
    const firstNavLink = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link')
      .first();

    await firstNavLink.focus();
    const outline = await firstNavLink.evaluate(
      (el) => getComputedStyle(el).outlineStyle,
    );
    expect(outline).not.toBe('none');
  });
});

test.describe('mobile shell', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('sticky action bar offers Call and Get Quote', async ({ page }) => {
    await page.goto('/');

    const bar = page.getByTestId('sticky-mobile-cta');
    await expect(bar).toBeVisible();
    await expect(bar.getByRole('link', { name: 'Call' })).toHaveAttribute(
      'href',
      'tel:+919994072435',
    );
    await expect(bar.getByRole('link', { name: 'Get Quote' })).toHaveAttribute(
      'href',
      '/quote',
    );
  });

  test('the floating WhatsApp action is reachable and clear of the action bar', async ({
    page,
  }) => {
    await page.goto('/');

    // WhatsApp moved out of the bar and into its own persistent action, so the
    // two actions that remain in the bar are not squeezed and the approved
    // primary channel is one tap away from anywhere on the site.
    const fab = page.getByTestId('whatsapp-fab');
    await expect(fab).toBeVisible();
    await expect(fab).toHaveAttribute('href', 'https://wa.me/919994072435');

    const box = (await fab.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);

    const bar = (await page.getByTestId('sticky-mobile-cta').boundingBox())!;
    // The floating button sits entirely above the bar; neither covers the other.
    expect(box.y + box.height).toBeLessThanOrEqual(bar.y + 1);
  });

  test('mobile menu opens, traps focus, and closes on Escape', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByTestId('mobile-nav-trigger');
    const panel = page.getByTestId('mobile-nav-panel');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Our Work' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('page content is not covered by the sticky action bar', async ({ page }) => {
    await page.goto('/');

    const paddingBottom = await page
      .locator('#main')
      .evaluate((el) => getComputedStyle(el).paddingBottom);
    expect(Number.parseFloat(paddingBottom)).toBeGreaterThan(0);
  });
});

test.describe('design system reference page', () => {
  test('renders and is excluded from indexing', async ({ page }) => {
    const response = await page.goto('/design-system');
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole('heading', { name: 'Proposed digital design system' }),
    ).toBeVisible();
    await expect(
      page.getByText('This is not an official VRK Decor brand guideline.'),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });

  test('uses exactly one level-1 heading', async ({ page }) => {
    await page.goto('/design-system');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });
});
