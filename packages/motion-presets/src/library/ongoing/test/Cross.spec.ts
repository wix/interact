import { describe, expect, test } from 'vitest';

import * as Cross from '../Cross';
import { getWrapEasing } from '../../../easingUtils';
import { getOffscreenTravel } from '../../../layoutUtils';
import type { DomApi, TimeAnimationOptions } from '../../../types';

const options = (namedEffect = {}) =>
  ({ duration: 1000, namedEffect: { type: 'Cross', ...namedEffect } }) as TimeAnimationOptions;

// an element 100px wide at left 100px, in a 1000px wide container
function fakeDom() {
  const parent = document.createElement('div');
  const target = document.createElement('div');
  parent.append(target);
  const define = (el: HTMLElement, props: Record<string, unknown>) =>
    Object.entries(props).forEach(([key, value]) =>
      Object.defineProperty(el, key, { value, configurable: true }),
    );
  define(parent, {
    offsetWidth: 1000,
    offsetHeight: 500,
    offsetLeft: 0,
    offsetTop: 0,
    offsetParent: null,
  });
  define(target, {
    offsetWidth: 100,
    offsetHeight: 50,
    offsetLeft: 100,
    offsetTop: 200,
    offsetParent: parent,
  });
  const run = (fn: (el: HTMLElement) => void) => fn(target);
  return { target, dom: { measure: run, mutate: run } as unknown as DomApi };
}

describe('Cross', () => {
  test('continuous keyframes from the direction side to the opposite side', () => {
    const [cross, rotation] = Cross.style(options());
    expect(cross.custom).toMatchObject({
      '--motion-trans-rot-direction': 'calc(180deg + 0deg)',
      '--motion-trans-rot-from': -1,
      '--motion-trans-rot-to': 1,
      '--motion-trans-rot-travel': getOffscreenTravel('right'),
      '--motion-trans-rot-to-travel': getOffscreenTravel('left'),
    });
    expect(rotation.composite).toBe('add');
  });

  test('maps the eight directions to css angles', () => {
    const angle = (direction: string) =>
      (Cross.style(options({ direction }))[0].custom as Record<string, string>)[
        '--motion-trans-rot-direction'
      ];
    expect(angle('bottom-right')).toBe('calc(180deg + 45deg)');
    expect(angle('bottom')).toBe('calc(180deg + 90deg)');
    expect(angle('left')).toBe('calc(180deg + 180deg)');
    expect(angle('top')).toBe('calc(180deg + 270deg)');
    expect(angle('top-right')).toBe('calc(180deg + 315deg)');
  });

  test('without measurements it wraps in the middle', () => {
    const [cross] = Cross.style(options({ iterationDelay: 1000 }));
    expect(cross.easing).toBe(getWrapEasing(0.5, 0.5));
    expect(cross.duration).toBe(2000);
    expect('timing' in cross).toBe(false);
  });

  test('web wraps where the measured distances meet, after measuring', () => {
    const { target, dom } = fakeDom();
    const [cross] = Cross.web(options(), dom) as any[];
    // right: 1000 - 100 = 900, left: 100 + 100 = 200
    expect(cross.timing.easing).toBe(getWrapEasing(900 / 1100));
    expect(target.style.getPropertyValue('--motion-left')).toBe('100px');
    expect(target.style.getPropertyValue('--motion-container-width')).toBe('1000px');
  });
});
