import type { Page } from '@playwright/test';

/**
 * Wait until a window-exposed AnimationGroup's playState matches one of the target states.
 * Covers the common pattern of polling `(window as any)[key].playState`.
 */
export async function waitForWindowPlayState(
  page: Page,
  windowKey: string,
  states: string[],
  timeout = 2000,
): Promise<void> {
  await page.waitForFunction(
    ({ key, targetStates }) => {
      const obj = (window as unknown as Record<string, { playState?: string }>)[key];
      return targetStates.includes(obj?.playState ?? '');
    },
    { key: windowKey, targetStates: states },
    { timeout },
  );
}

/**
 * Wait until a DOM element's first WAAPI animation reaches one of the target playStates.
 */
export async function waitForElementAnimationState(
  page: Page,
  elementId: string,
  states: string[],
  timeout = 2000,
): Promise<void> {
  try {
    await page.waitForFunction(
      ({ id, targetStates }) => {
        const el = document.getElementById(id);
        const state = el?.getAnimations()[0]?.playState;
        return targetStates.includes(state ?? '');
      },
      { id: elementId, targetStates: states },
      { timeout },
    );
  } catch (error) {
    const debug = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return {
        exists: !!el,
        animationCount: el?.getAnimations().length ?? 0,
        playState: el?.getAnimations()[0]?.playState ?? 'none',
      };
    }, elementId);

    throw new Error(
      [
        `Timed out waiting for #${elementId} animation state.`,
        `Expected: [${states.join(', ')}]`,
        `Actual: ${debug.playState}`,
        `Element exists: ${debug.exists}`,
        `Animation count: ${debug.animationCount}`,
        `Original error: ${String(error)}`,
      ].join('\n'),
    );
  }
}

/** Return the playState of a DOM element's first WAAPI animation (or 'none'). */
export function getElementAnimationPlayState(page: Page, elementId: string): Promise<string> {
  return page.evaluate(
    (id) => document.getElementById(id)?.getAnimations()[0]?.playState ?? 'none',
    elementId,
  );
}

/** Wait until the first element matching `selector` has at least one active animation. */
export async function waitForElementAnimation(
  page: Page,
  selector: string,
  timeout = 2000,
): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelectorAll(sel)[0];
      return el ? el.getAnimations().length > 0 : false;
    },
    selector,
    { timeout },
  );
}
