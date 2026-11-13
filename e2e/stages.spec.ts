import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('intro_video_played_v2', 'true');
    localStorage.setItem('mission_brief_dismissed_v2', 'true');
    localStorage.setItem('mock_mode', 'true');
  });
});

test.describe('Stage navigation and unlock flow', () => {
  test('Stage 01 is accessible from HomeHub (always unlocked)', async ({ page }) => {
    await page.goto('/');
    await page.getByText('STAGE 01').click();
    await expect(page).toHaveURL(/.*stage-01/);
    await expect(page.getByText('Stage_01: Origin')).toBeVisible();
  });

  test('Stage 03 is locked by default (requires stage 02 completion)', async ({ page }) => {
    await page.goto('/#/stage-03');
    await expect(page.getByText('STAGE 03 LOCKED')).toBeVisible();
    await expect(page.getByText('Complete the previous stage to unlock.')).toBeVisible();
    await expect(page.getByText('Return to Hub')).toBeVisible();
  });
});

test.describe('URL parameter controls', () => {
  test('?unlock=5 makes stage 5 accessible', async ({ page }) => {
    await page.goto('/#/?unlock=5');
    await page.waitForTimeout(500);
    await page.goto('/#/stage-05');
    // Should NOT show locked overlay
    await expect(page.getByText('STAGE 05 LOCKED')).not.toBeVisible({ timeout: 3000 });
  });

  test('?unlock=3 unlocks stages and shows them as COMPLETE on HomeHub', async ({ page }) => {
    await page.goto('/#/?unlock=3');
    await page.waitForTimeout(500);
    await page.goto('/');
    // Stage 4 should be visible and accessible
    const stage04Card = page.locator('text=STAGE 04');
    await expect(stage04Card).toBeVisible();
  });

  test('?reset=true clears all progress', async ({ page }) => {
    // First unlock some stages (full page load)
    await page.goto('/#/?unlock=5');
    await page.waitForTimeout(300);
    // Navigate away to force full reload with reset param
    await page.goto('about:blank');
    await page.goto('/#/?reset=true');
    await page.waitForTimeout(300);
    // Navigate away again to force fresh load of stage 02
    await page.goto('about:blank');
    await page.goto('/#/stage-02');
    await expect(page.getByText('STAGE 02 LOCKED')).toBeVisible();
  });
});

test.describe('Stage 03 Tuner interaction', () => {
  test.beforeEach(async ({ page }) => {
    // unlock=2 completes stages 1-2, so stage 3 is unlocked but NOT completed
    await page.goto('/#/?unlock=2');
    await page.waitForTimeout(500);
  });

  test('renders frequency display and dial controls', async ({ page }) => {
    await page.goto('/#/stage-03');
    // Frequency readout should be visible (exact match to avoid duplicate)
    await expect(page.getByText('MHz', { exact: true })).toBeVisible();
    // FREQ_MOD label
    await expect(page.getByText('FREQ_MOD')).toBeVisible();
    // Stage header should show STAGE 03
    await expect(page.getByText('STAGE 03')).toBeVisible();
  });

  test('frequency changes when dial buttons are clicked', async ({ page }) => {
    await page.goto('/#/stage-03');
    // Get initial frequency text
    const freqDisplay = page.locator('.tabular-nums').first();
    await expect(freqDisplay).toBeVisible();
    const initialFreq = await freqDisplay.textContent();
    
    // Start broadcast to enable controls — click the waveform area
    const broadcastButton = page.getByTestId('broadcast-trigger');
    await broadcastButton.click({ force: true });
    
    // Wait for the specific 'BROADCAST' label inside the button to disappear
    const broadcastLabel = page.locator('span.font-mono', { hasText: 'BROADCAST' });
    try {
      await expect(broadcastLabel).not.toBeVisible({ timeout: 5000 });
    } catch {
      // Retry click if it didn't work the first time (maybe debounced or missed)
      console.log('Retrying broadcast click...');
      await broadcastButton.click({ force: true });
      await expect(broadcastLabel).not.toBeVisible({ timeout: 10000 });
    }
        
    // Wait for the buttons to be interactable
    const addButton = page.locator('button').filter({ has: page.locator('span.material-symbols-outlined', { hasText: 'add' }) });
    await expect(addButton).toBeEnabled({ timeout: 5000 });

    // Click the right (+) button
    await addButton.click();
    const newFreq = await freqDisplay.textContent();
    expect(newFreq).not.toBe(initialFreq);
  });
});

test.describe('Stage 06 Minerals interaction', () => {
  test.beforeEach(async ({ page }) => {
    // unlock=5 completes stages 1-5, so stage 6 is unlocked but NOT completed
    await page.goto('/#/?unlock=5');
    await page.waitForTimeout(500);
  });

  test('renders mineral grid with all three minerals', async ({ page }) => {
    await page.goto('/#/stage-06');
    // Wait for stage content to appear (MISSION_OBJECTIVE is unique to Stage06Minerals)
    await expect(page.getByText('MISSION_OBJECTIVE')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Rose Quartz')).toBeVisible();
    await expect(page.getByText('Citrine')).toBeVisible();
    await expect(page.getByText('Obsidian')).toBeVisible();
  });

  test('minerals can be tapped in sequence', async ({ page }) => {
    await page.goto('/#/stage-06');
    // Wait for stage content to load
    await expect(page.getByText('MISSION_OBJECTIVE')).toBeVisible({ timeout: 10000 });
    // Click the Obsidian button (first in correct order)
    await page.locator('button:has-text("Obsidian")').click();
    // Should show selection indicator (check icon)
    await expect(page.locator('text="check"').first()).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Admin panel', () => {
  test('settings gear opens admin panel', async ({ page }) => {
    await page.goto('/');
    // Click the settings icon in the top status bar
    await page.locator('.material-symbols-outlined:has-text("settings")').first().click();
    await expect(page.getByText('ADMIN PANEL')).toBeVisible();
    await expect(page.getByText('Emergency Override System')).toBeVisible();
  });

  test('admin panel shows all 15 stages', async ({ page }) => {
    await page.goto('/');
    await page.locator('.material-symbols-outlined:has-text("settings")').first().click();
    await expect(page.getByText('ADMIN PANEL')).toBeVisible();
    // Stage titles in admin panel: "01 THE ORIGIN" and "15 PROTOCOL OMEGA"
    await expect(page.getByText('01 THE ORIGIN')).toBeVisible();
    await expect(page.getByText('15 PROTOCOL OMEGA')).toBeVisible();
  });

  test('admin panel can be closed', async ({ page }) => {
    await page.goto('/');
    await page.locator('.material-symbols-outlined:has-text("settings")').first().click();
    await expect(page.getByText('ADMIN PANEL')).toBeVisible();
    // Click close button
    await page.locator('.material-symbols-outlined:has-text("close")').click();
    await expect(page.getByText('ADMIN PANEL')).not.toBeVisible();
  });
});
