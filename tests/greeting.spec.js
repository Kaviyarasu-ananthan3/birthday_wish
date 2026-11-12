import { test, expect } from '@playwright/test';

// Keep browser checks independent of the optional external font service.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-13T00:00:00+05:30'));
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
});

async function hitBalloon(page, touch = false) {
  const count = Number(await page.locator('#pop-count').textContent());
  // A balloon may be above the arena and need to finish its flight before re-entry.
  const deadline = Date.now() + 35000;
  while (Date.now() < deadline) {
    const target = await page.locator('.arena-balloon:not(.popped)').evaluateAll(elements => elements.map(element => {
      const r = element.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height * 61 / 195 };
    }).find(point => point.y > 145 && point.y < innerHeight * .74 && point.x > 65 && point.x < innerWidth - 20));
    if (!target) { await page.waitForTimeout(300); continue; }
    if (touch) await page.touchscreen.tap(target.x, target.y - 12);
    else await page.mouse.click(target.x, target.y - 12);
    await page.waitForFunction(() => !document.querySelector('#shoot')?.disabled);
    if (Number(await page.locator('#pop-count').textContent()) > count) return;
  }
  throw new Error('Unable to hit a balloon within one complete flight cycle');
}

async function unlock(page, touch = false) {
  for (let i = 0; i < 5; i++) {
    await hitBalloon(page, touch);
    await expect(page.locator('#pop-count')).toHaveText(String(i + 1));
    if (i < 4) await expect(page.locator('#to-wish')).toHaveCount(0);
  }
  await page.locator('#to-wish').click();
  await expect(page.locator('#wish-stage')).toBeVisible();
}

async function openCard(page) {
  const animated = await page.evaluate(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  await expect(page.locator('#birthday-chat')).toHaveCount(0);
  await page.locator('#blow-candle').click();
  if (animated) await expect(page.locator('.fireworks-canvas')).toBeVisible();
  await expect(page.locator('#flame')).toHaveClass(/out/);
  await expect(page.locator('#birthday-chat')).toBeVisible();
  await expect(page.locator('#birthday-chat')).toContainText('Happy birthday, Monisha!');
  await expect(page.locator('.birthday-notification')).toHaveCount(8);
  await expect(page.locator('#birthday-chat')).not.toContainText('?');
  await expect(page.locator('.notification-badge')).toHaveCount(0);
  await expect(page.locator('.birthday-notification').last()).toBeVisible();
  await expect.poll(() => page.locator('.birthday-notification').evaluateAll(cards => cards.every(card => {
    const rect = card.getBoundingClientRect();
    return rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight;
  }))).toBe(true);
  await expect(page.locator('#birthday-chat')).toHaveCSS('overflow-y', 'visible');
  await expect.poll(() => page.locator('.birthday-notification').evaluateAll(cards => cards.every((card, index) => {
    if (!index) return true;
    const previous = cards[index - 1].getBoundingClientRect(), current = card.getBoundingClientRect();
    return Math.abs(current.left - previous.left) < 2 && current.top >= previous.bottom;
  }))).toBe(true);
  if (page.viewportSize().width >= 1000) {
    const notifications = await page.locator('.birthday-notifications').boundingBox();
    expect(notifications.x).toBeGreaterThan(page.viewportSize().width - 540);
    expect(notifications.y).toBeLessThan(50);
  }
  await expect(page.locator('.birthday-notification').first()).toHaveCSS('backdrop-filter', /blur/);
  await page.getByRole('button', { name: 'Dismiss birthday notifications' }).click();
  await expect(page.locator('#birthday-chat')).toHaveCount(0);
  await page.locator('#to-envelope').click();
  await page.locator('#open-card').click();
  await expect(page.locator('#birthday-title')).toBeVisible();
  if (animated) await expect(page.locator('.fireworks-canvas')).toBeVisible();
  await expect(page.locator('#celebrate-again')).toHaveCount(0);
  if (await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    await expect(page.locator('.typing-letter')).toHaveAttribute('data-typing', 'false');
  } else {
    await expect(page.locator('.typing-letter')).toHaveAttribute('data-typing', 'true');
    const initialLength = await page.locator('.typing-text').evaluateAll(elements => elements.reduce((sum, el) => sum + el.textContent.length, 0));
    await expect.poll(() => page.locator('.typing-text').evaluateAll(elements => elements.reduce((sum, el) => sum + el.textContent.length, 0))).toBeGreaterThan(initialLength);
    await expect(page.locator('.typing-letter')).toHaveAttribute('data-typing', 'false', { timeout: 35000 });
  }
  await expect(page.locator('.signature .typing-text')).toContainText('With all my love');
}

test('React greeting: five-hit gate, themes, sounds, fullscreen, photos, and replay', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.locator('#start-adventure').click();
  await expect(page.locator('#root .experience')).toBeVisible();
  await expect(page.locator('.arena-balloon')).toHaveCount(7);
  await page.locator('#aim').fill('85');
  await page.locator('#shoot').click();
  await expect(page.locator('#shoot')).toBeEnabled();
  await expect(page.locator('#pop-count')).toHaveText('0');
  await page.locator('.theme-switch').click();
  for (const value of ['rose', 'ocean', 'emerald', 'sunset', 'cosmic']) {
    await page.locator(`.theme-option:has(input[value="${value}"])`).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', value);
  }
  await page.keyboard.press('Escape');
  await page.locator('.sound-switch').click();
  await expect(page.locator('.sound-switch')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.sound-switch').click();
  await page.locator('.fullscreen-switch').click();
  await expect(page.locator('.fullscreen-switch')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.theme-switch').click();
  await expect(page.locator('#theme-dialog')).toBeVisible();
  await page.locator('.theme-done').click();
  await page.locator('.fullscreen-switch').click();
  await unlock(page); await openCard(page);

  const data = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = canvas.height = 40; return canvas.toDataURL().split(',')[1]; });
  await page.locator('#photo-input').setInputFiles({ name: 'memory.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64') });
  await expect(page.locator('#memory-photo')).toBeVisible();
  await expect(page.locator('#photo-status')).toContainText('saved');
  await page.locator('#next-photo').click(); await expect(page.locator('#memory-photo')).toHaveCount(0);
  await page.locator('#previous-photo').click(); await expect(page.locator('#memory-photo')).toBeVisible();
  await page.screenshot({ path: 'test-results/react-card.png', fullPage: true, animations: 'disabled', timeout: 10000 });
  await page.locator('#replay').click(); await expect(page.locator('#pop-count')).toHaveText('0');
  await expect(page.locator('.arena-balloon.popped')).toHaveCount(0);
  await unlock(page); await openCard(page); await expect(page.locator('#memory-photo')).toBeVisible();
  await page.locator('#remove-photo').click(); await expect(page.locator('#memory-photo')).toHaveCount(0);
  await page.locator('#photo-input').setInputFiles({ name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('invalid image') });
  await expect(page.locator('#photo-status')).toContainText('could not be opened');
  expect(errors).toEqual([]);
});

