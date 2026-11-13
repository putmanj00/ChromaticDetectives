import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Bypass intro video and mission brief
  await page.addInitScript(() => {
    localStorage.setItem('intro_video_played_v2', 'true');
    localStorage.setItem('mission_brief_dismissed_v2', 'true');
    localStorage.setItem('mock_mode', 'true');
  });
});

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Chromatic Detectives/);
});

test('starts at home hub', async ({ page }) => {
  await page.goto('/');

  // Expect to see the HomeHub component content
  const heading = page.locator('h1');
  await expect(heading).toContainText('THE FADE');
  await expect(heading).toContainText('PROTOCOL');
});

test('can navigate to unlocked stage', async ({ page }) => {
  await page.goto('/');

  // Stage 1 is unlocked by default
  await page.getByText('STAGE 01').click();

  // Should navigate to stage 1
  await expect(page).toHaveURL(/.*stage-01/);
  await expect(page.getByText('Stage_01: Origin')).toBeVisible();
});
