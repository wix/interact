import type { Page } from '@playwright/test';

/**
 * Wait until the WAAPI animations on a keyed element reach one of the target play states.
 */
export async function waitForAnimationState(
  page: Page,
  key: string,
  targetStates: string[],
  timeout = 5000,
): Promise<void> {
  await page.waitForFunction(
    ({ key, targetStates }) => {
      const el = document.querySelector(`[data-interact-key="${key}"]`);
      if (!el) return false;
      const anims = (el as HTMLElement).getAnimations();
      if (anims.length === 0) return false;
      return anims.some((a) => targetStates.includes(a.playState));
    },
    { key, targetStates },
    { timeout },
  );
}

/**
 * Return the number of WAAPI animations on a keyed element.
 */
export async function getAnimationCount(page: Page, key: string): Promise<number> {
  return page.evaluate((key) => {
    const el = document.querySelector(`[data-interact-key="${key}"]`);
    if (!el) return 0;
    return (el as HTMLElement).getAnimations().length;
  }, key);
}

/**
 * Get a computed style property for a keyed element.
 */
export async function getComputedStyleProp(
  page: Page,
  key: string,
  property: string,
): Promise<string> {
  return page.evaluate(
    ({ key, property }) => {
      const el = document.querySelector(`[data-interact-key="${key}"]`);
      if (!el) return '';
      return window.getComputedStyle(el).getPropertyValue(property);
    },
    { key, property },
  );
}

/**
 * Wait until a computed style property on a keyed element changes from `fromValue`.
 */
export async function waitForStyleChange(
  page: Page,
  key: string,
  property: string,
  fromValue: string,
  timeout = 5000,
): Promise<void> {
  await page.waitForFunction(
    ({ key, property, fromValue }) => {
      const el = document.querySelector(`[data-interact-key="${key}"]`);
      if (!el) return false;
      return window.getComputedStyle(el).getPropertyValue(property) !== fromValue;
    },
    { key, property, fromValue },
    { timeout },
  );
}
