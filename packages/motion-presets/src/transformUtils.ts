import type { Length } from '@wix/motion';
import type { AnimationOptions, EffectScrollRange, RangeOffset } from './types';
import type { MotionRange, PresetGroup } from './presetUtils';
import { CSS_CALC_REGEX, declareCustom, mapRange, stripCalc, toKeyframeValue } from './utils';
import { useBasicPreset } from './presetUtils';

const EPSILON = 0.01;

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

function rangeOffsetToVhPercentageSum({ name, offset }: Required<RangeOffset>) {
  const { unit = 'percentage', value = 0 } = offset;
  const isPercentage = unit === 'percentage';
  const isVH = unit === 'vh';
  const rangePercentage = isPercentage ? value : 0;

  const percentage = name === 'contain' ? 100 - rangePercentage : rangePercentage;
  const vh =
    (isVH ? value : 0) +
    (name.includes('entry') ? 0 : name.includes('exit') ? 100 : rangePercentage);

  return { percentage, vh, ...(!isPercentage && !isVH && { absoluteOffset: { value, unit } }) };
}

function lengthsLinearCombination(a1: number, a2: number, l1?: Length, l2?: Length) {
  if (l1?.value) {
    const l2Copy = l2 || { value: 0, unit: l1.unit };
    if (l1.unit === l2Copy.unit || l2Copy.value === 0) {
      return `${a1 * l1.value + a2 * l2Copy.value}${l1.unit}`;
    } else {
      return `calc(${a1 * l1.value}${l1.unit} + ${a2 * l2Copy.value}${l2Copy.unit})`;
    }
  } else if (l2?.value) {
    return `${a2 * l2.value}${l2.unit}`;
  }
  return '';
}

function scaleVhPercentageRangeAroundCenter(
  start: ReturnType<typeof rangeOffsetToVhPercentageSum>,
  end: ReturnType<typeof rangeOffsetToVhPercentageSum>,
  scale: number,
  center: number,
) {
  const startOffsetFactor = center * (1 - scale);
  const endOffsetFactor = (1 - center) * (1 - scale);

  const rangeOffsets = {
    startOffset: {
      name: 'entry-crossing' as const,
      offset: {
        value: mapRange(0, 1, start.percentage, end.percentage, startOffsetFactor),
        unit: 'percentage' as const,
      },
    },
    startOffsetAdd: `${mapRange(0, 1, start.vh, end.vh, startOffsetFactor)}vh`,
    endOffset: {
      name: 'entry-crossing' as const,
      offset: {
        value: mapRange(0, 1, end.percentage, start.percentage, endOffsetFactor),
        unit: 'percentage' as const,
      },
    },
    endOffsetAdd: `${mapRange(0, 1, end.vh, start.vh, endOffsetFactor)}vh`,
  };

  const startAbsoluteAdd = lengthsLinearCombination(
    startOffsetFactor,
    1 - startOffsetFactor,
    end.absoluteOffset,
    start.absoluteOffset,
  );
  const endOAbsoluteAdd = lengthsLinearCombination(
    1 - endOffsetFactor,
    endOffsetFactor,
    end.absoluteOffset,
    start.absoluteOffset,
  );

  if (startAbsoluteAdd) {
    rangeOffsets.startOffsetAdd = `calc(${rangeOffsets.startOffsetAdd} + ${startAbsoluteAdd})`;
  }
  if (endOAbsoluteAdd) {
    rangeOffsets.endOffsetAdd = `calc(${rangeOffsets.endOffsetAdd} + ${endOAbsoluteAdd})`;
  }

  return rangeOffsets;
}

