import { describe, expect, test } from 'vitest';
import * as TiltIn from '../TiltIn';
import { layer, run } from './testUtils';

describe('TiltIn', () => {
  test('spins towards its side while tilting in from the bottom', () => {
    const spin = (from?: string) =>
      layer(run(TiltIn, from ? { from } : {}), 'motion-trans-rot').custom[
        '--motion-trans-rot-from'
      ];
    expect(spin()).toBe(1);
    expect(spin('left')).toBe(1);
    expect(spin('right')).toBe(-1);
  });

  test('tilt, spin and reveal timing', () => {
    const out = run(TiltIn);
    const tilt = layer(out, 'motion-3d-transform');
    expect(tilt.custom['--motion-transform-3d-angle-x']).toBe('90deg');
    expect(tilt.custom['--motion-transform-3d-origin-z']).toBe('-100px');
    expect(layer(out, 'motion-trans-rot').duration).toBe(800);
    expect(layer(out, 'motion-reveal').duration).toBe(800);
    expect(layer(out, 'motion-reveal').custom['--motion-reveal-is-vertical']).toBe(1);
    expect(layer(out, 'motion-fade').duration).toBe(200);
  });

  test('the spin is added on top of the tilt', () => {
    expect(layer(run(TiltIn), 'motion-trans-rot').composite).toBe('add');
  });
});
