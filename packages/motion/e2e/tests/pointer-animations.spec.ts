import { test, expect } from '@playwright/test';
import { PointerPage } from '../pages/pointer-page';
import { POINTER_IDS, POINTER_SELECTORS } from '../constants/pointer';

test.describe('Pointer-Driven Animations', () => {
  let pointerPage: PointerPage;

  test.beforeEach(async ({ page }) => {
    pointerPage = new PointerPage(page);
    await pointerPage.goto();
  });

  test.describe('Pointer Move Trigger', () => {
    test('should drive x-axis animation based on horizontal position', async ({ page }) => {
      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.area, 0.05, 0.5);
      const transformLeft = await page.evaluate(
        (targetId) => getComputedStyle(document.getElementById(targetId)!).transform,
        POINTER_IDS.xAxisTarget,
      );

      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.area, 0.95, 0.5);
      const transformRight = await page.evaluate(
        (targetId) => getComputedStyle(document.getElementById(targetId)!).transform,
        POINTER_IDS.xAxisTarget,
      );

      expect(transformLeft).not.toBe(transformRight);
    });

    test('should drive y-axis animation based on vertical position', async ({ page }) => {
      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.yAxisArea, 0.5, 0.05);
      const transformTop = await page.evaluate(
        (targetId) => getComputedStyle(document.getElementById(targetId)!).transform,
        POINTER_IDS.yAxisTarget,
      );

      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.yAxisArea, 0.5, 0.95);
      const transformBottom = await page.evaluate(
        (targetId) => getComputedStyle(document.getElementById(targetId)!).transform,
        POINTER_IDS.yAxisTarget,
      );

      expect(transformTop).not.toBe(transformBottom);
    });
  });

  test.describe('Composite Operations', () => {
    test('should create two independent AnimationGroup instances on the same element', async ({
      page,
    }) => {
      // Trigger progress on both groups so animations leave idle state and become visible to getAnimations()
      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.compositeArea, 0.5, 0.5);

      const animationCount = await page.evaluate(
        (targetId) => document.getElementById(targetId)?.getAnimations().length ?? 0,
        POINTER_IDS.compositeTarget,
      );

      expect(animationCount).toBeGreaterThanOrEqual(2);
    });

    test('should respond to both x and y pointer axes independently', async ({ page }) => {
      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.compositeArea, 0.05, 0.05);
      const transformAtOrigin = await page.evaluate(
        (targetId) => getComputedStyle(document.getElementById(targetId)!).transform,
        POINTER_IDS.compositeTarget,
      );

      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.compositeArea, 0.95, 0.95);
      const transformAtEnd = await page.evaluate(
        (targetId) => getComputedStyle(document.getElementById(targetId)!).transform,
        POINTER_IDS.compositeTarget,
      );

      expect(transformAtOrigin).not.toBe(transformAtEnd);
    });
  });

  test.describe('Effect Types Via getScrubScene', () => {
    test('should drive namedEffect pointer animation on x-axis', async ({ page }) => {
      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.namedArea, 0.05, 0.5);
      await page.waitForTimeout(80);
      const leftState = await page.evaluate((targetId) => {
        const element = document.getElementById(targetId);
        const style = element ? getComputedStyle(element) : null;
        return {
          transform: style?.transform ?? null,
          opacity: style?.opacity ?? null,
        };
      }, POINTER_IDS.namedTarget);

      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.namedArea, 0.95, 0.5);
      await page.waitForTimeout(80);
      const rightState = await page.evaluate((targetId) => {
        const element = document.getElementById(targetId);
        const style = element ? getComputedStyle(element) : null;
        return {
          transform: style?.transform ?? null,
          opacity: style?.opacity ?? null,
        };
      }, POINTER_IDS.namedTarget);

      expect(leftState.transform).not.toBe(rightState.transform);
      expect(leftState.opacity).not.toBe(rightState.opacity);
    });

    test('should drive customEffect pointer animation on y-axis', async ({ page }) => {
      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.customArea, 0.5, 0.05);
      await page.waitForTimeout(80);
      const topState = await page.evaluate((targetId) => {
        const element = document.getElementById(targetId);
        if (!element) {
          return null;
        }

        const style = getComputedStyle(element);
        return {
          opacityVar: style.getPropertyValue('--custom-opacity').trim(),
          scaleVar: style.getPropertyValue('--custom-scale').trim(),
        };
      }, POINTER_IDS.customTarget);

      await pointerPage.movePointerWithinElement(POINTER_SELECTORS.customArea, 0.5, 0.95);
      await page.waitForTimeout(80);
      const bottomState = await page.evaluate((targetId) => {
        const element = document.getElementById(targetId);
        if (!element) {
          return null;
        }

        const style = getComputedStyle(element);
        return {
          opacityVar: style.getPropertyValue('--custom-opacity').trim(),
          scaleVar: style.getPropertyValue('--custom-scale').trim(),
        };
      }, POINTER_IDS.customTarget);

      expect(topState).not.toBeNull();
      expect(bottomState).not.toBeNull();
      expect(topState?.opacityVar).not.toBe(bottomState?.opacityVar);
      expect(topState?.scaleVar).not.toBe(bottomState?.scaleVar);
    });
  });

  test.describe('Cleanup', () => {
    test('should move AnimationGroup to idle state after cancel', async () => {
      await pointerPage.cancelPointerScene();

      const playState = await pointerPage.getPointerScenePlayState();
      expect(playState).toBe('idle');
    });
  });
});