// This parallax is made for small components - for elements larger than viewport `entry`, `exit` and `contain`
// behave differently and will create speed and center to drift as computations here are made assuming the behavior
// for elements smaller than the viewport.
// It is possible to support those to using calcs with min(1%, 1vh) (or max) but that requires support for those
// in both fizban and out JS implementation (currently sets rangeOffsets as strings on the animation if no CSS animation
// which is not formally supported with calc - could move to implementation that uses CSS.add/sub() with CSS.percent/px() etc).
function computeParallax(
  range: { startOffset: Required<RangeOffset>; endOffset: Required<RangeOffset> },
  reversed: boolean,
  speed: number = 1,
  center: number = 0.5,
  custom: Record<string, number | string>,
  prefix: string,
  asWeb: boolean = false,
) {
  const { startOffset, endOffset } = range;
  const end = rangeOffsetToVhPercentageSum(endOffset);
  const start = rangeOffsetToVhPercentageSum(startOffset);

  const invSpeed = 1 / Math.max(speed, EPSILON);
  const c = Math.min(1, Math.max(0, center));

  const rangeOffsets = scaleVhPercentageRangeAroundCenter(start, end, invSpeed, c);

  const absoluteTravel = lengthsLinearCombination(1, -1, end.absoluteOffset, start.absoluteOffset);
  const percentageTravel = `${end.percentage - start.percentage}%`;
  const vhTravel = `${end.vh - start.vh}vh`;
  const travel = `(${percentageTravel} + ${vhTravel}${absoluteTravel ? ` + ${absoluteTravel}` : ''})`;

  const { custom: parallaxCustom, vars } = declareCustom(
    `${prefix}-parallax`,
    {
      center: [c, '0.5'],
      'inv-speed': [invSpeed, '1'],
      travel: [travel, '0px'],
    },
    asWeb,
  );
  Object.assign(custom, parallaxCustom);

  const from = `calc(${vars.center} * (1 - ${vars['inv-speed']}) * ${vars.travel})`;
  const to = `calc((${vars.center} - 1) * (1 - ${vars['inv-speed']}) * ${vars.travel})`;
  custom[`${prefix}-parallax-from`] = reversed ? to : from;
  custom[`${prefix}-parallax-to`] = reversed ? from : to;

  return rangeOffsets;
}

type parallaxParams = {
  range: { startOffset: Required<RangeOffset>; endOffset: Required<RangeOffset> };
  speed?: number;
  center?: number;
};

// directional 2d transformation - 2d translation (with optional parallax), rotation only around z-axis and skew
// translate must be first to use the initial axes, then rotate since it keeps the plane isometric, then skew
// skew is directional like the rotation - it flips with the motion's side, e.g. leaning into a movement
// allows transform-origin to rotate centerd on a different origin
export function getMotionTransRot(
  motionRange: MotionRange,
  params: {
    angle?: number | string;
    parallax?: parallaxParams;
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

  const rangeOffsets = parallax
    ? computeParallax(
        parallax.range,
        motionRange.parallaxReversed || false,
        parallax.speed,
        parallax.center,
        custom,
        prefix,
        asWeb,
      )
    : {};

  const parallaxFrom = toKeyframeValue(custom, `${prefix}-parallax-from`, asWeb, '0px') || '0px';
  const parallaxTo = toKeyframeValue(custom, `${prefix}-parallax-to`, asWeb, '0px') || '0px';

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
    parallax?: parallaxParams;
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

  const rangeOffsets = parallax
    ? computeParallax(
        parallax.range,
        motionRange.parallaxReversed || false,
        parallax.speed,
        parallax.center,
        custom,
        prefix,
        asWeb,
      )
    : {};

  const parallaxFrom = toKeyframeValue(custom, `${prefix}-parallax-from`, asWeb, '0px') || '0px';
  const parallaxTo = toKeyframeValue(custom, `${prefix}-parallax-to`, asWeb, '0px') || '0px';

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

// the layout rotation layer of a preset's transform stack - 'replace' when it is the first transform layer
// when added on top of another layer it must share that layer's options and range, so it never outlives it
export function useLayoutRotation(
  options: AnimationOptions,
  group: PresetGroup,
  layer: { composite?: CompositeOperation; defaultRange?: EffectScrollRange } = {},
  asWeb: boolean = true,
  suffix: string = '',
) {
  const { composite = 'add', defaultRange } = layer;
  return useBasicPreset(
    getMotionLayoutRotation,
    Object.assign({}, options, { composite }),
    group,
    asWeb,
    suffix,
    { defaultRange },
  );
}
