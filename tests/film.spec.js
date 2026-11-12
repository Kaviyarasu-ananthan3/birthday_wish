import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-13T00:00:00+05:30'));
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
});

test('birthday film has three scenes, 3D stickers, music, and returns to the countdown', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.cartoon-friends-hero img')).toHaveCount(2);
  await expect.poll(() => page.locator('.cartoon-friends-hero img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await expect(page.locator('.hero-stickers .sticker')).toHaveCount(4);
  await page.locator('.watch-film').click();
  await expect(page.locator('.birthday-film')).toBeVisible();
  await expect(page.locator('.cartoon-friends-film img')).toHaveCount(2);
  await expect.poll(() => page.locator('.cartoon-friends-film img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await expect(page.locator('.film-stickers .sticker')).toHaveCount(4);
  await expect(page.locator('#film-title')).toContainText('life feel like magic.');
  await expect(page.getByRole('button', { name: 'Play film', exact: true })).toBeVisible();
  await expect(page.locator('audio')).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Show scene 2' }).click();
  await expect(page.locator('#film-title')).toContainText('all the love you deserve');
  await page.getByRole('button', { name: 'Show scene 3' }).click();
  await expect(page.locator('#film-title')).toContainText('Monisha.');
  await page.screenshot({ path: 'test-results/birthday-film-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Back to your birthday surprise' }).click();
  await expect(page.locator('.birthday-film')).toHaveCount(0);
  await expect(page.locator('#countdown-stage')).toBeVisible();
  await expect(page.locator('.fireworks-canvas')).toHaveCount(0);
  await page.locator('.watch-film').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.birthday-film')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('film advances automatically, pauses, and fits mobile screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.watch-film').click();
  await expect(page.locator('#film-title')).toContainText('all the love you deserve', { timeout: 12000 });
  await page.getByRole('button', { name: 'Pause film' }).click();
  await page.waitForTimeout(5100);
  await expect(page.locator('#film-title')).toContainText('all the love you deserve');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.locator('.birthday-film').evaluate(el => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/birthday-film-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Show scene 3' }).click();
  await expect(page.locator('#film-title')).toContainText('Monisha.');
  await page.getByRole('button', { name: 'Close birthday film' }).click();
  await expect(page.locator('#start-adventure')).toBeVisible();
});
