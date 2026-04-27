import { test, expect } from '@playwright/test';
import { EffectsPage } from '../pages/effects-page';
import { waitForWindowPlayState, waitForElementAnimationState } from '../utils/animation-helpers';
import { EFFECTS_NAMES, EFFECTS_TARGET_IDS } from '../constants/effects';

test.describe('Effect Types', () => {
  let effectsPage: EffectsPage;

  test.beforeEach(async ({ page }) => {
    effectsPage = new EffectsPage(page);
    await effectsPage.goto();
  });

  test.describe('Named Effects — WAAPI', () => {
    test('should create AnimationGroup via getWebAnimation with registered named effect', async ({
      page,
    }) => {
      await effectsPage.runNamedWaapi();

      await waitForWindowPlayState(page, 'namedWaapiGroup', ['running', 'finished']);

      const playState = await effectsPage.getNamedWaapiPlayState();
      expect(['running', 'finished']).toContain(playState);
    });

    test('should apply correct keyframes from named effect web() method', async ({ page }) => {
      await effectsPage.runNamedWaapi();

      await waitForWindowPlayState(page, 'namedWaapiGroup', ['finished'], 3000);

      const opacity = await page.evaluate((targetId) => {
        const el = document.getElementById(targetId);
        return el ? getComputedStyle(el).opacity : null;
      }, EFFECTS_TARGET_IDS.namedWaapi);
      expect(opacity).toBe('1');
    });
  });

  test.describe('Named Effects — CSS', () => {
    test('should generate CSS animation data via getCSSAnimation with registered named effect', async () => {
      await effectsPage.runNamedCss();

      const data = await effectsPage.getNamedCssData();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test('should produce correct keyframe name from style() method', async () => {
      await effectsPage.runNamedCss();

      const data = await effectsPage.getNamedCssData();
      expect(data[0].name).toBe(EFFECTS_NAMES.namedCssKeyframeName);
    });

    test('should return animation data with correct keyframes', async () => {
      await effectsPage.runNamedCss();

      const data = await effectsPage.getNamedCssData();
      const keyframes = data[0].keyframes;
      expect(keyframes.length).toBeGreaterThan(0);
      // scale(0) → scale(1) as defined in TestScale
      expect(String(keyframes[0].transform)).toContain('scale(0)');
      expect(String(keyframes[keyframes.length - 1].transform)).toContain('scale(1)');
    });
  });

  test.describe('Named Effects — CSS Runtime Consumption', () => {
    test('should apply generated named CSS descriptor to element in browser', async ({ page }) => {
      await effectsPage.runNamedCssApplied();
      await waitForElementAnimationState(
        page,
        EFFECTS_TARGET_IDS.namedCss,
        ['paused', 'running', 'finished'],
        5000,
      );

      const result = await page.evaluate((targetId) => {
        const target = document.getElementById(targetId) as HTMLElement;
        const animation = target.getAnimations()[0];
        animation.pause();
        animation.currentTime = 0;
        const startTransform = getComputedStyle(target).transform;
        animation.currentTime = 700;
        const endTransform = getComputedStyle(target).transform;
        return {
          animationName: getComputedStyle(target).animationName,
          startTransform,
          endTransform,
        };
      }, EFFECTS_TARGET_IDS.namedCss);

      expect(result.animationName).toContain(EFFECTS_NAMES.namedCssKeyframeName);
      expect(result.startTransform).not.toBe(result.endTransform);
    });
  });

  test.describe('Keyframe Effects — WAAPI', () => {
    test('should create AnimationGroup via getWebAnimation with inline keyframeEffect', async ({
      page,
    }) => {
      await effectsPage.runKeyframeWaapi();

      await waitForWindowPlayState(page, 'keyframeWaapiGroup', ['running', 'finished']);

      const playState = await effectsPage.getKeyframeWaapiPlayState();
      expect(['running', 'finished']).toContain(playState);
    });

    test('should apply keyframeEffect keyframes to the element', async ({ page }) => {
      await effectsPage.runKeyframeWaapi();

      await waitForWindowPlayState(page, 'keyframeWaapiGroup', ['running', 'finished']);

      const hasExpectedKeyframes = await page.evaluate((targetId) => {
        const el = document.getElementById(targetId);
        const keyframes =
          (el?.getAnimations()[0]?.effect as KeyframeEffect)?.getKeyframes?.() ?? [];
        return keyframes.some((kf) => String(kf.transform).includes('translateX'));
      }, EFFECTS_TARGET_IDS.keyframeWaapi);

      expect(hasExpectedKeyframes).toBe(true);
    });
  });

  test.describe('Keyframe Effects — CSS', () => {
    test('should generate CSS animation data via getCSSAnimation with inline keyframeEffect', async () => {
      await effectsPage.runKeyframeCss();

      const data = await effectsPage.getKeyframeCssData();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test('should produce correct CSS keyframe name from keyframeEffect.name', async () => {
      await effectsPage.runKeyframeCss();

      const data = await effectsPage.getKeyframeCssData();
      expect(data[0].name).toBe(EFFECTS_NAMES.keyframeCssName);
    });

    test('should include keyframeEffect keyframes in CSS output', async () => {
      await effectsPage.runKeyframeCss();

      const data = await effectsPage.getKeyframeCssData();
      const keyframes = data[0].keyframes;
      expect(keyframes.length).toBeGreaterThan(0);
      // rotate(0deg) → rotate(360deg)
      expect(String(keyframes[0].transform)).toContain('rotate(0deg)');
    });
  });

  test.describe('Keyframe Effects — CSS Runtime Consumption', () => {
    test('should apply generated keyframe CSS descriptor to element in browser', async ({
      page,
    }) => {
      await effectsPage.runKeyframeCssApplied();
      await waitForElementAnimationState(
        page,
        EFFECTS_TARGET_IDS.keyframeCss,
        ['paused', 'running', 'finished'],
        5000,
      );

      const result = await page.evaluate((targetId) => {
        const target = document.getElementById(targetId) as HTMLElement;
        const animation = target.getAnimations()[0];
        animation.pause();
        animation.currentTime = 0;
        const startTransform = getComputedStyle(target).transform;
        animation.currentTime = 400;
        const midTransform = getComputedStyle(target).transform;
        return {
          animationName: getComputedStyle(target).animationName,
          startTransform,
          midTransform,
        };
      }, EFFECTS_TARGET_IDS.keyframeCss);

      expect(result.animationName).toContain(EFFECTS_NAMES.keyframeCssName);
      expect(result.startTransform).not.toBe(result.midTransform);
    });
  });

  test.describe('Custom Effects', () => {
    test('should create animation via getWebAnimation with customEffect function', async ({
      page,
    }) => {
      await effectsPage.runCustomEffect();

      await waitForWindowPlayState(page, 'customEffectGroup', ['running', 'finished']);

      const playState = await effectsPage.getCustomEffectPlayState();
      expect(['running', 'finished']).toContain(playState);
    });

    test('should call customEffect function with (element, progress) during playback', async ({
      page,
    }) => {
      await effectsPage.runCustomEffect();

      // Wait for at least some log entries to accumulate
      await page.waitForFunction(
        () => (window as unknown as { customEffectLog: unknown[] }).customEffectLog?.length > 2,
        { timeout: 3000 },
      );

      const log = await effectsPage.getCustomEffectLog();
      const progressEntries = log.filter((e) => e.progress !== null && e.progress !== undefined);
      expect(progressEntries.length).toBeGreaterThan(0);
      expect(progressEntries[0].tagName).toBeTruthy();
      expect(progressEntries[0].elementId).toBe(EFFECTS_TARGET_IDS.customEffect);
    });

    test('should call customEffect with null progress on cancel', async ({ page }) => {
      await effectsPage.runCustomEffect();

      // Wait for animation to start
      await page.waitForFunction(
        () => (window as unknown as { customEffectLog: unknown[] }).customEffectLog?.length > 0,
        { timeout: 3000 },
      );

      await effectsPage.cancelCustomEffect();

      const log = await effectsPage.getCustomEffectLog();
      const nullEntries = log.filter((e) => e.progress === null);
      expect(nullEntries.length).toBeGreaterThan(0);
    });

    test('should track progress updates through customEffect callback', async ({ page }) => {
      await effectsPage.runCustomEffect();

      // Wait for animation to complete — use progress log instead of playState for Firefox/WebKit compatibility
      await page.waitForFunction(
        () => {
          const log = (window as unknown as { customEffectLog: { progress: number | null }[] })
            .customEffectLog;
          return log?.some((e) => e.progress !== null && e.progress >= 0.9) ?? false;
        },
        { timeout: 3000 },
      );

      const log = await effectsPage.getCustomEffectLog();
      const progressValues = log
        .filter((e) => e.progress !== null)
        .map((e) => e.progress as number);
      // Browsers may not deliver progress=1; 0.9+ confirms the callback tracked the full animation
      expect(Math.max(...progressValues)).toBeGreaterThanOrEqual(0.9);
    });
  });

  test.describe('Playback — Play/Reverse', () => {
    test('should return to initial state after reverse completes', async ({ page }) => {
      await effectsPage.runPlayback();
      await waitForElementAnimationState(page, EFFECTS_TARGET_IDS.playback, ['running']);
      await effectsPage.runPlaybackReverse();

      await waitForElementAnimationState(page, EFFECTS_TARGET_IDS.playback, ['finished'], 5000);

      const opacity = await effectsPage.getPlaybackOpacity();
      // fill: both + reversed → element at first keyframe: opacity 0
      expect(parseFloat(opacity)).toBeCloseTo(0, 1);
    });
  });

  test.describe('Playback — Play/Pause', () => {
    test('should pause animation mid-playback and hold current state', async ({ page }) => {
      await effectsPage.runPlayback();
      await waitForElementAnimationState(page, EFFECTS_TARGET_IDS.playback, ['running']);
      await page.waitForFunction(
        (targetId) => {
          const target = document.getElementById(targetId);
          return target ? parseFloat(getComputedStyle(target).opacity) > 0.1 : false;
        },
        EFFECTS_TARGET_IDS.playback,
        { timeout: 2000 },
      );
      await effectsPage.runPlaybackPause();

      const playState = await effectsPage.getPlaybackPlayState();
      expect(playState).toBe('paused');

      const opacityBefore = await effectsPage.getPlaybackOpacity();
      await page.waitForTimeout(300);
      const opacityAfter = await effectsPage.getPlaybackOpacity();

      // Precision 1 (< 0.05 diff) — WebKit compositor can drift opacity slightly even when paused
      expect(parseFloat(opacityBefore)).toBeCloseTo(parseFloat(opacityAfter), 1);
    });

    test('should resume from paused position when played again', async ({ page }) => {
      await effectsPage.runPlayback();
      await waitForElementAnimationState(page, EFFECTS_TARGET_IDS.playback, ['running']);
      await page.waitForFunction(
        (targetId) => {
          const target = document.getElementById(targetId);
          return target ? parseFloat(getComputedStyle(target).opacity) > 0.1 : false;
        },
        EFFECTS_TARGET_IDS.playback,
        { timeout: 2000 },
      );
      await effectsPage.runPlaybackPause();

      const opacityAtPause = await effectsPage.getPlaybackOpacity();

      await effectsPage.runPlaybackResume();
      const playState = await effectsPage.getPlaybackPlayState();
      expect(['running', 'finished']).toContain(playState);

      await waitForElementAnimationState(page, EFFECTS_TARGET_IDS.playback, ['finished'], 5000);

      const opacityAfterFinish = await effectsPage.getPlaybackOpacity();
      expect(parseFloat(opacityAfterFinish)).toBeGreaterThan(parseFloat(opacityAtPause));
    });
  });
});
