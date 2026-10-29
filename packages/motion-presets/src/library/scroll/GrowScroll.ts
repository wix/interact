import type { GrowScroll, ScrubAnimationOptions, DomApi } from '../../types';
import {
  toKeyframeValue,
  parseDirection,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  getScrollParallax,
} from '../../utils';
import { NINE_DIRECTIONS, SCROLL_RANGES } from '../../consts';

const EPSILON = 0.01;

const DEFAULTS: Required<GrowScroll> = {
  type: 'GrowScroll',
  pivot: 'center',
  range: 'in',
  scale: 0.25,
  speed: 1,
};

export const schema = {
  pivot: { type: 'enum', values: NINE_DIRECTIONS, default: DEFAULTS.pivot },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

const pivotMap = {
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
  return suffixNames(['motion-growScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as GrowScroll;
  const {
    range = DEFAULTS.range,
    scale: inputScale = DEFAULTS.scale,
    speed = DEFAULTS.speed,
  } = namedEffect;
  const pivot = parseDirection(namedEffect?.pivot, NINE_DIRECTIONS, DEFAULTS.pivot);
  const easing = 'linear';
  const fill = getScrollFill(options, range);

  // the scale always grows towards 1 for 'in' and away from 1 otherwise
  const invScale = 1 / Math.max(inputScale, EPSILON);
  const scale = range === 'in' ? Math.min(inputScale, invScale) : Math.max(inputScale, invScale);

  const { from, to, ...rangeOffsets } = getScrollParallax(options, range, speed);

  const [trnsX, trnsY] = pivotMap[pivot];

  const [growScroll] = getNames(options);

  const custom = {
    '--motion-travel-from': from,
    '--motion-travel-to': to,
    '--motion-grow-from': range === 'out' ? 1 : scale,
    '--motion-grow-to': range === 'in' ? 1 : scale,
    '--motion-trans-x': `${trnsX}%`,
    '--motion-trans-y': `${trnsY}%`,
  };

  const travelFrom = toKeyframeValue(custom, '--motion-travel-from', asWeb);
  const travelTo = toKeyframeValue(custom, '--motion-travel-to', asWeb);
  const transX = toKeyframeValue(custom, '--motion-trans-x', asWeb);
  const transY = toKeyframeValue(custom, '--motion-trans-y', asWeb);
  const rotate = toKeyframeValue({}, '--motion-rotate', false, '0');
  const getTransform = (travel: string | number, grow: string | number) =>
    `translateY(${travel}) rotate(${rotate}) translate(${transX}, ${transY}) scale(${grow}) translate(calc(-1 * ${transX}), calc(-1 * ${transY}))`;

  const fromFrame = {
    transform: getTransform(travelFrom, toKeyframeValue(custom, '--motion-grow-from', asWeb)),
  };
  const toFrame = {
    transform: getTransform(travelTo, toKeyframeValue(custom, '--motion-grow-to', asWeb)),
  };
  const keyframes =
    range === 'continuous'
      ? [
          fromFrame,
          { offset: 0.5, transform: getTransform(`calc((${travelFrom} + ${travelTo}) / 2)`, 1) },
          toFrame,
        ]
      : [fromFrame, toFrame];

  const animations = [
    {
      ...options,
      name: growScroll,
      fill,
      easing,
      ...rangeOffsets,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
