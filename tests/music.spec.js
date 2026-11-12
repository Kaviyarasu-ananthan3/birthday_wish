import { test, expect } from '@playwright/test';

test('Birthday song plays, pauses, and resumes from the sound button', async ({ page }) => {
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const music = page.locator('audio');
  const toggle = page.locator('.sound-switch');
  await expect(music).toHaveJSProperty('paused', true);
  await expect(music).toHaveJSProperty('loop', true);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => music.evaluate(audio => audio.currentTime)).toBeGreaterThan(.1);
  await expect(music).toHaveJSProperty('paused', false);
  await toggle.click();
  await expect(music).toHaveJSProperty('paused', true);
  const position = await music.evaluate(audio => audio.currentTime);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => music.evaluate(audio => audio.currentTime)).toBeGreaterThan(position);
  await expect(music).toHaveJSProperty('error', null);
});
