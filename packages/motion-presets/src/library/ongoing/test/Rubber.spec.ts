import { describe, expect, test } from 'vitest';

import * as Rubber from '../Rubber';
import type { TimeAnimationOptions } from '../../../types';
import { progressAt } from './testUtils';

const options = (namedEffect = {}, rest: Partial<TimeAnimationOptions> = {}) =>
  ({
    duration: 1000,
    namedEffect: { type: 'Rubber', ...namedEffect },
    ...rest,
  }) as TimeAnimationOptions;

describe('Rubber', () => {
  test('layout rotation first, then the stretch added along the rotated axes', () => {
    const [rotation, rubber] = Rubber.style(options());
    expect(rotation.composite).toBe('replace');
    expect(rubber.composite).toBe('add');
  });

  test('stretch is taller and narrower by the same amount (0.1 by default)', () => {
    const scaleOf = (namedEffect = {}) => Rubber.style(options(namedEffect))[1].custom;
    expect(scaleOf()).toMatchObject({
      '--motion-scale-scale-x': 0.9,
      '--motion-scale-scale-y': 1.1,
    });
    expect(scaleOf({ stretch: -0.2 })).toMatchObject({
      '--motion-scale-scale-x': 1.2,
      '--motion-scale-scale-y': 0.8,
    });
  });

  test('a linear damped wobble that squashes first', () => {
    const [, { easing }] = Rubber.style(options({}, { easing: 'sineIn' }));
    expect(progressAt(easing!, 45)).toBeCloseTo(2, 4);
    expect(progressAt(easing!, 56)).toBeCloseTo(0.1, 4);
    expect(progressAt(easing!, 89)).toBeCloseTo(1.5275, 4);
    expect(progressAt(easing!, 100)).toBe(1);
  });

  test('iterationDelay holds the rest state after the wobble', () => {
    const [, rubber] = Rubber.style(options({ iterationDelay: 1000 }));
    expect(rubber.duration).toBe(2000);
    expect(progressAt(rubber.easing!, 50)).toBe(1);
    expect(progressAt(rubber.easing!, 75)).toBe(1);
  });
});
