import type { AnimationFillMode, ScrubAnimationOptions, ShrinkScroll, DomApi } from '../../types';
import { toKeyframeValue, parseDirection, suffixNames, suffixCustomProperties } from '../../utils';
import { NINE_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import { getPresetScrollParallax } from '../../parallaxUtils';

const EPSILON = 0.01;

const DEFAULTS: Required<ShrinkScroll> = {
  type: 'ShrinkScroll',
  pivot: 'center',
  range: 'in',
  scale: 1.2,
  speed: 1,
};

export const schema = {
  pivot: { type: 'enum', values: NINE_DIRECTIONS, default: DEFAULTS.pivot },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

const directionMap = {
  top: [0, -50],
  'top-right': [50, -50],
  right: [50, 0],
  'bottom-right': [50, 50],
  bottom: [0, 50],
  'bottom-left': [-50, 50],
  left: [-50, 0],
  'top-left': [-50, -50],
  center: [0, 0],
};

// continuous has its own keyframes, so it needs its own name
export function getNames(options: ScrubAnimationOptions) {
  const { range = DEFAULTS.range } = options.namedEffect as ShrinkScroll;
  return suffixNames(
    [`motion-shrinkScroll${range === 'continuous' ? '-continuous' : ''}`],
    options.suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ShrinkScroll;
  const {
    range = DEFAULTS.range,
    scale: inputScale = DEFAULTS.scale,
    speed = DEFAULTS.speed,
  } = namedEffect;
  const pivot = parseDirection(namedEffect?.pivot, NINE_DIRECTIONS, DEFAULTS.pivot);
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  // ShrinkScroll always shrinks, so its scale is above 1 on 'in' and below 1 otherwise - using the inverse if needed
  const invScale = 1 / Math.max(inputScale, EPSILON);
  const scale = range === 'in' ? Math.max(inputScale, invScale) : Math.min(inputScale, invScale);

  const fromValues = { scale: range === 'out' ? 1 : scale };
  const toValues = { scale: range === 'in' ? 1 : scale };

  const [trnsX, trnsY] = directionMap[pivot] || [0, 0];

  const [shrinkScroll] = getNames(options);

  const custom: Record<string, string | number> = {
    '--motion-shrink-from': fromValues.scale,
    '--motion-shrink-to': toValues.scale,
    '--motion-trans-x': `${trnsX}%`,
    '--motion-trans-y': `${trnsY}%`,
  };
  const rangeOffsets = getPresetScrollParallax(options, range, speed)(
    custom,
    '--motion-shrink',
    asWeb,
  );

  const getTransform = (translateY: string, scaleValue: string | number) =>
    // the layout rotation comes before the pivot, so the pivot is on the element's rotated side
    `translateY(${translateY}) rotate(${toKeyframeValue(
      {},
      '--motion-rotate',
      false,
      '0',
    )}) translate(${toKeyframeValue(custom, '--motion-trans-x', asWeb)}, ${toKeyframeValue(
      custom,
      '--motion-trans-y',
      asWeb,
    )}) scale(${scaleValue}) translate(calc(-1 * ${toKeyframeValue(
      custom,
      '--motion-trans-x',
      asWeb,
    )}), calc(-1 * ${toKeyframeValue(custom, '--motion-trans-y', asWeb)}))`;
  const parallaxFrom = toKeyframeValue(custom, '--motion-shrink-parallax-from', asWeb) as string;
  const parallaxTo = toKeyframeValue(custom, '--motion-shrink-parallax-to', asWeb) as string;

  const keyframes = [
    {
      transform: getTransform(parallaxFrom, toKeyframeValue(custom, '--motion-shrink-from', asWeb)),
    },
    { transform: getTransform(parallaxTo, toKeyframeValue(custom, '--motion-shrink-to', asWeb)) },
  ];

  // the parallax keeps its speed through the middle, while the scale goes back and forth
  if (range === 'continuous') {
    keyframes.splice(1, 0, {
      transform: getTransform(`calc((${parallaxFrom} + ${parallaxTo}) / 2)`, 1),
    });
  }

  const animations = [
    {
      ...options,
      name: shrinkScroll,
      fill,
      easing,
      custom,
      ...rangeOffsets,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
