import { test, expect } from '@playwright/test';
import { ScrollPage } from '../pages/scroll-page';
import { waitForWindowPlayState } from '../utils/animation-helpers';
import { SCROLL_SELECTORS } from '../constants/scroll';

test.describe('Scroll-Driven Animations', () => {
  test.describe('Default Runtime', () => {
    let scrollPage: ScrollPage;

    test.beforeEach(async ({ page }) => {
      scrollPage = new ScrollPage(page);
      await scrollPage.goto();
    });

    test('should animate based on scroll progress', async () => {
      const initialState = await scrollPage.getElementVisualState(
        SCROLL_SELECTORS.viewProgressTarget,
      );

      await scrollPage.scrollElementIntoView(SCROLL_SELECTORS.viewProgressTarget);
      await expect(async () => {
        const scrolledState = await scrollPage.getElementVisualState(
          SCROLL_SELECTORS.viewProgressTarget,
        );
        expect(scrolledState).not.toBeNull();
        expect(scrolledState?.opacity).not.toBe(initialState?.opacity);
        expect(scrolledState?.transform).not.toBe(initialState?.transform);
      }).toPass();
    });

    test('should run native customEffect for scroll-driven animation', async () => {
      const supportsNative = await scrollPage.supportsNativeViewTimeline();
      test.skip(!supportsNative, 'Native ViewTimeline is required for this customEffect flow.');

      await scrollPage.scrollTo(0);
      const before = await scrollPage.getNativeCustomValues();

      await scrollPage.scrollElementIntoView(SCROLL_SELECTORS.nativeCustomTarget);

      await expect(async () => {
        const after = await scrollPage.getNativeCustomValues();
        expect(after.progress).toBeGreaterThan(before.progress);
        expect(after.shift).toBeGreaterThan(before.shift);
      }).toPass();
    });

    test('should handle destroy cleanup properly', async ({ page }) => {
      await scrollPage.destroyScrubScene();
      await waitForWindowPlayState(page, 'scrubScene', ['idle'], 5000);

      const playState = await scrollPage.getScrubScenePlayState();
      expect(playState).toBe('idle');
    });
  });

  test.describe('Forced Non-Native Runtime', () => {
    let scrollPage: ScrollPage;

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(window, 'ViewTimeline', {
          value: undefined,
          writable: true,
          configurable: true,
        });
      });
      scrollPage = new ScrollPage(page);
      await scrollPage.goto();
    });

    test('should run getScrubScene polyfill flow for keyframe effects', async () => {
      const sceneMode = await scrollPage.getScrubSceneMode();
      expect(sceneMode).toBe('polyfill');

      const initialState = await scrollPage.getElementVisualState(
        SCROLL_SELECTORS.scrubSceneTarget,
      );

      await scrollPage.scrollElementIntoView(SCROLL_SELECTORS.scrubSceneTarget);

      await expect(async () => {
        const scrolledState = await scrollPage.getElementVisualState(
          SCROLL_SELECTORS.scrubSceneTarget,
        );
        expect(scrolledState).not.toBeNull();
        expect(scrolledState?.opacity).not.toBe(initialState?.opacity);
        expect(scrolledState?.transform).not.toBe(initialState?.transform);
      }).toPass();
    });
  });
});
