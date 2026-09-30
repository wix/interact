import { describe, expect, test } from 'vitest';

import type { MotionRange } from '../presetUtils';
import {
  MOTION_REVEAL_NAME,
  MOTION_SHAPE_NAME,
  MOTION_SHUTTERS_NAME,
  MOTION_WINK_NAME,
  getMotionReveal,
  getMotionShape,
  getMotionShutters,
  getMotionWink,
} from '../clipUtils';
import { SHAPES } from '../consts';
import { getEasing } from '../utils';

const RANGES: Record<string, MotionRange> = {
  inHorizontal: { fromSign: -1, toSign: 0, movementAngle: '0deg', vertical: false },
  inVertical: { fromSign: 1, toSign: 0, movementAngle: '90deg', vertical: true },
  continuous: { fromSign: -1, toSign: 1, movementAngle: '0deg', vertical: false },
};

describe('getMotionReveal', () => {
  for (const [key, range] of Object.entries(RANGES)) {
    for (const asWeb of [false, true]) {
      test(`${key} asWeb=${asWeb}`, () => {
        expect(getMotionReveal({ ...range }, { minimum: 0.2 }, asWeb, '-s')).toMatchSnapshot();
      });
    }
  }

  test('name and signed offsets scaled by 1 - minimum', () => {
    const data = getMotionReveal({ ...RANGES.continuous }, { minimum: 0.2 }, true, '-s');
    expect(data.name).toBe(`${MOTION_REVEAL_NAME}-s`);
    expect(data.custom).toMatchObject({
      '--motion-reveal-s-from': -0.8,
      '--motion-reveal-s-to': 0.8,
    });
  });
});

describe('getMotionWink', () => {
  for (const [key, range] of Object.entries(RANGES)) {
    for (const asWeb of [false, true]) {
      test(`${key} asWeb=${asWeb}`, () => {
        expect(getMotionWink({ ...range }, {}, asWeb, '-s')).toMatchSnapshot();
      });
    }
  }

  test('ends fully revealed', () => {
    const data = getMotionWink(RANGES.inVertical, {}, true, '-s');
    expect(data.name).toBe(`${MOTION_WINK_NAME}-s`);
    expect(data.keyframes[1].clipPath).toBe(
      'border-box polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    );
  });
});

describe('getMotionShape', () => {
  for (const shape of SHAPES) {
    for (const asWeb of [false, true]) {
      test(`${shape} asWeb=${asWeb}`, () => {
        expect(getMotionShape({ shape, minimum: 0.1 }, asWeb, '-s')).toMatchSnapshot();
      });
    }
  }

  test('only the selected shape is set, the others are space-toggled off', () => {
    const data = getMotionShape({ shape: 'circle' }, false, '-s');
    expect(data.name).toBe(`${MOTION_SHAPE_NAME}-s`);
    SHAPES.filter((s) => s !== 'circle').forEach((s) => {
      expect(data.custom[`--motion-shape-s-${s}-start`]).toBe('initial');
      expect(data.custom[`--motion-shape-s-${s}-end`]).toBe('initial');
    });
    expect(data.custom['--motion-shape-s-circle-end']).toBe('border-box circle(75%)');
  });

  test('web keyframes resolve to the selected shape', () => {
    const data = getMotionShape({ shape: 'rectangle' }, true);
    expect(data.keyframes[1].clipPath).toBe('border-box inset(0%)');
  });
});

describe('getMotionShutters', () => {
  const cases = {
    in: { range: RANGES.inHorizontal, staggered: false },
    inVertical: { range: RANGES.inVertical, staggered: false },
    staggered: { range: RANGES.inHorizontal, staggered: true },
    continuous: { range: RANGES.continuous, staggered: false },
    staggeredContinuous: { range: RANGES.continuous, staggered: true },
  };

  for (const [key, { range, staggered }] of Object.entries(cases)) {
    for (const asWeb of [false, true]) {
      test(`${key} asWeb=${asWeb}`, () => {
        expect(
          getMotionShutters({ ...range }, { shutters: 3, staggered }, asWeb, '-s'),
        ).toMatchSnapshot();
      });
    }
  }

  test('name includes the shutter count', () => {
    expect(
      getMotionShutters({ ...RANGES.inHorizontal }, { shutters: 4, staggered: false }, true, '-s')
        .name,
    ).toBe(`${MOTION_SHUTTERS_NAME}-s-4`);
  });

  test('continuous uses evenodd fill, in uses nonzero', () => {
    const fill = (range: MotionRange) =>
      getMotionShutters({ ...range }, { shutters: 3, staggered: false }, true).custom![
        '--motion-shutters-fill'
      ];
    expect(fill(RANGES.continuous)).toBe('evenodd');
    expect(fill(RANGES.inHorizontal)).toBe('nonzero');
  });

  test('staggered continuous holds the revealed state in the middle with 4 keyframes', () => {
    const data = getMotionShutters(
      { ...RANGES.continuous },
      { shutters: 3, staggered: true },
      true,
    );
    expect(data.name).toBe(`${MOTION_SHUTTERS_NAME}-3-cont-stagger`);
    expect(data.custom!['--motion-shutters-fill']).toBe('nonzero');
    expect(data.keyframes.map((k: any) => k.offset)).toEqual([0, 0.45, 0.55, 1]);
    const sineOut = getEasing('sineOut');
    expect(data.keyframes.map((k: any) => k.easing)).toEqual([
      sineOut,
      'linear',
      sineOut,
      undefined,
    ]);
    expect(data.keyframes[3].clipPath).toBe(data.keyframes[0].clipPath);
  });

  test('no shutters - no keyframes', () => {
    expect(
      getMotionShutters({ ...RANGES.inHorizontal }, { shutters: 0, staggered: false }),
    ).toEqual({ keyframes: [] });
  });
});
