import { describe, expect, test } from 'vitest';

import * as Swing from '../Swing';
import { toCssEasing, toEasingFunction } from '../../../easingUtils';
import type { TimeAnimationOptions } from '../../../types';
import { progressAt } from './testUtils';

const options = (namedEffect = {}, rest: Partial<TimeAnimationOptions> = {}) =>
  ({
    duration: 1000,
    namedEffect: { type: 'Swing', ...namedEffect },
    ...rest,
  }) as TimeAnimationOptions;

describe('Swing', () => {
  test('layout rotation first, then the swing added around the rotated pivot', () => {
    const [rotation, swing] = Swing.style(options());
    expect(rotation.composite).toBe('replace');
    expect(swing.composite).toBe('add');
  });

  test('swings 20deg around the top by default, first to the positive angle', () => {
    const [, swing] = Swing.style(options());
    expect(swing.custom).toMatchObject({
      '--motion-trans-rot-angle': '20deg',
      '--motion-trans-rot-from': 1,
      '--motion-trans-rot-origin-x': '0px',
      '--motion-trans-rot-origin-y': '-50%',
    });
    expect(progressAt(swing.easing!, 0)).toBe(1);
    expect(progressAt(swing.easing!, (0.0934 / 1.175) * 100)).toBeCloseTo(0, 2);
    expect(progressAt(swing.easing!, (0.28 / 1.175) * 100)).toBeCloseTo(2, 2);
    expect(progressAt(swing.easing!, 100)).toBe(1);
  });

  test('pivot sets the transform origin', () => {
    const [, swing] = Swing.style(options({ pivot: 'right', angle: 30 }));
    expect(swing.custom).toMatchObject({
      '--motion-trans-rot-angle': '30deg',
      '--motion-trans-rot-origin-x': '50%',
      '--motion-trans-rot-origin-y': '0px',
    });
  });

  test('eases out of rest and in-out between peaks, from the user easing family', () => {
    const quarter = (easing?: string) =>
      progressAt(
        Swing.style(options({}, easing ? { easing } : {}))[1].easing!,
        (0.0934 / 1.175) * 25,
      );
    const ease = (easing: string) => toEasingFunction(toCssEasing(easing))(0.25);
    expect(quarter()).toBeCloseTo(1 - ease('sineOut'), 2);
    expect(quarter('cubicIn')).toBeCloseTo(1 - ease('cubicOut'), 2);
  });
});
