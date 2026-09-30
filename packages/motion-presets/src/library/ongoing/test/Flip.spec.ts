import { describe, expect, test } from 'vitest';

import * as Flip from '../Flip';
import { getLoopEasing } from '../../../easingUtils';
import type { TimeAnimationOptions } from '../../../types';

const options = (namedEffect = {}, rest: Partial<TimeAnimationOptions> = {}) =>
  ({
    duration: 1000,
    namedEffect: { type: 'Flip', ...namedEffect },
    ...rest,
  }) as TimeAnimationOptions;

describe('Flip', () => {
  test('layout rotation first, then the 3d flip added on the rotated axes', () => {
    const [rotation, flip] = Flip.style(options());
    expect(rotation.composite).toBe('replace');
    expect(flip.composite).toBe('add');
  });

  test('a full horizontal turn by default', () => {
    const [, flip] = Flip.style(options());
    expect(flip.custom).toMatchObject({
      '--motion-transform-3d-angle-y': '360deg',
      '--motion-transform-3d-angle-x': '0deg',
      '--motion-transform-3d-perspective': '800px',
    });
    expect(flip.easing).toBe(
      getLoopEasing({
        shape: [
          [1, 0],
          [0, 1],
        ],
      }),
    );
  });

  test('vertical turns around the x-axis', () => {
    const [, flip] = Flip.style(options({ direction: 'vertical' }));
    expect(flip.custom).toMatchObject({
      '--motion-transform-3d-angle-x': '-360deg',
      '--motion-transform-3d-angle-y': '0deg',
    });
  });

  test('uses the user easing', () => {
    const [, flip] = Flip.style(options({}, { easing: 'cubicIn' }));
    expect(flip.easing).toBe(
      getLoopEasing({
        shape: [
          [1, 0],
          [0, 1],
        ],
        easings: ['cubicIn'],
      }),
    );
  });
});
