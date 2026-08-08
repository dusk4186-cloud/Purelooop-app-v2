import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate from Onboarding to Login to Home', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173/');

    // Wait for the splash screen to transition out (usually 1.5s as defined in App.tsx)
    await page.waitForTimeout(2000);

    // Verify we are on Onboarding Screen
    await expect(page.locator('text=Premium Care For Your Clothes')).toBeVisible();

    // Click "Log In"
    await page.click('button:has-text("Log In")');

    // Wait for animation
    await page.waitForTimeout(500);

    // Verify we are on Login Screen
    await expect(page.locator('h3:has-text("Log In")')).toBeVisible();

    // Fill in credentials
    await page.fill('input[type="email"]', 'aditya@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password123');

    // Click Login
    await page.click('button:has-text("Log In")');

    // Wait for Mock Supabase to authenticate and animate to Home Screen
    await page.waitForTimeout(1000);

    // Verify we are on the Home Screen
    await expect(page.locator('text=Good Morning,')).toBeVisible();
    await expect(page.locator('text=Near You')).toBeVisible();
  });
});
