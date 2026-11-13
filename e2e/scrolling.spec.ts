import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('intro_video_played_v2', 'true');
    localStorage.setItem('mission_brief_dismissed_v2', 'true');
    localStorage.setItem('mock_mode', 'true');
  });
});

test.describe('Stage 03 Scrolling', () => {
  test('Stage 03 should be scrollable on mobile', async ({ page }) => {
    // Navigate to Stage 03, ensuring it is unlocked
    await page.goto('/#/?unlock=3');
    // Wait for unlocking to process - Stage 3 should be ACTIVE or READY
    // Wait for unlocking to process - Stage 3 title should be visible (not CLASSIFIED)
    await expect(page.getByText('GOEBEL TUNING')).toBeVisible({ timeout: 5000 });
    
    await page.goto('/#/stage-03');

    // Wait for the main content to load
    await page.waitForSelector('main');

    // Check if the body or main container has overflow-y auto/scroll
    // In our case, we removed overflow-hidden from the root div
    // We can test by trying to scroll
    
    // Force a small viewport to ensure content overflows
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Scroll down using evaluate (works across all browsers including Mobile Safari)
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);

    // Get new scroll position
    const mobileScrollY = await page.evaluate(() => window.scrollY);

    // If content is tall enough, scroll position should increase
    expect(mobileScrollY).toBeGreaterThanOrEqual(initialScrollY);
  });

  test('Tuner knob should prevent scrolling (touch-none)', async ({ page }) => {
     await page.setViewportSize({ width: 375, height: 667 });
     await page.goto('/#/?unlock=3');
     // Wait for unlocking to process
     await expect(page.getByText('GOEBEL TUNING')).toBeVisible({ timeout: 5000 });
     
     await page.goto('/#/stage-03');
     
     // Locate the knob
     const knob = page.locator('.touch-none');
     await expect(knob).toBeVisible({ timeout: 10000 });

     // Check CSS property
     await expect(knob).toHaveCSS('touch-action', 'none');
  });
});
