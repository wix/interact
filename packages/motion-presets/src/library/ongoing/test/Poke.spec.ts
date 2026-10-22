import { describe, expect, test } from 'vitest';

import * as Poke from '../Poke';
import type { TimeAnimationOptions } from '../../../types';
import { progressAt } from './testUtils';

const options = (namedEffect = {}) =>
  ({ duration: 1000, namedEffect: { type: 'Poke', ...namedEffect } }) as TimeAnimationOptions;

describe('Poke', () => {
  test('pokes 62.5px to the right by default, then the layout rotation', () => {
    const [poke, rotation] = Poke.style(options());
    expect(poke.custom).toMatchObject({
      '--motion-trans-rot-travel': '62.5px',
      '--motion-trans-rot-direction': '0deg',
      '--motion-trans-rot-from': 1,
    });
    expect(rotation.composite).toBe('add');
  });

  test('peaks towards the direction', () => {
    const [poke] = Poke.style(options({ direction: 'top', travel: '10px' }));
    expect(poke.custom).toMatchObject({
      '--motion-trans-rot-travel': '10px',
      '--motion-trans-rot-direction': '90deg',
      '--motion-trans-rot-from': -1,
    });
  });

  test('two linear pokes', () => {
    const [{ easing }] = Poke.style(options());
    expect(progressAt(easing!, 17)).toBeCloseTo(0.72, 4);
    expect(progressAt(easing!, 32)).toBe(0);
    expect(progressAt(easing!, 48)).toBeCloseTo(0.68, 4);
    expect(progressAt(easing!, 66)).toBe(0);
    expect(progressAt(easing!, 100)).toBe(1);
  });
});
