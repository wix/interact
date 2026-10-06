import { describe, expect, test } from 'vitest';

import * as Pulse from '../Pulse';
import type { TimeAnimationOptions } from '../../../types';
import { progressAt } from './testUtils';

const options = (namedEffect = {}) =>
  ({ duration: 1000, namedEffect: { type: 'Pulse', ...namedEffect } }) as TimeAnimationOptions;

describe('Pulse', () => {
  test('layout rotation replaces, the scale is added on top', () => {
    const [rotation, scale] = Pulse.style(options());
    expect(rotation.composite).toBe('replace');
    expect(scale.composite).toBe('add');
  });

  test('scales to 0.93 by default', () => {
    const [, scale] = Pulse.style(options());
    expect(scale.custom).toMatchObject({
      '--motion-scale-scale-x': 0.93,
      '--motion-scale-scale-y': 0.93,
    });
    expect(Pulse.style(options({ scale: 0.8 }))[1].custom).toMatchObject({
      '--motion-scale-scale-x': 0.8,
    });
  });

  test('beats lightly (4/7 of the scale) and then fully, starting and ending at rest', () => {
    const [, { easing }] = Pulse.style(options());
    expect(progressAt(easing!, 0)).toBe(1);
    expect(progressAt(easing!, 27)).toBeCloseTo(3 / 7, 3);
    expect(progressAt(easing!, 45)).toBe(1);
    expect(progressAt(easing!, 72)).toBe(0);
    expect(progressAt(easing!, 100)).toBe(1);
  });
});
