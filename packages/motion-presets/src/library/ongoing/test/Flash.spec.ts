import { describe, expect, test } from 'vitest';

import * as Flash from '../Flash';
import { getLoopEasing } from '../../../easingUtils';
import type { TimeAnimationOptions } from '../../../types';

const options = (namedEffect = {}, rest: Partial<TimeAnimationOptions> = {}) =>
  ({
    duration: 1000,
    namedEffect: { type: 'Flash', ...namedEffect },
    ...rest,
  }) as TimeAnimationOptions;

describe('Flash', () => {
  test('fades out and back in with cubicInOut by default', () => {
    const [fade] = Flash.style(options());
    const shape = {
      shape: [
        [0, 0],
        [1, 0.5],
        [0, 1],
      ] as [number, number][],
      easings: ['cubicInOut'],
    };
    expect(fade.keyframes).toEqual([{ offset: 0, opacity: 'var(--motion-opacity, 0)' }]);
    expect(fade.easing).toBe(getLoopEasing(shape));
    expect(fade.duration).toBe(1000);
  });

  test('uses the user easing on both halves', () => {
    const [fade] = Flash.style(options({}, { easing: 'sineIn' }));
    expect(fade.easing).toBe(
      getLoopEasing({
        shape: [
          [0, 0],
          [1, 0.5],
          [0, 1],
        ],
        easings: ['sineIn'],
      }),
    );
  });

  test('iterationDelay stretches the duration and holds at rest', () => {
    const [fade] = Flash.style(options({ iterationDelay: 500 }));
    expect(fade.duration).toBe(1500);
    expect(fade.easing).toMatch(/, 1 66\.67%, 1 100%\)$/);
  });
});
