import type { Page } from '@playwright/test';

/**
 * Move the mouse to a position expressed as a ratio (0–1) within
 * the bounding rect of the given container element.
 */
export async function movePointerWithinElement(
  page: Page,
  containerSelector: string,
  ratioX: number,
  ratioY: number,
): Promise<void> {
  // Ensure the element is in the viewport before interacting
  await page.locator(containerSelector).scrollIntoViewIfNeeded();

  const rect = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`Element not found: ${sel}`);
    const { left, top, width, height } = el.getBoundingClientRect();
    return { left, top, width, height };
  }, containerSelector);

  const x = rect.left + rect.width * ratioX;
  const y = rect.top + rect.height * ratioY;
  await page.mouse.move(x, y);
  // Allow pointermove handlers to settle
  await new Promise((r) => setTimeout(r, 50));
}
