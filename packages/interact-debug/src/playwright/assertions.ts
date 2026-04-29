import { expect as baseExpect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Custom Playwright expect matchers for interact-debug.
 *
 * Usage:
 *   import { expect } from '@wix/interact-debug/playwright';
 *   await expect(page).toHaveAnimationPlaying('hero');
 */
export const expect = baseExpect.extend({
  async toHaveAnimationPlaying(page: Page, key: string) {
    const pass = await page.evaluate((key) => {
      const el = document.querySelector(`[data-interact-key="${key}"]`);
      if (!el) return false;
      return (el as HTMLElement).getAnimations().some((a) => a.playState === 'running');
    }, key);

    return {
      pass,
      message: () =>
        pass
          ? `Expected key "${key}" to NOT have a running animation`
          : `Expected key "${key}" to have a running animation but none found`,
    };
  },

  async toHaveComputedStyle(
    page: Page,
    key: string,
    property: string,
    expectedValue: string | RegExp,
  ) {
    const actual = await page.evaluate(
      ({ key, property }) => {
        const el = document.querySelector(`[data-interact-key="${key}"]`);
        if (!el) return '';
        return window.getComputedStyle(el).getPropertyValue(property);
      },
      { key, property },
    );

    const pass =
      expectedValue instanceof RegExp ? expectedValue.test(actual) : actual === expectedValue;

    return {
      pass,
      message: () =>
        pass
          ? `Expected key "${key}" CSS ${property} to NOT match ${expectedValue}, got "${actual}"`
          : `Expected key "${key}" CSS ${property} to be ${expectedValue}, got "${actual}"`,
    };
  },

  async toHaveDataAttribute(page: Page, key: string, attr: string, value?: string) {
    const actual = await page.evaluate(
      ({ key, attr }) => {
        const el = document.querySelector(`[data-interact-key="${key}"]`);
        if (!el) return null;
        return el.getAttribute(attr);
      },
      { key, attr },
    );

    const pass = value !== undefined ? actual === value : actual !== null;

    return {
      pass,
      message: () =>
        pass
          ? `Expected key "${key}" to NOT have attribute ${attr}${value !== undefined ? `="${value}"` : ''}`
          : `Expected key "${key}" to have attribute ${attr}${value !== undefined ? `="${value}"` : ''}, got ${actual === null ? 'missing' : `"${actual}"`}`,
    };
  },

  async toHaveAnimationCount(page: Page, key: string, expectedCount: number) {
    const actual = await page.evaluate((key) => {
      const el = document.querySelector(`[data-interact-key="${key}"]`);
      if (!el) return 0;
      return (el as HTMLElement).getAnimations().length;
    }, key);

    return {
      pass: actual === expectedCount,
      message: () => `Expected key "${key}" to have ${expectedCount} animation(s), got ${actual}`,
    };
  },
});
