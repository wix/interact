import { describe, expect, test } from 'vitest';

import * as Fold from '../Fold';
import { toCssEasing, toEasingFunction } from '../../../easingUtils';
import type { TimeAnimationOptions } from '../../../types';
import { progressAt } from './testUtils';

const options = (namedEffect = {}, rest: Partial<TimeAnimationOptions> = {}) =>
  ({
    duration: 1000,
    namedEffect: { type: 'Fold', ...namedEffect },
    ...rest,
  }) as TimeAnimationOptions;

// the first peak's rotation around each axis
function peak(pivot: string) {
  const [, fold] = Fold.style(options({ pivot }));
  const custom = fold.custom as Record<string, string | number>;
  const from = custom['--motion-transform-3d-from'] as number;
  return ['x', 'y'].map(
    (axis) => from * parseFloat(custom[`--motion-transform-3d-angle-${axis}`] as string) + 0,
  );
}

describe('Fold', () => {
  test('layout rotation first, then the fold added around the rotated pivot', () => {
    const [rotation, fold] = Fold.style(options());
    expect(rotation.composite).toBe('replace');
    expect(fold.composite).toBe('add');
    expect(fold.custom).toMatchObject({
      '--motion-transform-3d-origin-y': '-50%',
      '--motion-transform-3d-perspective': '800px',
    });
  });

  test('folds 15deg towards the viewer first, for every pivot', () => {
    expect(peak('top')).toEqual([15, 0]);
    expect(peak('bottom')).toEqual([-15, 0]);
    expect(peak('left')).toEqual([0, -15]);
    expect(peak('right')).toEqual([0, 15]);
  });

  test('eases out of rest with the user easing family, then sineInOut', () => {
    const first = (0.1 / 1.189) * 100;
    const at = (easing?: string) =>
      progressAt(Fold.style(options({}, easing ? { easing } : {}))[1].easing!, first / 2);
    const ease = (easing: string) => toEasingFunction(toCssEasing(easing))(0.5);
    expect(at()).toBeCloseTo(1 - ease('cubicOut'), 2);
    expect(at('sineIn')).toBeCloseTo(1 - ease('sineOut'), 2);
  });
});
