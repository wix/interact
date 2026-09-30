import { describe, expect, test } from 'vitest';

import type { MotionRange } from '../presetUtils';
import {
  MOTION_3D_TRANSFORM_NAME,
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotion3dTransform,
  getMotionLayoutRotation,
  getMotionScale,
  getMotionTransRot,
  useLayoutRotation,
} from '../transformUtils';

const RANGES: Record<string, MotionRange> = {
  inHorizontal: { fromSign: -1, toSign: 0, movementAngle: '0deg', vertical: false },
  inVertical: { fromSign: 1, toSign: 0, movementAngle: '90deg', vertical: true },
  continuous: { fromSign: -1, toSign: 1, movementAngle: '0deg', vertical: false },
  angle: { fromSign: -1, toSign: 0, movementAngle: '45deg', vertical: false },
};

const COVER = {
  startOffset: { name: 'cover' as const, offset: { value: 0, unit: 'percentage' as const } },
  endOffset: { name: 'cover' as const, offset: { value: 100, unit: 'percentage' as const } },
};

const transforms = (data: { keyframes: any[] }) => data.keyframes.map((k) => k.transform);

describe('getMotionTransRot', () => {
  const params = { angle: 90, travel: '100px', skew: { x: 10 } };

  for (const [key, range] of Object.entries(RANGES)) {
    for (const asWeb of [false, true]) {
      test(`${key} asWeb=${asWeb}`, () => {
        expect(getMotionTransRot({ ...range }, params, asWeb, '-s')).toMatchSnapshot();
      });
    }
  }

  test('name with suffix', () => {
    expect(getMotionTransRot(RANGES.inHorizontal, {}, false, '-s').name).toBe(
      `${MOTION_TRANS_ROT_NAME}-s`,
    );
  });

  test('resolved values move from the signed travel and angle to rest', () => {
    const [from, to] = transforms(getMotionTransRot(RANGES.inHorizontal, params, true));
    expect(from).toContain('translate(calc(-1 * cos(0deg) * 100px)');
    expect(from).toContain('rotate(calc(-1 * 90deg))');
    expect(to).toContain('translate(calc(0 * cos(0deg) * 100px)');
  });

  test('toTravel is used for the end keyframe and defaults to travel', () => {
    const range = RANGES.continuous;
    expect(
      getMotionTransRot(range, { travel: '10px', toTravel: '20px' }, true).custom,
    ).toMatchObject({
      '--motion-trans-rot-travel': '10px',
      '--motion-trans-rot-to-travel': '20px',
    });
    expect(
      getMotionTransRot(range, { travel: '10px' }, true).custom['--motion-trans-rot-to-travel'],
    ).toBe('10px');
  });

  test('transform origin conjugation wraps every keyframe', () => {
    for (const transform of transforms(
      getMotionTransRot(RANGES.inHorizontal, { angle: 10, transformOrigin: { y: '-50%' } }, true),
    )) {
      expect(transform.startsWith('translate3d(0px, -50%, 0px)')).toBe(true);
      expect(
        transform.endsWith('translate3d(calc(-1 * 0px), calc(-1 * -50%), calc(-1 * 0px))'),
      ).toBe(true);
    }
  });

  test('parallax adds range offsets and parallax custom properties', () => {
    const data = getMotionTransRot(
      { ...RANGES.inVertical },
      { parallax: { range: COVER, speed: 0.5, center: 0.5 } },
      false,
    ) as any;
    expect(data).toMatchSnapshot();
    expect(data.startOffset).toBeDefined();
    expect(data.endOffset).toBeDefined();
    expect(data.custom).toHaveProperty('--motion-trans-rot-parallax-inv-speed', 2);
    expect(data.custom).toHaveProperty('--motion-trans-rot-parallax-from');
    expect(data.custom).toHaveProperty('--motion-trans-rot-parallax-to');
  });

  test('no parallax - no range offsets', () => {
    const data = getMotionTransRot(RANGES.inVertical, {}, false) as any;
    expect(data.startOffset).toBeUndefined();
    expect(data.custom).not.toHaveProperty('--motion-trans-rot-parallax-from');
  });
});

