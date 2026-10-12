import { describe, expect, test } from 'vitest';
import * as WinkIn from '../WinkIn';
import { layer, run } from './testUtils';

describe('WinkIn', () => {
  test.each([
    [undefined, 0, 1, 0],
    ['horizontal', 0, 1, 0],
    ['vertical', 1, 0, 1],
  ])('%s scales along the wink axis', (direction, x, y, isVertical) => {
    const out = run(WinkIn, direction ? { direction } : {});
    const { custom } = layer(out, 'motion-scale');
    expect(custom['--motion-scale-scale-x']).toBe(x);
    expect(custom['--motion-scale-scale-y']).toBe(y);
    expect(layer(out, 'motion-wink').custom['--motion-wink-is-vertical']).toBe(isVertical);
  });

  test('the scale ends before the wink', () => {
    const out = run(WinkIn);
    expect(layer(out, 'motion-scale').duration).toBe(850);
    expect(layer(out, 'motion-wink').duration).toBe(1000);
  });
});
