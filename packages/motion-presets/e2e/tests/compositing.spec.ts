import { test, expect, chromium } from '@playwright/test';

// presets whose animations don't run on the compositor
const NOT_COMPOSITED: Record<string, string> = {
  BlurIn: 'filter',
  BlurScroll: 'filter',
  TiltIn: 'layers with different timings, as on master',
  TiltScroll: 'layers with different timings, as on master',
  Wiggle: 'its rotation and lift follow different loop shapes',
};

// Chromium traces an 'Animation' event with a failure bitmask for every animation it can't composite
test.describe('compositing', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium traces only');

  test('transform presets run on the compositor', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => 'harness' in window);
    const names: string[] = await page.evaluate(() => (window as any).harness.presetNames());

    const browser = await chromium.launch();
    const failed: Record<string, number[]> = {};
    for (const name of names) {
      const tracedPage = await browser.newPage();
      await tracedPage.goto(page.url());
      await tracedPage.waitForFunction(() => 'harness' in window);
      await browser.startTracing(tracedPage, {
        categories: [
          'devtools.timeline',
          'disabled-by-default-devtools.timeline',
          'blink.animations',
        ],
      });
      await tracedPage.evaluate(async (name) => {
        await (window as any).harness.play(name);
        await new Promise((resolve) => setTimeout(resolve, 400));
      }, name);
      const { traceEvents } = JSON.parse((await browser.stopTracing()).toString());
      const reasons = traceEvents
        .filter((event: any) => event.name === 'Animation' && event.args?.data?.compositeFailed)
        .map((event: any) => event.args.data.compositeFailed);
      if (reasons.length) {
        failed[name] = [...new Set<number>(reasons)];
      }
      await tracedPage.close();
    }
    await browser.close();

    expect(Object.keys(failed).sort()).toEqual(Object.keys(NOT_COMPOSITED).sort());
  });
});
