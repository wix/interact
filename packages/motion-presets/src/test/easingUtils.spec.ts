import { describe, expect, test } from 'vitest';

import {
  getActiveFraction,
  getContinuousEasing,
  getLoopEasing,
  getLoopOverrides,
  getScrollEasing,
  getWrapEasing,
  linearEasing,
  mirrorEasing,
  toCssEasing,
} from '../easingUtils';

function parseLinear(easing: string) {
  const match = easing.match(/^linear\((.*)\)$/);
  if (!match) {
    throw new Error(`not a linear() easing: ${easing}`);
  }
  return match[1].split(',').map((point) => {
    const [value, percentage] = point.trim().split(/\s+/);
    return [parseFloat(value), parseFloat(percentage)] as [number, number];
  });
}

// the eased value at a given time (percentage), assuming the points are sorted by time
function valueAt(points: [number, number][], percentage: number) {
  const exact = points.filter(([, p]) => p === percentage);
  if (exact.length) {
    return exact[exact.length - 1][0];
  }
  const after = points.findIndex(([, p]) => p > percentage);
  const [v0, p0] = points[after - 1];
  const [v1, p1] = points[after];
  return v0 + ((v1 - v0) * (percentage - p0)) / (p1 - p0);
}

describe('toCssEasing', () => {
  test('maps named easings to css', () => {
    expect(toCssEasing('sineOut')).toBe('cubic-bezier(0.39, 0.575, 0.565, 1)');
  });

  test('maps css keywords to cubic-bezier', () => {
    expect(toCssEasing('ease-in')).toBe('cubic-bezier(0.42, 0, 1, 1)');
    expect(toCssEasing('ease')).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)');
  });

  test('defaults to linear and passes other css through', () => {
    expect(toCssEasing()).toBe('linear');
    expect(toCssEasing('steps(4)')).toBe('steps(4)');
  });
});

describe('linearEasing', () => {
  test('builds linear() from [value, percentage] points', () => {
    expect(
      linearEasing([
        [0, 0],
        [0.5, 20],
        [1, 100],
      ]),
    ).toBe('linear(0 0%, 0.5 20%, 1 100%)');
  });
});

describe('mirrorEasing', () => {
  test('linear stays linear', () => {
    expect(mirrorEasing()).toBe('linear');
    expect(mirrorEasing('linear')).toBe('linear');
  });

  test('mirrors cubic-bezier exactly', () => {
    expect(mirrorEasing('cubic-bezier(0.1, 0.2, 0.3, 0.4)')).toBe(
      'cubic-bezier(0.7, 0.6, 0.9, 0.8)',
    );
    expect(mirrorEasing('ease-out')).toBe('cubic-bezier(0.42, 0, 1, 1)');
  });

  test('mirroring twice gives back the original bezier', () => {
    const css = toCssEasing('sineOut');
    expect(mirrorEasing(mirrorEasing(css))).toBe(css);
  });

  test('approximates non-bezier easings with linear()', () => {
    const points = parseLinear(mirrorEasing('linear(0 0%, 1 50%, 1 100%)'));
    expect(points[0]).toEqual([0, 0]);
    expect(points[points.length - 1]).toEqual([1, 100]);
    // mirrored: the original holds 1 over its second half, so the mirror holds 0 over its first half
    expect(valueAt(points, 25)).toBeCloseTo(0, 2);
    expect(valueAt(points, 75)).toBeCloseTo(0.5, 1);
  });
});

describe('getContinuousEasing', () => {
  test('directional linear without hold is plain linear', () => {
    expect(getContinuousEasing(undefined, undefined, true)).toBe('linear');
    expect(getContinuousEasing('linear', 'linear', true)).toBe('linear');
  });

  test('directional eased motion passes through rest (0.5) in the middle', () => {
    const points = parseLinear(getContinuousEasing('sineOut', undefined, true));
    expect(points[0]).toEqual([0, 0]);
    expect(valueAt(points, 50)).toBeCloseTo(0.5, 3);
    expect(points[points.length - 1]).toEqual([1, 100]);
  });

  test('directional out-half defaults to the in-motion reversed (point symmetric)', () => {
    const points = parseLinear(getContinuousEasing('sineOut', undefined, true));
    [10, 20, 40].forEach((p) => {
      expect(valueAt(points, p) + valueAt(points, 100 - p)).toBeCloseTo(1, 2);
    });
  });

  test('non-directional goes to the end and back', () => {
    const points = parseLinear(getContinuousEasing(undefined, undefined, false));
    expect(points).toEqual([
      [0, 0],
      [1, 50],
      [1, 50],
      [0, 100],
    ]);
  });

  test('hold keeps rest in the middle of the range', () => {
    const directional = parseLinear(getContinuousEasing('linear', undefined, true, 0.2));
    expect(valueAt(directional, 45)).toBeCloseTo(0.5, 3);
    expect(valueAt(directional, 55)).toBeCloseTo(0.5, 3);
    expect(valueAt(directional, 20)).toBeCloseTo(0.25, 3);

    const nonDirectional = parseLinear(getContinuousEasing('linear', undefined, false, 0.2));
    expect(valueAt(nonDirectional, 40)).toBe(1);
    expect(valueAt(nonDirectional, 60)).toBe(1);
    expect(nonDirectional[nonDirectional.length - 1]).toEqual([0, 100]);
  });

  test('custom outEasing is used for the second half', () => {
    const points = parseLinear(getContinuousEasing('linear', 'sineOut', true));
    // linear in-half
    expect(valueAt(points, 25)).toBeCloseTo(0.25, 3);
    // sineOut out-half: 0.5 + sineOut(0.5) / 2
    expect(valueAt(points, 75)).toBeCloseTo(0.5 + Math.sin(Math.PI / 4) / 2, 1);
  });
});

