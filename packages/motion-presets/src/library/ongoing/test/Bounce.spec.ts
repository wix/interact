import { describe, expect, test } from 'vitest';

import * as Bounce from '../Bounce';
import { getLoopEasing } from '../../../easingUtils';
import type { TimeAnimationOptions } from '../../../types';
import { progressAt } from './testUtils';

const options = (namedEffect = {}, rest: Partial<TimeAnimationOptions> = {}) =>
  ({
    duration: 1000,
    namedEffect: { type: 'Bounce', ...namedEffect },
    ...rest,
  }) as TimeAnimationOptions;

describe('Bounce', () => {
  test('jumps 49px up by default, then the layout rotation', () => {
    const [bounce, rotation] = Bounce.style(options());
    expect(bounce.custom).toMatchObject({
      '--motion-trans-rot-travel': '49px',
      '--motion-trans-rot-direction': '90deg',
      '--motion-trans-rot-from': -1,
    });
    expect(rotation.composite).toBe('add');
  });

  test('always bounces up', () => {
    const [bounce] = Bounce.style(options({ direction: 'left', travel: 98 }));
    expect(bounce.custom).toMatchObject({
      '--motion-trans-rot-travel': '98px',
      '--motion-trans-rot-direction': '90deg',
    });
  });

  test('peaks at the jump, sineOut per segment regardless of the user easing', () => {
    const [{ easing }] = Bounce.style(options({}, { easing: 'linear' }));
    expect(progressAt(easing!, 26.5)).toBeCloseTo(0, 3);
    expect(progressAt(easing!, 53.1)).toBeCloseTo(1, 3);
    expect(easing).toContain(
      getLoopEasing({
        shape: [
          [0, 0],
          [55 / 98, 0.088],
        ],
        easings: ['sineOut'],
      }).slice(7, -1),
    );
  });
});
