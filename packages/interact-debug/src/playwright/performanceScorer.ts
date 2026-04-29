import type { Page } from '@playwright/test';
import type { InteractArtifact, ScoreResult, Scope } from '../types';
import { isInScope } from '../validate/helpers';
import { weightedAverage } from '../score/utils';
import { fireTrigger } from './triggerHelpers';

/**
 * Runtime performance scorer. Measures:
 * - CLS (Cumulative Layout Shift) during animations
 * - Whether animations use compositor-only properties
 * - Long Animation Frames count
 */
export async function scorePerformance(
  page: Page,
  artifact: InteractArtifact,
  scope?: Scope,
): Promise<ScoreResult> {
  const subscores: ScoreResult[] = [];

  // 1. Install CLS observer before triggering
  await page.evaluate(() => {
    (window as any).__cls = 0;
    (window as any).__clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          (window as any).__cls += (entry as any).value;
        }
      }
    });
    (window as any).__clsObserver.observe({ type: 'layout-shift', buffered: true });
  });

  // 2. Install long animation frame observer
  await page.evaluate(() => {
    (window as any).__longFrames = 0;
    try {
      (window as any).__longFrameObserver = new PerformanceObserver((list) => {
        (window as any).__longFrames += list.getEntries().length;
      });
      (window as any).__longFrameObserver.observe({ type: 'long-animation-frame', buffered: true });
    } catch {
      // LoAF not supported in all browsers
    }
  });

  // 3. Fire all triggers in scope
  const interactions = scope
    ? artifact.config.interactions.filter((ix, i) => isInScope(ix, i, scope))
    : artifact.config.interactions;

  for (const ix of interactions) {
    if (ix.trigger === 'animationEnd') continue;
    await fireTrigger(page, ix.trigger, ix.key);
    await page.waitForTimeout(200);
  }

  // Wait for animations to settle
  await page.waitForTimeout(1000);

  // 4. Collect CLS
  const cls = await page.evaluate(() => {
    (window as any).__clsObserver?.disconnect();
    return (window as any).__cls ?? 0;
  });

  const clsScore = cls <= 0.01 ? 1 : cls <= 0.1 ? 0.7 : cls <= 0.25 ? 0.4 : 0;
  subscores.push({
    dimension: 'cumulativeLayoutShift',
    score: clsScore,
    weight: 0.35,
    details: `CLS: ${cls.toFixed(4)}`,
  });

  // 5. Collect long animation frames
  const longFrames = await page.evaluate(() => {
    (window as any).__longFrameObserver?.disconnect();
    return (window as any).__longFrames ?? 0;
  });

  const longFrameScore = longFrames === 0 ? 1 : Math.max(0, 1 - longFrames * 0.2);
  subscores.push({
    dimension: 'longAnimationFrames',
    score: longFrameScore,
    weight: 0.3,
    details: `${longFrames} long animation frame(s)`,
  });

  // 6. Compositor-only property check via live animations
  const compositorRatio = await page.evaluate(() => {
    const allAnims = document.getAnimations();
    let compositor = 0;
    let total = 0;
    const compositorProps = new Set([
      'transform',
      'opacity',
      'filter',
      'backdrop-filter',
      'clip-path',
      'offset-distance',
      'translate',
      'rotate',
      'scale',
    ]);

    for (const anim of allAnims) {
      if (!anim.effect || typeof (anim.effect as any).getKeyframes !== 'function') continue;
      const keyframes = (anim.effect as any).getKeyframes();
      for (const frame of keyframes) {
        for (const key of Object.keys(frame)) {
          if (['offset', 'easing', 'composite', 'computedOffset'].includes(key)) continue;
          total++;
          const kebab = key.replace(/[A-Z]/g, (m: string) => `-${m.toLowerCase()}`);
          if (compositorProps.has(kebab) || compositorProps.has(key)) compositor++;
        }
      }
    }
    return total > 0 ? compositor / total : 1;
  });

  subscores.push({
    dimension: 'compositorProperties',
    score: compositorRatio,
    weight: 0.35,
    details: `${(compositorRatio * 100).toFixed(0)}% compositor-friendly properties in live animations`,
  });

  const score = weightedAverage(subscores);
  return {
    dimension: 'performance',
    score,
    weight: 0.15,
    details: 'Runtime performance: CLS, long frames, compositor properties',
    subscores,
  };
}