describe('getActiveFraction', () => {
  test('is 1 without an iteration delay', () => {
    expect(getActiveFraction({ duration: 1000, namedEffect: { type: 'Spin' } } as any)).toBe(1);
  });

  test('is the duration part of duration + iterationDelay', () => {
    expect(
      getActiveFraction({
        duration: 1000,
        namedEffect: { type: 'Spin', iterationDelay: 1000 },
      } as any),
    ).toBe(0.5);
  });
});

describe('getWrapEasing', () => {
  test('moves from rest to 0, wraps to 1 and returns to rest', () => {
    expect(parseLinear(getWrapEasing(0.25))).toEqual([
      [0.25, 0],
      [0, 25],
      [1, 25],
      [0.25, 100],
    ]);
  });

  test('scales times by the active fraction and holds rest after it', () => {
    expect(parseLinear(getWrapEasing(0.5, 0.5))).toEqual([
      [0.5, 0],
      [0, 25],
      [1, 25],
      [0.5, 50],
      [0.5, 100],
    ]);
  });

  test('no trailing hold for a full active fraction', () => {
    expect(getWrapEasing(0.5, 1)).toBe('linear(0.5 0%, 0 50%, 1 50%, 0.5 100%)');
  });
});

describe('getLoopEasing', () => {
  const shape: [number, number][] = [
    [0, 0],
    [1, 0.5],
    [0, 1],
  ];

  test('progress is 1 - value at the shape points', () => {
    expect(parseLinear(getLoopEasing({ shape }))).toEqual([
      [1, 0],
      [0, 50],
      [0, 50],
      [1, 100],
    ]);
  });

  test('negative values extrapolate beyond the keyframes', () => {
    const points = parseLinear(
      getLoopEasing({
        shape: [
          [0, 0],
          [-1, 0.5],
          [0, 1],
        ],
      }),
    );
    expect(valueAt(points, 50)).toBe(2);
  });

  test('linear shapes use a single sample per segment', () => {
    expect(parseLinear(getLoopEasing({ shape, easings: ['linear'] }))).toHaveLength(4);
  });

  test('times are scaled by the active fraction with a trailing hold at rest', () => {
    const easing = getLoopEasing({ shape }, 0.5);
    expect(easing.endsWith(', 1 100%)')).toBe(true);
    expect(parseLinear(easing)).toEqual([
      [1, 0],
      [0, 25],
      [0, 25],
      [1, 50],
      [1, 100],
    ]);
  });

  test('easings apply per segment and the last one repeats', () => {
    const points = parseLinear(
      getLoopEasing({
        shape: [
          [0, 0],
          [1, 1 / 3],
          [0, 2 / 3],
          [1, 1],
        ],
        easings: ['linear', 'sineOut'],
      }),
    );
    // first segment linear: progress 1 -> 0
    expect(valueAt(points, 100 / 6)).toBeCloseTo(0.5, 2);
    // second and third segments use sineOut: progress = ease(t), then 1 - ease(t)
    expect(valueAt(points, 50)).toBeCloseTo(Math.sin(Math.PI / 4), 1);
    expect(valueAt(points, 250 / 3)).toBeCloseTo(1 - Math.sin(Math.PI / 4), 1);
  });
});

describe('getScrollEasing', () => {
  test('in uses the preset easing, defaulting to linear', () => {
    expect(getScrollEasing('in', false, { easing: 'sineOut' })).toBe(
      'cubic-bezier(0.39, 0.575, 0.565, 1)',
    );
    expect(getScrollEasing('in', false)).toBe('linear');
  });

  test('out uses easing as is, or mirrors outEasing since it is played reversed', () => {
    expect(getScrollEasing('out', false, { easing: 'ease-in' })).toBe(
      'cubic-bezier(0.42, 0, 1, 1)',
    );
    expect(getScrollEasing('out', false, { easing: 'ease-in', outEasing: 'ease-out' })).toBe(
      'cubic-bezier(0.42, 0, 1, 1)',
    );
    expect(getScrollEasing('out', false, { outEasing: 'ease-in' })).toBe(
      'cubic-bezier(0, 0, 0.58, 1)',
    );
  });

  test('continuous: back and forth, or linear for directional linear motion', () => {
    expect(getScrollEasing('continuous', false)).toBe('linear(0 0%, 1 50%, 1 50%, 0 100%)');
    expect(getScrollEasing('continuous', true)).toBe('linear');
  });

  test('continuous: continuousEasing overrides easing and continuousHold holds in the middle', () => {
    expect(
      getScrollEasing('continuous', false, {
        easing: 'sineOut',
        continuousEasing: 'linear',
        continuousHold: 0.2,
      }),
    ).toBe('linear(0 0%, 1 40%, 1 60%, 0 100%)');
  });
});

describe('getLoopOverrides', () => {
  test('easing is linear without a loop', () => {
    expect(getLoopOverrides({ duration: 1000, namedEffect: { type: 'X' } } as any)).toEqual({
      duration: 1000,
      easing: 'linear',
    });
  });

  test('iterationDelay stretches the duration and holds rest at the end of the loop easing', () => {
    expect(
      getLoopOverrides(
        { duration: 1000, namedEffect: { type: 'X', iterationDelay: 1000 } } as any,
        {
          shape: [
            [0, 0],
            [1, 0.5],
            [0, 1],
          ],
        },
      ),
    ).toEqual({ duration: 2000, easing: 'linear(1 0%, 0 25%, 0 25%, 1 50%, 1 100%)' });
  });
});
