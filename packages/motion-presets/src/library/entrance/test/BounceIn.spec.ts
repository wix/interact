import { describe, expect, test } from 'vitest';
import * as BounceIn from '../BounceIn';
import { layer, run } from './testUtils';

describe('BounceIn', () => {
  test('bounces along the side axis with the bounce easing', () => {
    const out = run(BounceIn, { from: 'left' });
    const motion = layer(out, 'motion-trans-rot');
    expect(motion.custom['--motion-trans-rot-travel']).toBe('50px');
    expect(motion.custom['--motion-trans-rot-direction']).toBe('0deg');
    expect(motion.easing).toMatch(/^linear\(/);
    expect(layer(out, 'motion-layout-rotation').easing).toBe(motion.easing);
  });

  test("'back' bounces along the z-axis from behind the element", () => {
    const out = run(BounceIn, { from: 'back', travel: '80px' });
    const motion = layer(out, 'motion-3d-transform');
    expect(motion.custom['--motion-transform-3d-travel-z']).toBe('80px');
    expect(motion.custom['--motion-transform-3d-from']).toBe(-1);
    expect(out.map((a) => a.name)).not.toContain('motion-trans-rot');
  });

  test('fade is shorter than the bounce', () => {
    expect(layer(run(BounceIn), 'motion-fade').duration).toBe(540);
  });
});
