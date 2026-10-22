import { describe, expect, test } from 'vitest';
import * as ShrinkScroll from '../ShrinkScroll';
import { byName, scrollOptions } from './testUtils';

const scaleOf = (range?: string, scale?: number) =>
  byName(
    ShrinkScroll.style(scrollOptions({ type: 'ShrinkScroll', range, scale }), true),
    'motion-scale',
  ).custom!;

describe('ShrinkScroll', () => {
  test('keeps the scale above 1 for in and below 1 otherwise', () => {
    expect(scaleOf('in', 0.5)['--motion-scale-scale-y']).toBe(2);
    expect(scaleOf('in', 1.2)['--motion-scale-scale-y']).toBe(1.2);
    expect(scaleOf('out', 2)['--motion-scale-scale-y']).toBe(0.5);
    expect(scaleOf('continuous', 0.8)['--motion-scale-scale-y']).toBe(0.8);
  });
});
