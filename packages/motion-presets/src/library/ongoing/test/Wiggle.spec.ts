import { describe, expect, test } from 'vitest';

import * as Wiggle from '../Wiggle';
import type { TimeAnimationOptions } from '../../../types';
import { progressAt } from './testUtils';

const options = (namedEffect = {}, rest: Partial<TimeAnimationOptions> = {}) =>
  ({
    duration: 1000,
    namedEffect: { type: 'Wiggle', ...namedEffect },
    ...rest,
  }) as TimeAnimationOptions;

describe('Wiggle', () => {
  test('layout rotation, then the wiggle rotation, then the lift along the tilted axes', () => {
    const [rotation, wiggle, lift] = Wiggle.style(options());
    expect(rotation.composite).toBe('replace');
    expect(wiggle.name).toBe('motion-3d-transform');
    expect(wiggle.composite).toBe('add');
    expect(lift.name).toBe('motion-trans-rot');
    expect(lift.composite).toBe('add');
  });

  test('rotates only around z, first to the positive angle (25deg by default)', () => {
    const angleOf = (namedEffect = {}) => {
      const { custom } = Wiggle.style(options(namedEffect))[1];
      expect(custom).toMatchObject({
        '--motion-transform-3d-angle-x': '0deg',
        '--motion-transform-3d-angle-y': '0deg',
        '--motion-transform-3d-travel-z': '0px',
      });
      return (
        (custom['--motion-transform-3d-from'] as number) *
        parseFloat(custom['--motion-transform-3d-angle-z'] as string)
      );
    };
    expect(angleOf()).toBe(25);
    expect(angleOf({ angle: 10 })).toBe(10);
  });

  test('lifts up without rotating (25px by default)', () => {
    const { custom } = Wiggle.style(options({ travel: '40px' }))[2];
    expect(custom).toMatchObject({
      '--motion-trans-rot-angle': '0deg',
      '--motion-trans-rot-direction': '90deg',
      '--motion-trans-rot-from': -1,
      '--motion-trans-rot-travel': '40px',
    });
    expect(Wiggle.style(options())[2].custom['--motion-trans-rot-travel']).toBe('25px');
  });

  test('the rotation wobbles while the lift is a single bump, both linear', () => {
    const [, wiggle, lift] = Wiggle.style(options({}, { easing: 'sineIn' }));
    expect(progressAt(wiggle.easing!, 18)).toBeCloseTo(0, 4);
    expect(progressAt(wiggle.easing!, 35)).toBeCloseTo(1.8, 4);
    expect(progressAt(wiggle.easing!, 73)).toBeCloseTo(1.4, 4);
    expect(progressAt(lift.easing!, 18)).toBeCloseTo(0, 4);
    expect(progressAt(lift.easing!, 35)).toBe(1);
    expect(progressAt(lift.easing!, 60)).toBe(1);
  });
});
