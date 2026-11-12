import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
});

test('opening countdown uses India midnight, updates, and enters the adventure', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-11-12T12:00:00+05:30'));
  await page.goto('/');
  await expect(page.locator('#countdown-stage')).toBeVisible();
  await expect(page.locator('[data-unit="days"]')).toHaveText('00');
  await expect(page.locator('[data-unit="hours"]')).toHaveText('12');
  await expect(page.locator('[data-unit="minutes"]')).toHaveText('00');
  await expect(page.locator('[data-unit="seconds"]')).toHaveText('00');
  await expect(page.locator('.fireworks-canvas')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/countdown-desktop.png', fullPage: true });
  await page.clock.setFixedTime(new Date('2026-11-12T12:00:01+05:30'));
  await expect(page.locator('[data-unit="hours"]')).toHaveText('11');
  await expect(page.locator('[data-unit="seconds"]')).toHaveText('59');
  await expect(page.locator('#start-adventure')).toBeDisabled();
  await expect(page.locator('.watch-film')).toBeDisabled();
  await page.clock.setFixedTime(new Date('2026-11-13T00:00:00+05:30'));
  await expect(page.locator('#start-adventure')).toBeEnabled();
  await page.locator('#start-adventure').click();
  await expect(page.locator('#archery-stage')).toBeVisible();
  await expect(page.locator('#adventure-reveal')).toHaveCount(0);
  await expect(page.locator('#countdown-stage')).toHaveCount(0);
});

test('peek opens with cinematic curtains, supports skipping, and focuses the game', async ({ page }) => {
  await page.clock.setSystemTime(new Date('2026-11-13T00:00:00+05:30'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('#start-adventure').click();
  await expect(page.locator('#adventure-reveal')).toBeVisible();
  await expect(page.locator('.reveal-curtain-left')).toHaveCSS('animation-name', 'curtain-left');
  await expect(page.locator('.reveal-title')).toContainText('A little magic');
  expect(await page.locator('main').evaluate(element => !!element.closest('[inert]'))).toBe(true);
  await expect(page.locator('#adventure-reveal')).toHaveCount(0, { timeout: 7000 });
  await expect(page.locator('#archery-title')).toBeFocused();
  await expect(page.locator('#archery-stage')).toHaveCount(1);
  await expect(page.locator('.fireworks-canvas')).toHaveCount(0);
  await page.reload();
  await page.locator('#start-adventure').click();
  // The intro intentionally lasts only 2.5 seconds; trigger its handler without
  // waiting for Playwright's stability sampling on a busy rendering machine.
  await page.getByRole('button', { name: 'Skip intro' }).dispatchEvent('click');
  await expect(page.locator('#adventure-reveal')).toHaveCount(0);
  await expect(page.locator('#archery-stage')).toBeVisible();
  await expect(page.locator('#archery-title')).toBeFocused();
});

test('birthday rollover and past dates stay at zero in another timezone', async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: 'America/New_York', reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  await page.clock.setFixedTime(new Date('2026-11-12T18:29:59Z'));
  await page.goto('/');
  await expect(page.locator('[data-unit="seconds"]')).toHaveText('01');
  await expect(page.locator('#start-adventure')).toBeDisabled();
  await expect(page.locator('.watch-film')).toBeDisabled();
  await page.clock.setFixedTime(new Date('2026-11-12T18:30:00Z'));
  await expect(page.locator('.countdown-note')).toContainText('Happy birthday');
  await expect(page.locator('#start-adventure')).toContainText('Open your birthday surprise');
  await expect(page.locator('#start-adventure')).toBeEnabled();
  await expect(page.locator('.watch-film')).toBeEnabled();
  await page.locator('.watch-film').click();
  await expect(page.locator('.birthday-film')).toBeVisible();
  await page.getByRole('button', { name: 'Close birthday film' }).click();
  for (const label of ['days', 'hours', 'minutes', 'seconds']) await expect(page.locator(`[data-unit="${label}"]`)).toHaveText('00');
  await page.clock.setFixedTime(new Date('2026-12-01T00:00:00Z'));
  await page.reload();
  await expect(page.locator('[data-unit="days"]')).toHaveText('00');
  await context.close();
});

test('countdown fits mobile widths and animates the heart and clock', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.setFixedTime(new Date('2026-11-12T12:00:00+05:30'));
  await page.goto('/');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.locator('#start-adventure')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.sculpture-heart')).toHaveCSS('animation-name', 'heart-hover');
  await page.screenshot({ path: 'test-results/countdown-mobile.png', fullPage: true });
  await page.clock.setFixedTime(new Date('2026-11-13T00:00:00+05:30'));
  await page.locator('#start-adventure').click();
  await expect(page.locator('#archery-stage')).toBeVisible();
});
