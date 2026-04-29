import type { Page } from '@playwright/test';

/**
 * Scroll the keyed element into the viewport center.
 */
export async function scrollToKey(page: Page, key: string): Promise<void> {
  await page.evaluate((key) => {
    const el = document.querySelector(`[data-interact-key="${key}"]`);
    if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, key);
  await page.waitForTimeout(150);
}

/**
 * Scroll the viewport by deltaY pixels.
 */
export async function scrollBy(page: Page, deltaY: number): Promise<void> {
  await page.evaluate((dy) => window.scrollBy(0, dy), deltaY);
  await page.waitForTimeout(100);
}

/**
 * Scroll so a viewProgress element is at approximately `progress` (0–1).
 *
 * Assumes the element's scroll range starts when its top enters the viewport
 * bottom and ends when its bottom exits the viewport top.
 */
export async function scrollToProgress(page: Page, key: string, progress: number): Promise<void> {
  await page.evaluate(
    ({ key, progress }) => {
      const el = document.querySelector(`[data-interact-key="${key}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const elTop = rect.top + window.scrollY;
      const totalRange = viewH + rect.height;
      const start = elTop - viewH;
      const target = start + totalRange * progress;
      window.scrollTo({ top: target, behavior: 'instant' });
    },
    { key, progress },
  );
  await page.waitForTimeout(150);
}
