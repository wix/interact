import { describe, expect, test } from 'vitest';
import * as SlideIn from '../SlideIn';
import { layer, run } from './testUtils';

describe('SlideIn', () => {
  test('reveals from the side opposite to the one it slides from', () => {
    const out = run(SlideIn, { from: 'left' });
    expect(layer(out, 'motion-trans-rot').custom['--motion-trans-rot-from']).toBe(-1);
    expect(layer(out, 'motion-reveal').custom['--motion-reveal-from']).toBe(1);
  });

  test('start is the minimum revealed part', () => {
    const reveal = layer(run(SlideIn, { from: 'top', start: 0.3 }), 'motion-reveal');
    expect(reveal.custom['--motion-reveal-from']).toBe(0.7);
    expect(reveal.custom['--motion-reveal-is-vertical']).toBe(1);
  });

  test('moves along the rotated axes', () => {
    const out = run(SlideIn);
    expect(out.map((a) => a.name).slice(1, 3)).toEqual([
      'motion-layout-rotation',
      'motion-trans-rot',
    ]);
    expect(layer(out, 'motion-layout-rotation').composite).toBe('replace');
    expect(layer(out, 'motion-trans-rot').composite).toBe('add');
  });
});
