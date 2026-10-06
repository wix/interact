import { describe, expect, test } from 'vitest';
import * as GrowScroll from '../GrowScroll';
import { byName, scrollOptions } from './testUtils';

const scaleOf = (range?: string, scale?: number) =>
  byName(
    GrowScroll.style(scrollOptions({ type: 'GrowScroll', range, scale }), true),
    'motion-scale',
  ).custom!;

describe('GrowScroll', () => {
  test('keeps the scale below 1 for in and above 1 otherwise', () => {
    expect(scaleOf('in', 4)['--motion-scale-scale-x']).toBe(0.25);
    expect(scaleOf('in', 0.5)['--motion-scale-scale-x']).toBe(0.5);
    expect(scaleOf('out', 0.25)['--motion-scale-scale-x']).toBe(4);
    expect(scaleOf('continuous', 2)['--motion-scale-scale-x']).toBe(2);
  });

  test('scales from the pivot', () => {
    const custom = byName(
      GrowScroll.style(scrollOptions({ type: 'GrowScroll', pivot: 'top-left' }), true),
      'motion-scale',
    ).custom!;
    expect(custom['--motion-scale-origin-x']).toBe('-50%');
    expect(custom['--motion-scale-origin-y']).toBe('-50%');
  });

  test('all layers span the parallax range', () => {
    const [parallax, ...rest] = GrowScroll.style(
      scrollOptions({ type: 'GrowScroll', speed: 1.5 }),
      true,
    ) as any[];
    expect(parallax.startOffsetAdd).toBeDefined();
    rest.forEach((animation) => {
      expect(animation.startOffset).toEqual(parallax.startOffset);
      expect(animation.startOffsetAdd).toEqual(parallax.startOffsetAdd);
      expect(animation.endOffsetAdd).toEqual(parallax.endOffsetAdd);
    });
  });
});
