import { test, expect } from '@playwright/test';

type FixtureWindow = {
  supportsViewTimeline: boolean;
  readTimeline(): { source: string | null; progress: number | null };
};

const readTimeline = (page: import('@playwright/test').Page) =>
  page.evaluate(() => (window as unknown as FixtureWindow).readTimeline());

// Puts the subject's top edge `top` px below the top of the viewport.
const placeSubject = (page: import('@playwright/test').Page, top: number) =>
  page.evaluate((top_) => {
    const subject = document.getElementById('h-scroller-subject')!;
    window.scrollBy(0, subject.getBoundingClientRect().top - top_);
  }, top);

test.describe('view-progress subject inside a horizontal scroller', () => {
  // Known bug, kept failing on purpose: `new ViewTimeline({ subject })` takes the nearest
  // ancestor scroll container as its source. `overflow-x: scroll` makes the slider a scroll
  // container on both axes, so the block-axis timeline follows a box that never scrolls
  // vertically, and progress never moves with the page. Remove `test.fail()` with the fix.
  test('progress follows the page scroll', async ({ page }) => {
    test.fail();

    await page.goto('/scroll-horizontal-scroller.html');
    const supportsNative = await page.evaluate(
      () => (window as unknown as FixtureWindow).supportsViewTimeline,
    );
    test.skip(!supportsNative, 'Only the native ViewTimeline path is affected.');

    const viewportHeight = page.viewportSize()!.height;

    // Subject just entered from the bottom: cover progress near 0.
    await placeSubject(page, viewportHeight - 20);
    await expect.poll(async () => (await readTimeline(page)).progress).not.toBeNull();
    const entering = await readTimeline(page);

    // Subject about to leave at the top: cover progress near 1.
    await placeSubject(page, -180);
    await page.waitForTimeout(200);
    const leaving = await readTimeline(page);

    console.log(JSON.stringify({ entering, leaving }));

    // `source` is logged to show why: it is the slider, not the page.
    expect(entering.progress!).toBeLessThan(0.2);
    expect(leaving.progress!).toBeGreaterThan(0.8);
  });
});
