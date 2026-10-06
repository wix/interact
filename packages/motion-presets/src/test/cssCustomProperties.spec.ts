import { describe, expect, test } from 'vitest';

import * as backgroundScroll from '../library/backgroundScroll';
import * as entrance from '../library/entrance';
import * as mouse from '../library/mouse';
import * as ongoing from '../library/ongoing';
import * as scroll from '../library/scroll';
import type { AnimationData, DomApi } from '../types';

/**
 * In CSS mode (`style()`, used by `@wix/interact`'s `generate()` and CSS animations), keyframes refer to their
 * parameters as `var(--name)`. Each such variable must be declared by the animation itself (its `custom`) or be a
 * measured value the preset's `prepare()` writes on the element at runtime. Otherwise the keyframe value is invalid
 * and the browser drops the animated property (e.g. `transform: none`).
 */

/** Variables a preset measures from the DOM in `prepare()` (see backgroundScroll/utils.ts). */
const MEASURED = ['--motion-comp-height', '--motion-comp-half-height', '--motion-site-height'];

/** `var(--name)` references that have no fallback value. */
function requiredVars(value: unknown): string[] {
  return [...String(value ?? '').matchAll(/var\((--[\w-]+)\s*\)/g)].map((m) => m[1]);
}

function referencedVars(animation: AnimationData & Record<string, unknown>): string[] {
  const values = [
    ...(animation.keyframes ?? []).flatMap((keyframe) => Object.values(keyframe)),
    animation.startOffsetAdd,
    animation.endOffsetAdd,
  ];
  return [...new Set(values.flatMap(requiredVars))];
}

/** Records what `prepare()` writes on the element through the DOM API. */
function prepared(
  preset: { prepare?: (options: any, dom?: DomApi) => unknown },
  options: object,
): string[] {
  const written: string[] = [];
  const target = {
    offsetHeight: 600,
    offsetWidth: 980,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      right: 980,
      bottom: 600,
      width: 980,
      height: 600,
      x: 0,
      y: 0,
    }),
    style: { setProperty: (name: string) => written.push(name) },
  } as unknown as HTMLElement;
  const dom: DomApi = {
    measure: (callback) => callback(target),
    mutate: (callback) => callback(target),
  };
  preset.prepare?.(options, dom);
  return written;
}

const all = Object.entries({ backgroundScroll, entrance, mouse, ongoing, scroll }).flatMap(
  ([category, library]) =>
    Object.entries(library as Record<string, any>)
      .filter(([, preset]) => typeof preset?.style === 'function')
      .map(([name, preset]) => ({ category, name, preset })),
);

describe('CSS-mode custom properties', () => {
  test.each(all)('$category/$name declares every variable its keyframes use', ({ preset }) => {
    const options = { id: '1', duration: 1000, namedEffect: {} };
    const animations: (AnimationData & Record<string, unknown>)[] = preset.style(options, false);
    const measured = prepared(preset, options);

    for (const animation of animations) {
      const declared = Object.keys(animation.custom ?? {});
      for (const name of referencedVars(animation)) {
        if (MEASURED.includes(name))
          expect(measured, `${animation.name}: ${name} is not set by prepare()`).toContain(name);
        else
          expect(declared, `${animation.name}: ${name} is not declared in custom`).toContain(name);
      }
    }
  });
});
