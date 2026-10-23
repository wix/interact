import { describe, expect, test } from 'vitest';

import { getScrollParallax } from '../utils';
import type { EffectScrollRange, RangeOffset } from '../types';

type Geometry = { viewport: number; height: number };

function toPx(css: string, { viewport, height }: Geometry) {
  const units: Record<string, number> = { '%': height / 100, vh: viewport / 100, px: 1 };
  return [...css.matchAll(/(-?\d*\.?\d+(?:e[+-]?\d+)?)(%|vh|px)/g)].reduce(
    (sum, [, value, unit]) => sum + Number(value) * units[unit],
    0,
  );
}

// scroll positions from the start of cover, per the CSS spec for an element smaller than the viewport
function getNamedRange(name: RangeOffset['name'] = 'cover', { viewport, height }: Geometry) {
  return {
    cover: [0, viewport + height],
    entry: [0, height],
    'entry-crossing': [0, height],
    contain: [height, viewport],
    exit: [viewport, viewport + height],
    'exit-crossing': [viewport, viewport + height],
  }[name];
}

function resolveOffset(
  { name, offset = { value: 0, unit: 'percentage' } }: RangeOffset,
  add: string | undefined,
  isEnd: boolean,
  geometry: Geometry,
) {
  const [start, end] = getNamedRange(name, geometry);
  const position =
    offset.unit === 'percentage'
      ? start + (offset.value / 100) * (end - start)
      : (isEnd ? end : start) + toPx(`${offset.value}${offset.unit}`, geometry);
  return position + toPx(add || '0px', geometry);
}

function simulate(
  range: EffectScrollRange,
  offsets: { startOffset: RangeOffset; endOffset: RangeOffset },
  speed: number,
  center: number | undefined,
  geometry: Geometry,
) {
  const parallax = getScrollParallax(range, offsets, speed, center);
  const animationOffsets = { ...offsets, ...parallax };
  const start = resolveOffset(
    animationOffsets.startOffset,
    animationOffsets.startOffsetAdd,
    false,
    geometry,
  );
  const end = resolveOffset(
    animationOffsets.endOffset,
    animationOffsets.endOffsetAdd,
    true,
    geometry,
  );
  const from = toPx(parallax.from, geometry);
  const to = toPx(parallax.to, geometry);

  const translateAt = (scroll: number) => {
    const progress = Math.min(1, Math.max(0, (scroll - start) / (end - start)));
    return from + (to - from) * progress;
  };
  const screenTopAt = (scroll: number) => geometry.viewport - scroll + translateAt(scroll);

  return { start, end, translateAt, screenTopAt };
}

const cover = (value: number): RangeOffset => ({
  name: 'cover',
  offset: { value, unit: 'percentage' },
});

const RANGES: [string, EffectScrollRange, { startOffset: RangeOffset; endOffset: RangeOffset }][] =
  [
    ['in over cover 0% - 50%', 'in', { startOffset: cover(0), endOffset: cover(50) }],
    ['out over cover 50% - 100%', 'out', { startOffset: cover(50), endOffset: cover(100) }],
    ['continuous over cover', 'continuous', { startOffset: cover(0), endOffset: cover(100) }],
    [
      'continuous over contain',
      'continuous',
      {
        startOffset: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
        endOffset: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
      },
    ],
    [
      'in over entry 20% - contain 50%',
      'in',
      {
        startOffset: { name: 'entry', offset: { value: 20, unit: 'percentage' } },
        endOffset: { name: 'contain', offset: { value: 50, unit: 'percentage' } },
      },
    ],
    [
      'continuous over cover 100px - exit -10vh',
      'continuous',
      {
        startOffset: { name: 'cover', offset: { value: 100, unit: 'px' } },
        endOffset: { name: 'exit', offset: { value: -10, unit: 'vh' } },
      },
    ],
  ];

const GEOMETRIES: Geometry[] = [
  { viewport: 800, height: 100 },
  { viewport: 800, height: 600 },
  { viewport: 1000, height: 260 },
];

describe('getScrollParallax', () => {
  describe.each(RANGES)('%s', (_, range, offsets) => {
    describe.each(GEOMETRIES)('viewport $viewport, element $height', (geometry) => {
      test.each([0.25, 0.5, 0.7159, 2, 3])('moves at speed %s', (speed) => {
        const { start, end, screenTopAt } = simulate(range, offsets, speed, undefined, geometry);
        const [s1, s2] = [start + (end - start) * 0.2, start + (end - start) * 0.9];

        expect(-(screenTopAt(s2) - screenTopAt(s1)) / (s2 - s1)).toBeCloseTo(speed, 10);
      });

      test.each([0, 0.3, 0.5, 1])('is at rest at center %s', (center) => {
        const { translateAt } = simulate(range, offsets, 0.5, center, geometry);
        const start = resolveOffset(offsets.startOffset, undefined, false, geometry);
        const end = resolveOffset(offsets.endOffset, undefined, true, geometry);

        expect(translateAt(start + center * (end - start))).toBeCloseTo(0, 10);
      });
    });
  });

  test.each([
    ['in', 1],
    ['out', 0],
    ['continuous', 0.5],
  ] as const)('defaults the center of %s to %s', (range, center) => {
    const geometry = GEOMETRIES[0];
    const offsets = { startOffset: cover(0), endOffset: cover(100) };
    const { translateAt } = simulate(range, offsets, 0.5, undefined, geometry);

    expect(translateAt(center * (geometry.viewport + geometry.height))).toBeCloseTo(0, 10);
  });

  test('keeps the scroll range at speed 1', () => {
    expect(getScrollParallax('in', { startOffset: cover(0), endOffset: cover(50) }, 1)).toEqual({
      from: '0px',
      to: '0px',
      startOffsetAdd: '0px',
      endOffsetAdd: '0px',
    });
  });

  test('keeps the element nearly in place at speed 0', () => {
    const geometry = GEOMETRIES[0];
    const { start, end, screenTopAt } = simulate(
      'continuous',
      { startOffset: cover(0), endOffset: cover(100) },
      0,
      undefined,
      geometry,
    );

    expect((screenTopAt(start) - screenTopAt(end)) / (end - start)).toBeCloseTo(0.01, 10);
  });

  test('defaults the scroll range to cover', () => {
    expect(getScrollParallax('continuous', {}, 0.5)).toEqual(
      getScrollParallax('continuous', { startOffset: cover(0), endOffset: cover(100) }, 0.5),
    );
  });
});
