import type { Page } from '@playwright/test';

/** Scroll the window to an absolute Y position. */
export async function scrollTo(page: Page, y: number): Promise<void> {
  await page.evaluate((scrollY) => window.scrollTo({ top: scrollY }), y);
  await new Promise((r) => setTimeout(r, 100));
}

/** Scroll until the given element is fully in the viewport. */
export async function scrollElementIntoView(page: Page, selector: string): Promise<void> {
  await page.evaluate((sel) => {
    document.querySelector(sel)?.scrollIntoView({ block: 'center' });
  }, selector);
  await new Promise((r) => setTimeout(r, 100));
}

/** Return the element's scroll progress exposed on window by the fixture. */
export function getScrollProgress(page: Page): Promise<number> {
  return page.evaluate(() =>
    (window as unknown as { getScrollProgress(): number }).getScrollProgress(),
  );
}

/** Return the current window scroll position. */
export function getScrollY(page: Page): Promise<number> {
  return page.evaluate(() => window.scrollY);
}