describe('getMotionScale', () => {
  for (const asWeb of [false, true]) {
    test(`asWeb=${asWeb}`, () => {
      expect(
        getMotionScale(
          RANGES.inHorizontal,
          { scale: { x: 0.5, y: 2 }, transformOrigin: { x: '50%' } },
          asWeb,
          '-s',
        ),
      ).toMatchSnapshot();
    });
  }

  test('added on top of other layers, uniform number scale, ends at identity', () => {
    const data = getMotionScale(RANGES.inHorizontal, { scale: 0.3 }, true, '-s');
    expect(data.name).toBe(`${MOTION_SCALE_NAME}-s`);
    expect(data.composite).toBe('add');
    const [from, to] = transforms(data);
    expect(from).toContain('scale(0.3, 0.3)');
    expect(to).toContain('scale(1, 1)');
  });
});

describe('getMotion3dTransform', () => {
  const params = { angle: 30, perspective: 800, depth: '100px', travel: '50px' };

  for (const [key, range] of Object.entries(RANGES)) {
    for (const asWeb of [false, true]) {
      test(`${key} asWeb=${asWeb}`, () => {
        expect(getMotion3dTransform({ ...range }, params, asWeb, '-s')).toMatchSnapshot();
      });
    }
  }

  test('name with suffix and perspective first', () => {
    const data = getMotion3dTransform(RANGES.inHorizontal, params, true, '-s');
    expect(data.name).toBe(`${MOTION_3D_TRANSFORM_NAME}-s`);
    transforms(data).forEach((t: string) => expect(t.startsWith('perspective(800px)')).toBe(true));
  });

  test('number angle rotates around x (negated) when vertical, around y otherwise', () => {
    expect(
      getMotion3dTransform(RANGES.inVertical, { angle: 30, perspective: 800 }, true).custom,
    ).toMatchObject({
      '--motion-transform-3d-angle-x': '-30deg',
      '--motion-transform-3d-angle-y': '0deg',
    });
    expect(
      getMotion3dTransform(RANGES.inHorizontal, { angle: 30, perspective: 800 }, true).custom,
    ).toMatchObject({
      '--motion-transform-3d-angle-x': '0deg',
      '--motion-transform-3d-angle-y': '30deg',
    });
  });

  test('string travel moves along z, object travel per axis', () => {
    expect(
      getMotion3dTransform(RANGES.inVertical, { travel: '40px', perspective: 800 }, true).custom,
    ).toMatchObject({
      '--motion-transform-3d-travel-x': '0px',
      '--motion-transform-3d-travel-z': '40px',
    });
    expect(
      getMotion3dTransform(RANGES.inVertical, { travel: { x: '10px' }, perspective: 800 }, true)
        .custom,
    ).toMatchObject({
      '--motion-transform-3d-travel-x': '10px',
      '--motion-transform-3d-travel-z': '0px',
    });
  });

  test('depth moves the origin backwards on z', () => {
    const [from] = transforms(
      getMotion3dTransform(RANGES.inVertical, { depth: '100px', perspective: 800 }, true),
    );
    expect(from).toContain('translate3d(0px, 0px, -100px)');
  });
});

describe('layout rotation', () => {
  test('constant --motion-rotate on both keyframes', () => {
    const data = getMotionLayoutRotation({}, true, '-s');
    expect(data).toMatchSnapshot();
    expect(data.name).toBe(`${MOTION_LAYOUT_ROTATION_NAME}-s`);
    expect(data.keyframes).toEqual([
      { transform: 'rotate(var(--motion-rotate, 0deg))' },
      { transform: 'rotate(var(--motion-rotate, 0deg))' },
    ]);
  });

  test('useLayoutRotation composites add by default, or as given', () => {
    const options = { namedEffect: { type: 'X' }, duration: 100 } as any;
    expect(useLayoutRotation(options, 'entrance').composite).toBe('add');
    expect(useLayoutRotation(options, 'entrance', { composite: 'replace' }).composite).toBe(
      'replace',
    );
  });

  test('useLayoutRotation keeps the scroll range of its default range', () => {
    const options = { namedEffect: { type: 'X' } } as any;
    expect(
      useLayoutRotation(structuredClone(options), 'scroll', { defaultRange: 'out' }),
    ).toMatchSnapshot();
  });
});