test('flying balloons, touchscreen flow, mobile layouts, and React stage animations', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date('2026-11-13T00:00:00+05:30'));
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await page.locator('#start-adventure').click(); await page.bringToFront();
  await expect(page.locator('.fireworks-canvas')).toHaveCount(0);
  const top = await page.locator('#balloon-0').evaluate(element => element.getBoundingClientRect().top);
  // Wait for a rendered animation frame rather than assuming a fixed frame rate.
  await expect.poll(() => page.locator('#balloon-0').evaluate(element => element.getBoundingClientRect().top), { timeout: 15000 }).not.toBe(top);
  await page.locator('.theme-switch').click();
  const paused = await page.locator('#balloon-1').evaluate(element => element.getBoundingClientRect().top);
  await page.waitForTimeout(250);
  expect(await page.locator('#balloon-1').evaluate(element => element.getBoundingClientRect().top)).toBeCloseTo(paused, 0);
  await page.locator('.theme-option:has(input[value="ocean"])').click();
  await page.locator('.theme-done').click();
  await page.screenshot({ path: 'test-results/react-mobile-game.png', fullPage: true, animations: 'disabled', timeout: 10000 });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await unlock(page, true); await openCard(page);
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/react-mobile-card.png', fullPage: true, animations: 'disabled', timeout: 10000 });
  expect(errors).toEqual([]);
  await context.close();
});

test('theme persistence, keyboard selection, storage fallback, and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.locator('#start-adventure').click();
  await page.locator('.theme-switch').click();
  await page.locator('.theme-option:has(input[value="rose"])').click();
  await page.locator('.theme-done').click();
  await page.reload(); await page.locator('#start-adventure').click(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'rose');
  await page.locator('.theme-switch').click(); await page.keyboard.press('ArrowDown');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ocean');
  await page.keyboard.press('Escape'); await expect(page.locator('#theme-dialog')).not.toBeVisible();
  const top = await page.locator('#balloon-0').evaluate(element => element.getBoundingClientRect().top);
  await page.waitForTimeout(200);
  expect(await page.locator('#balloon-0').evaluate(element => element.getBoundingClientRect().top)).toEqual(top);
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Storage disabled'); }; });
  await page.locator('.theme-switch').click(); await page.locator('.theme-option:has(input[value="emerald"])').click();
  await expect(page.locator('#theme-status')).toContainText('this visit');
});

test('3D surfaces tilt without blocking the wish and envelope controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.locator('#start-adventure').click();
  await unlock(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const paper = page.locator('.wish-paper');
  const rect = await paper.boundingBox();
  await page.mouse.move(rect.x + rect.width * .85, rect.y + rect.height * .35);
  await expect.poll(() => paper.evaluate(element => getComputedStyle(element).transform)).toContain('matrix3d');
  await page.screenshot({ path: 'test-results/depth-wish.png', fullPage: true, animations: 'disabled', timeout: 10000 });
  await page.locator('#blow-candle').click();
  await page.locator('#to-envelope').click();
  await page.locator('#open-card').click();
  await expect(page.locator('#open-card')).toHaveClass(/is-opening/);
  await expect(page.locator('#birthday-title')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('.card-tilt').evaluate(element => getComputedStyle(element).transform)).toBe('none');
});
