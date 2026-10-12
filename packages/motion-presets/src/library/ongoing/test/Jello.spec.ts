import { describe, expect, test } from 'vitest';

import * as Jello from '../Jello';
import type { TimeAnimationOptions } from '../../../types';
import { progressAt } from './testUtils';

const options = (namedEffect = {}) =>
  ({ duration: 1000, namedEffect: { type: 'Jello', ...namedEffect } }) as TimeAnimationOptions;

describe('Jello', () => {
  test('layout rotation first, then the skew added along the rotated axes', () => {
    const [rotation, jello] = Jello.style(options());
    expect(rotation.composite).toBe('replace');
    expect(jello.composite).toBe('add');
  });

  test('first peak is the positive skew (12.25deg by default)', () => {
    const skewY = (namedEffect = {}) => {
      const custom = Jello.style(options(namedEffect))[1].custom as Record<string, string | number>;
      return (
        (custom['--motion-trans-rot-from'] as number) *
        parseFloat(custom['--motion-trans-rot-skew-y'] as string)
      );
    };
    expect(skewY()).toBe(12.25);
    expect(skewY({ skew: 7 })).toBe(7);
  });

  test('a linear damped wobble', () => {
    const [, { easing }] = Jello.style(options());
    expect(progressAt(easing!, 24)).toBe(0);
    expect(progressAt(easing!, 38)).toBeCloseTo(1 + 2 / 7, 4);
    expect(progressAt(easing!, 58)).toBeCloseTo(1 - 4 / 7, 4);
    expect(progressAt(easing!, 100)).toBe(1);
  });
});
