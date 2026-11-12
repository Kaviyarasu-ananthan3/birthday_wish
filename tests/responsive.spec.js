import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
  test(`birthday screens fit ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route(/^https:\/\/fonts\./, route => route.abort());
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (viewport.width <= 600) {
      const controls = await page.locator('.sound-switch,.theme-switch,.fullscreen-switch').evaluateAll(nodes => nodes.map(node => {
        const r = node.getBoundingClientRect(); return { left: r.left, right: r.right, height: r.height };
      }).sort((a, b) => a.left - b.left));
      expect(controls.every((r, i) => r.height >= 44 && (!i || r.left >= controls[i - 1].right))).toBe(true);
    }
    // Render each real stage independently so layout checks do not depend on game timing.
    await page.evaluate(async () => {
      const React = (await import('/node_modules/.vite/deps/react.js')).default;
      const dom = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
      const stages = await import('/src/components/GreetingStages.jsx');
      const game = (await import('/src/components/ArcheryGame.jsx')).default;
      const film = (await import('/src/components/BirthdayFilm.jsx')).default;
      document.querySelector('#root').style.display = 'none';
      const host = document.createElement('main'); host.className = 'experience'; document.body.append(host);
      const root = dom.createRoot(host);
      window.renderStage = name => root.render(React.createElement(({ ...stages, game, film })[name], { onNext() {}, onReplay() {}, celebrate() {}, playSound() {}, onClose() {}, paused: true }));
    });
    for (const stage of ['game', 'Wish', 'Envelope', 'BirthdayCard', 'film']) {
      await page.evaluate(stage => window.renderStage(stage), stage);
      const selector = { game: '#archery-stage', Wish: '#wish-stage', Envelope: '#envelope-stage', BirthdayCard: '#card-stage', film: '.birthday-film[open]' }[stage];
      await expect(page.locator(selector)).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (stage === 'Wish') {
        await page.locator('#blow-candle').click();
        await expect(page.locator('.birthday-notification')).toHaveCount(8);
        expect(await page.locator('.birthday-notification').evaluateAll(nodes => nodes.every(n => { const r = n.getBoundingClientRect(); return r.right <= innerWidth && r.bottom <= innerHeight; }))).toBe(true);
      }
      if (stage === 'BirthdayCard') {
        await expect(page.locator('.signature .typing-text')).toContainText("Forever wishing you the universe's very best.");
        await page.screenshot({ path: `test-results/mobile-letter-${viewport.width}.png`, fullPage: true });
      }
      if (stage === 'film') {
        for (const scene of [1, 2, 3]) {
          await page.getByRole('button', { name: `Show scene ${scene}` }).click();
          await expect(page.locator('.film-scene')).toBeVisible();
          expect(await page.locator('.film-close,.film-controls').evaluateAll(nodes => nodes.every(n => { const r = n.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; }))).toBe(true);
        }
      }
    }
  });
}
