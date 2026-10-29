import type { ScrubAnimationOptions, ShrinkScroll, DomApi } from '../../types';
import {
  toKeyframeValue,
  parseKeywordLazy,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  getScrollParallax,
} from '../../utils';
import { NINE_DIRECTIONS, SCROLL_RANGES } from '../../consts';

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

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-shrinkScroll'], options.suffix);
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
  const pivot = parseKeywordLazy(namedEffect?.pivot, NINE_DIRECTIONS, DEFAULTS.pivot);
  const easing = 'linear';
  const fill = getScrollFill(options, range);

  const invScale = 1 / Math.max(inputScale, EPSILON);
  const scale = range === 'in' ? Math.max(inputScale, invScale) : Math.min(inputScale, invScale);

  const { from, to, ...rangeOffsets } = getScrollParallax(options, range, speed);

  const [trnsX, trnsY] = directionMap[pivot];

  const [shrinkScroll] = getNames(options);

  const custom = {
    '--motion-travel-from': from,
    '--motion-travel-to': to,
    '--motion-shrink-from': range === 'out' ? 1 : scale,
    '--motion-shrink-to': range === 'in' ? 1 : scale,
    '--motion-trans-x': `${trnsX}%`,
    '--motion-trans-y': `${trnsY}%`,
  };

  const getTransform = (travel: string | number, shrink: string | number) =>
    `translateY(${travel}) rotate(${toKeyframeValue(
      {},
      '--motion-rotate',
      false,
      '0deg',
    )}) translate(${toKeyframeValue(custom, '--motion-trans-x', asWeb)}, ${toKeyframeValue(
      custom,
      '--motion-trans-y',
      asWeb,
    )}) scale(${shrink}) translate(calc(-1 * ${toKeyframeValue(
      custom,
      '--motion-trans-x',
      asWeb,
    )}), calc(-1 * ${toKeyframeValue(custom, '--motion-trans-y', asWeb)}))`;

  const keyframes = [
    {
      transform: getTransform(
        toKeyframeValue(custom, '--motion-travel-from', asWeb),
        toKeyframeValue(custom, '--motion-shrink-from', asWeb),
      ),
    },
    {
      transform: getTransform(
        toKeyframeValue(custom, '--motion-travel-to', asWeb),
        toKeyframeValue(custom, '--motion-shrink-to', asWeb),
      ),
    },
  ];

  if (range === 'continuous') {
    keyframes.splice(1, 0, { transform: getTransform('0px', 1) });
  }

  const animations = [
    {
      ...options,
      ...rangeOffsets,
      name: shrinkScroll,
      fill,
      easing,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
