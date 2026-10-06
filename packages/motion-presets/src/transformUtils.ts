import type { MotionRange } from './directions';
import type { Parallax } from './parallaxUtils';
import { CSS_CALC_REGEX, declareCustom, stripCalc, toKeyframeValue } from './utils';

export const MOTION_TRANS_ROT_NAME = 'motion-trans-rot';
export const MOTION_SCALE_NAME = 'motion-scale';
export const MOTION_3D_TRANSFORM_NAME = 'motion-3d-transform';
export const MOTION_LAYOUT_ROTATION_NAME = 'motion-layout-rotation';

function invertLength(l: string) {
  return CSS_CALC_REGEX.test(l) ? `calc(-1 * ${stripCalc(l)})` : `-${l}`;
}

// wraps each transform frame with a translation conjugation to the new mapped origin
// string inputs allow using calc for parameterized origins, number inputs are in the scale of the target
// translate(origin) ...transforms... translate(-origin)
function applyTransformOrigin(
  transformFrames: string[][],
  transformOrigin: { x?: string; y?: string; z?: string },
  custom: Record<string, number | string>,
  prefix: string,
  asWeb: boolean = false,
) {
  const origin = (['x', 'y', 'z'] as const).map((axis) => {
    const value = transformOrigin[axis] ?? '0px';
    const key = `${prefix}-origin-${axis}`;
    custom[key] = value;
    return toKeyframeValue(custom, key, asWeb, '0px');
  });

  transformFrames.forEach((transform) => {
    transform.unshift(`translate3d(${origin.join(', ')})`);
    transform.push(`translate3d(${origin.map((value) => `calc(-1 * ${value})`).join(', ')})`);
  });
}

// declared anyway, so an element never reads the parallax of an ancestor running the same keyframes
function withoutParallax(custom: Record<string, number | string>, prefix: string) {
  custom[`${prefix}-parallax-from`] = '0px';
  custom[`${prefix}-parallax-to`] = '0px';
  return {};
}

// a pivot keyword as a transform origin, relative to the center
export function pivotToTransformOrigin(pivot: string) {
  return {
    x: pivot.includes('left') ? '-50%' : pivot.includes('right') ? '50%' : '0px',
    y: pivot.includes('top') ? '-50%' : pivot.includes('bottom') ? '50%' : '0px',
  };
}

// directional 2d transformation - 2d translation (with optional parallax), rotation only around z-axis and skew
// translate must be first to use the initial axes, then rotate since it keeps the plane isometric, then skew
// skew is directional like the rotation - it flips with the motion's side, e.g. leaning into a movement
// allows transform-origin to rotate centerd on a different origin
export function getMotionTransRot(
  motionRange: MotionRange,
  params: {
    angle?: number | string;
    parallax?: Parallax;
    skew?: { x?: number; y?: number };
    transformOrigin?: { x?: string; y?: string };
    travel?: string;
    // travel towards the motion's direction (the 'to' side) when it differs from the travel it comes from
    toTravel?: string;
  },
  asWeb: boolean = false,
  suffix: string = '',
) {
  const {
    angle = 0,
    parallax,
    skew = {},
    transformOrigin = {},
    travel = '0px',
    toTravel = travel,
  } = params;
  const prefix = `--motion-trans-rot${suffix}`;
  const { custom, vars } = declareCustom(
    prefix,
    {
      angle: [typeof angle === 'number' ? `${angle || 0}deg` : angle, '0deg'],
      direction: [motionRange.movementAngle, '0deg'],
      travel: [travel || '0px', '0px'],
      'to-travel': [toTravel || '0px', '0px'],
      'skew-x': [`${skew?.x || 0}deg`, '0deg'],
      'skew-y': [`${skew?.y || 0}deg`, '0deg'],
      from: [motionRange.fromSign, '-1'],
      to: [motionRange.toSign, '1'],
    },
    asWeb,
  );

  const rangeOffsets = parallax ? parallax(custom, prefix, asWeb) : withoutParallax(custom, prefix);

  const parallaxFrom = toKeyframeValue(custom, `${prefix}-parallax-from`, asWeb, '0px');
  const parallaxTo = toKeyframeValue(custom, `${prefix}-parallax-to`, asWeb, '0px');

  const transformFrames = [
    [vars.from, vars.travel, parallaxFrom],
    [vars.to, vars['to-travel'], parallaxTo],
  ].map(([sign, distance, parallaxOffset]) => [
    `translate(calc(${sign} * cos(${vars.direction}) * ${distance}), calc(${sign} * sin(${vars.direction}) * ${distance} + ${parallaxOffset}))`,
    `rotate(calc(${sign} * ${vars.angle}))`,
    `skew(calc(${sign} * ${vars['skew-x']}), calc(${sign} * ${vars['skew-y']}))`,
  ]);

  applyTransformOrigin(transformFrames, transformOrigin, custom, prefix, asWeb);

  return {
    name: `${MOTION_TRANS_ROT_NAME}${suffix}`,
    custom,
    keyframes: transformFrames.map((transform) => ({ transform: transform.join(' ') })),
    ...rangeOffsets,
  };
}

