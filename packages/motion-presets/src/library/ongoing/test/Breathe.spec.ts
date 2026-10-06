import { describe, expect, test } from 'vitest';

import * as Breathe from '../Breathe';
import type { TimeAnimationOptions } from '../../../types';
import { progressAt } from './testUtils';

const options = (namedEffect = {}) =>
  ({ duration: 1000, namedEffect: { type: 'Breathe', ...namedEffect } }) as TimeAnimationOptions;

describe('Breathe', () => {
  test('moves 25px along the vertical axis by default, then the layout rotation', () => {
    const [breathe, rotation] = Breathe.style(options());
    expect(breathe.name).toBe('motion-trans-rot');
    expect(breathe.custom).toMatchObject({
      '--motion-trans-rot-travel': '25px',
      '--motion-trans-rot-direction': '90deg',
      '--motion-trans-rot-from': -1,
    });
    expect(rotation.composite).toBe('add');
  });

  test('horizontal moves along the x-axis', () => {
    const [breathe] = Breathe.style(options({ direction: 'horizontal', travel: 40 }));
    expect(breathe.custom).toMatchObject({
      '--motion-trans-rot-travel': '40px',
      '--motion-trans-rot-direction': '0deg',
    });
  });

  test('center moves along the z-axis with perspective', () => {
    const [breathe] = Breathe.style(options({ direction: 'center', perspective: 500 }));
    expect(breathe.name).toBe('motion-3d-transform');
    expect(breathe.custom).toMatchObject({
      '--motion-transform-3d-travel-z': '25px',
      '--motion-transform-3d-perspective': '500px',
    });
    expect(Breathe.getNames(options({ direction: 'center' }))[0]).toBe('motion-3d-transform');
  });

  test('first moves towards the positive side of the axis', () => {
    const [{ easing }] = Breathe.style(options());
    // the keyframes start at -travel, so progress 2 is +travel
    expect(progressAt(easing!, 10)).toBeCloseTo(2, 3);
    expect(progressAt(easing!, 30.2)).toBeCloseTo(0, 3);
    expect(progressAt(easing!, 100)).toBe(1);
  });
});
