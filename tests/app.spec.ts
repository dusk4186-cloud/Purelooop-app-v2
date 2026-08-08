import { test, expect } from '@playwright/test';

test.describe('Creative UI Landing Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Page loads and shows main heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Elevate your code');
  });

  test('Navbar branding exists', async ({ page }) => {
    const brand = page.locator('text=CREATIVE.UI');
    await expect(brand).toBeVisible();
  });
});
