import { describe, expect, test } from 'vitest';

import * as Spin from '../Spin';
import { getLoopEasing } from '../../../easingUtils';
import type { TimeAnimationOptions } from '../../../types';

const options = (namedEffect = {}, rest: Partial<TimeAnimationOptions> = {}) =>
  ({
    duration: 1000,
    namedEffect: { type: 'Spin', ...namedEffect },
    ...rest,
  }) as TimeAnimationOptions;

describe('Spin', () => {
  test('a full turn from its peak to rest, linear by default', () => {
    const [spin, rotation] = Spin.style(options());
    expect(spin.custom).toMatchObject({
      '--motion-trans-rot-angle': '360deg',
      '--motion-trans-rot-from': -1,
    });
    expect(spin.easing).toBe(
      getLoopEasing({
        shape: [
          [1, 0],
          [0, 1],
        ],
      }),
    );
    expect(rotation.composite).toBe('add');
  });

  test('counter-clockwise starts from the opposite sign', () => {
    const [spin] = Spin.style(options({ direction: 'counter-clockwise' }));
    expect(spin.custom).toMatchObject({ '--motion-trans-rot-from': 1 });
  });

  test('uses the user easing', () => {
    const [spin] = Spin.style(options({}, { easing: 'sineInOut' }));
    expect(spin.easing).toBe(
      getLoopEasing({
        shape: [
          [1, 0],
          [0, 1],
        ],
        easings: ['sineInOut'],
      }),
    );
  });

  test('iterationDelay stretches the duration and holds at rest', () => {
    const [spin, rotation] = Spin.style(options({ iterationDelay: 1000 }));
    expect(spin.easing).toBe('linear(0 0%, 1 50%, 1 100%)');
    expect([spin.duration, rotation.duration]).toEqual([2000, 2000]);
  });
});
