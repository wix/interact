import { describe, expect, test } from 'vitest';
import * as SpinIn from '../SpinIn';
import { layer, run } from './testUtils';

describe('SpinIn', () => {
  test('spins are full turns', () => {
    const out = run(SpinIn, { spins: 2 });
    expect(layer(out, 'motion-trans-rot').custom['--motion-trans-rot-angle']).toBe('720deg');
  });

  test('defaults to half a turn from scale 0', () => {
    const out = run(SpinIn);
    expect(layer(out, 'motion-trans-rot').custom['--motion-trans-rot-angle']).toBe('180deg');
    expect(layer(out, 'motion-scale').custom['--motion-scale-scale-x']).toBe(0);
  });

  test('fade duration scales with the starting scale', () => {
    expect(layer(run(SpinIn), 'motion-fade').duration).toBe(0);
    expect(layer(run(SpinIn, { scale: 0.5 }), 'motion-fade').duration).toBe(500);
    expect(layer(run(SpinIn, { scale: 2 }), 'motion-fade').duration).toBe(1000);
  });
});
