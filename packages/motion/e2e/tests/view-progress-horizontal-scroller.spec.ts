import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

type Reading = { path: 'native' | 'fallback'; source: string | null; progress: number | null };

type FixtureWindow = {
  supportsViewTimeline: boolean;
  readTimeline(id: string): Reading;
};

const readTimeline = (page: Page, id: string) =>
  page.evaluate((id_) => (window as unknown as FixtureWindow).readTimeline(id_), id);

// Scrolls the page until the subject's top edge is `top` px below the top of the viewport.
const placeInViewport = (page: Page, id: string, top: number) =>
  page.evaluate(
    ([id_, top_]) => {
      const subject = document.getElementById(id_)!;
      window.scrollBy(0, subject.getBoundingClientRect().top - top_);
    },
    [id, top] as const,
  );

// Scrolls the subject's scroller until the subject's top edge is `top` px below the scroller's top.
const placeInScroller = (page: Page, id: string, top: number) =>
  page.evaluate(
    ([id_, top_]) => {
      const subject = document.getElementById(id_)!;
      const scroller = subject.parentElement!;
      scroller.scrollTop +=
        subject.getBoundingClientRect().top - scroller.getBoundingClientRect().top - top_;
    },
    [id, top] as const,
  );

// Reads the subject just after it enters (cover progress near 0) and just before it leaves (near 1).
async function readEnteringAndLeaving(
  page: Page,
  id: string,
  place: (top: number) => Promise<void>,
  scrollportHeight: number,
) {
  await place(scrollportHeight - 20);
  await expect.poll(async () => (await readTimeline(page, id)).progress).not.toBeNull();
  await page.waitForTimeout(200);
  const entering = await readTimeline(page, id);

  await place(-180);
  await page.waitForTimeout(200);
  const leaving = await readTimeline(page, id);

  console.log(JSON.stringify({ id, entering, leaving }));
  return { entering, leaving };
}

test.describe('view-progress subject inside a horizontal scroller', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/scroll-horizontal-scroller.html');
    const supportsNative = await page.evaluate(
      () => (window as unknown as FixtureWindow).supportsViewTimeline,
    );
    test.skip(!supportsNative, 'Only the native ViewTimeline path is affected.');
  });

  // `overflow-x: scroll` makes the slider a scroll container on both axes. A ViewTimeline would
  // follow the slider, which never scrolls vertically, so the subject takes the page-based fallback.
  test('progress follows the page scroll', async ({ page }) => {
    const id = 'h-scroller-subject';
    const { entering, leaving } = await readEnteringAndLeaving(
      page,
      id,
      (top) => placeInViewport(page, id, top),
      page.viewportSize()!.height,
    );

    expect(entering.path).toBe('fallback');
    expect(entering.progress!).toBeLessThan(0.2);
    expect(leaving.progress!).toBeGreaterThan(0.8);
  });

  test('control without a scroller keeps the native ViewTimeline on the page', async ({ page }) => {
    const id = 'control-subject';
    const { entering, leaving } = await readEnteringAndLeaving(
      page,
      id,
      (top) => placeInViewport(page, id, top),
      page.viewportSize()!.height,
    );

    expect(entering).toEqual(
      expect.objectContaining({ path: 'native', source: 'document.scrollingElement' }),
    );
    expect(entering.progress!).toBeLessThan(0.2);
    expect(leaving.progress!).toBeGreaterThan(0.8);
  });

  test('a scroller that scrolls on the block axis keeps the native ViewTimeline', async ({
    page,
  }) => {
    const id = 'v-scroller-subject';
    await page.locator('#v-scroller').scrollIntoViewIfNeeded();
    const { entering, leaving } = await readEnteringAndLeaving(
      page,
      id,
      (top) => placeInScroller(page, id, top),
      300,
    );

    expect(entering).toEqual(expect.objectContaining({ path: 'native', source: 'DIV#v-scroller' }));
    expect(entering.progress!).toBeLessThan(0.2);
    expect(leaving.progress!).toBeGreaterThan(0.8);
  });
});
