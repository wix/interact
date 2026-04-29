import type { Page } from '@playwright/test';

/**
 * Move the pointer to hover over a keyed element's center.
 */
export async function hoverElement(page: Page, key: string): Promise<void> {
  const loc = page.locator(`[data-interact-key="${key}"]`);
  await loc.scrollIntoViewIfNeeded();
  await loc.hover();
  await page.waitForTimeout(50);
}

/**
 * Move the pointer away from a keyed element (to page corner).
 */
export async function unhoverElement(page: Page): Promise<void> {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(50);
}

/**
 * Click on a keyed element.
 */
export async function clickElement(page: Page, key: string): Promise<void> {
  const loc = page.locator(`[data-interact-key="${key}"]`);
  await loc.scrollIntoViewIfNeeded();
  await loc.click();
  await page.waitForTimeout(50);
}

/**
 * Move the pointer to a specific position within a keyed element,
 * expressed as ratios (0–1) of the element's bounding box.
 */
export async function movePointerWithinElement(
  page: Page,
  key: string,
  xRatio: number,
  yRatio: number,
): Promise<void> {
  const loc = page.locator(`[data-interact-key="${key}"]`);
  await loc.scrollIntoViewIfNeeded();
  const box = await loc.boundingBox();
  if (!box) return;
  const x = box.x + box.width * xRatio;
  const y = box.y + box.height * yRatio;
  await page.mouse.move(x, y);
  await page.waitForTimeout(50);
}