// non-directional 2d transformation - scale from the given values to identity
// added on top of another transform layer (e.g. getMotionTransRot or the layout rotation)
export function getMotionScale(
  _motionRange: MotionRange,
  params: {
    scale?: number | { x?: number; y?: number };
    transformOrigin?: { x?: string; y?: string };
  },
  asWeb: boolean = false,
  suffix: string = '',
) {
  const { scale = {}, transformOrigin = {} } = params;
  const scaleXY = typeof scale === 'number' ? { x: scale, y: scale } : scale;
  const prefix = `--motion-scale${suffix}`;
  const { custom, vars } = declareCustom(
    prefix,
    {
      'scale-x': [scaleXY?.x ?? 1, '1'],
      'scale-y': [scaleXY?.y ?? 1, '1'],
    },
    asWeb,
  );

  const transformFrames = [[`scale(${vars['scale-x']}, ${vars['scale-y']})`], ['scale(1, 1)']];

  applyTransformOrigin(transformFrames, transformOrigin, custom, prefix, asWeb);

  return {
    name: `${MOTION_SCALE_NAME}${suffix}`,
    composite: 'add' as const,
    custom,
    keyframes: transformFrames.map((transform) => ({ transform: transform.join(' ') })),
  };
}

export function getMotion3dTransform(
  motionRange: MotionRange,
  params: {
    angle?: number | { x?: number; y?: number; z?: number };
    depth?: string;
    parallax?: Parallax;
    perspective: number;
    transformOrigin?: { x?: string; y?: string };
    travel?: string | { x?: string; y?: string; z?: string };
  },
  asWeb: boolean = false,
  suffix: string = '',
) {
  const {
    angle = 0,
    depth = '0px',
    parallax,
    perspective,
    transformOrigin = {},
    travel = '0px',
  } = params;
  const angleXYZ =
    typeof angle === 'number'
      ? { x: motionRange.vertical ? -angle : 0, y: motionRange.vertical ? 0 : angle }
      : angle;
  const travelXYZ = typeof travel === 'string' ? { z: travel } : travel;

  const prefix = `--motion-transform-3d${suffix}`;
  const { custom, vars } = declareCustom(
    prefix,
    {
      perspective: [`${perspective}px`, '0px'],
      'angle-x': [`${angleXYZ?.x || 0}deg`, '0deg'],
      'angle-y': [`${angleXYZ?.y || 0}deg`, '0deg'],
      'angle-z': [`${angleXYZ?.z || 0}deg`, '0deg'],
      'travel-x': [travelXYZ.x || '0px', '0px'],
      'travel-y': [travelXYZ.y || '0px', '0px'],
      'travel-z': [travelXYZ.z || '0px', '0px'],
      from: [motionRange.fromSign, '-1'],
      to: [motionRange.toSign, '1'],
    },
    asWeb,
  );

  const rangeOffsets = parallax ? parallax(custom, prefix, asWeb) : withoutParallax(custom, prefix);

  const parallaxFrom = toKeyframeValue(custom, `${prefix}-parallax-from`, asWeb, '0px');
  const parallaxTo = toKeyframeValue(custom, `${prefix}-parallax-to`, asWeb, '0px');

  const transformFrames = [
    [vars.from, parallaxFrom],
    [vars.to, parallaxTo],
  ].map(([sign, parallaxOffset]) => [
    `translate3d(calc(${sign} * ${vars['travel-x']}), calc(${sign} * ${vars['travel-y']} + ${parallaxOffset}), calc(${sign} * ${vars['travel-z']}))`,
    `rotateX(calc(${sign} * ${vars['angle-x']}))`,
    `rotateY(calc(${sign} * ${vars['angle-y']}))`,
    `rotateZ(calc(${sign} * ${vars['angle-z']}))`,
  ]);

  applyTransformOrigin(
    transformFrames,
    { ...transformOrigin, z: invertLength(depth) },
    custom,
    prefix,
    asWeb,
  );

  transformFrames.forEach((transform) => transform.unshift(`perspective(${vars.perspective})`));

  return {
    name: `${MOTION_3D_TRANSFORM_NAME}${suffix}`,
    custom,
    keyframes: transformFrames.map((transform) => ({ transform: transform.join(' ') })),
    ...rangeOffsets,
  };
}

// the layout's own rotation (--motion-rotate) as a constant transform layer, since an animated transform replaces it
// its place in a preset's stack of transform animations decides which axes the other layers move along:
// layers before it move along the screen's axes, layers after it along the element's rotated axes
export function getMotionLayoutRotation(
  _params: unknown,
  _asWeb: boolean = false,
  suffix: string = '',
) {
  const rotate = `rotate(${toKeyframeValue({}, '--motion-rotate', false, '0deg')})`;

  return {
    name: `${MOTION_LAYOUT_ROTATION_NAME}${suffix}`,
    custom: {},
    keyframes: [{ transform: rotate }, { transform: rotate }],
  };
}
