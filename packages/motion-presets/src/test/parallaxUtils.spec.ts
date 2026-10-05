import { describe, expect, test } from 'vitest';

import type { Parallax } from '../parallaxUtils';
import { createParallax, getScrollParallax } from '../parallaxUtils';

const cover = (value: number) => ({ name: 'cover', offset: { value, unit: 'percentage' } }) as any;

const apply = (parallax: Parallax) => {
  const custom = {};
  const rangeOffsets = parallax(custom, '--p');
  return { custom, rangeOffsets };
};

describe('getScrollParallax', () => {
  test('defaults the center by range and spans the scroll range, reversed on out', () => {
    const inRange = { startOffset: cover(0), endOffset: cover(50) };
    const outRange = { startOffset: cover(50), endOffset: cover(100) };
    const continuousRange = { startOffset: cover(0), endOffset: cover(100) };
    expect(apply(getScrollParallax('in', inRange, 2))).toEqual(
      apply(createParallax(inRange, false, 2, 1)),
    );
    expect(apply(getScrollParallax('continuous', continuousRange, 2))).toEqual(
      apply(createParallax(continuousRange, false, 2, 0.5)),
    );
    expect(apply(getScrollParallax('out', outRange, 2))).toEqual(
      apply(createParallax(outRange, true, 2, 0)),
    );
  });

  test('keeps an explicit center', () => {
    const inRange = { startOffset: cover(0), endOffset: cover(50) };
    expect(apply(getScrollParallax('in', inRange, 2, 0.3))).toEqual(
      apply(createParallax(inRange, false, 2, 0.3)),
    );
  });
});
