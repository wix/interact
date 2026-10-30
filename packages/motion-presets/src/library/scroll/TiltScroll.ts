import type { ScrubAnimationOptions, TiltScroll, DomApi } from '../../types';
import { cssEasings as easings } from '@wix/motion';
import {
  toKeyframeValue,
  parseKeywordLazy,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  getScrollParallax,
} from '../../utils';
import { SCROLL_RANGES, SPIN_DIRECTIONS } from '../../consts';

const [ROTATION_X, ROTATION_Y, ROTATION_Z] = [10, 25, 25];

const DEFAULTS: Required<TiltScroll> = {
  type: 'TiltScroll',
  direction: 'counter-clockwise',
  perspective: 400,
  range: 'in',
  speed: 1,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

const DIRECTIONS_MAP = {
  clockwise: -1,
  'counter-clockwise': 1,
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-tiltScrollTranslate', 'motion-tiltScrollRotate'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as TiltScroll;
  const direction = parseKeywordLazy(namedEffect?.direction, SPIN_DIRECTIONS, DEFAULTS.direction);
  const {
    perspective = DEFAULTS.perspective,
    range = DEFAULTS.range,
    speed = DEFAULTS.speed,
  } = namedEffect;
  const easing = 'linear';
  const fill = getScrollFill(options, range);

  const dir = DIRECTIONS_MAP[direction];

  const from = {
    x: range === 'out' ? 0 : -ROTATION_X,
    y: range === 'out' ? 0 : -ROTATION_Y,
    z: range === 'out' ? 0 : ROTATION_Z * dir,
  };
  const to = {
    x: range === 'in' ? 0 : ROTATION_X * (range === 'out' ? -1 : 1),
    y: range === 'in' ? 0 : ROTATION_Y * (range === 'out' ? -1 : 1),
    z: range === 'in' ? 0 : -ROTATION_Z * dir,
  };

  const {
    from: travelFrom,
    to: travelTo,
    ...rangeOffsets
  } = getScrollParallax(options, range, speed);

  const [tiltScrollTranslate, tiltScrollRotate] = getNames(options);

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-tilt-y-from': travelFrom,
    '--motion-tilt-y-to': travelTo,
    '--motion-tilt-x-from': `${from.x}deg`,
    '--motion-tilt-x-to': `${to.x}deg`,
    '--motion-tilt-y-rot-from': `${from.y}deg`,
    '--motion-tilt-y-rot-to': `${to.y}deg`,
    '--motion-tilt-z-from': `${from.z}deg`,
    '--motion-tilt-z-to': `${to.z}deg`,
  };

  const rotate = toKeyframeValue({}, '--motion-rotate', false, '0deg');
  const rotateKeyframes = [
    {
      transform: `rotate(calc(${rotate} + ${toKeyframeValue(custom, '--motion-tilt-z-from', asWeb)}))`,
      easing: easings.sineInOut,
    },
    {
      transform: `rotate(calc(${rotate} + ${toKeyframeValue(custom, '--motion-tilt-z-to', asWeb)}))`,
    },
  ];

  if (range === 'continuous') {
    rotateKeyframes.splice(1, 0, { transform: `rotate(${rotate})`, easing: easings.sineInOut });
  }

  const animations = [
    {
      ...options,
      name: tiltScrollTranslate,
      ...rangeOffsets,
      fill,
      easing,
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateY(${toKeyframeValue(
            custom,
            '--motion-tilt-y-from',
            asWeb,
          )}) rotateX(${toKeyframeValue(
            custom,
            '--motion-tilt-x-from',
            asWeb,
          )}) rotateY(${toKeyframeValue(custom, '--motion-tilt-y-rot-from', asWeb)})`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateY(${toKeyframeValue(
            custom,
            '--motion-tilt-y-to',
            asWeb,
          )}) rotateX(${toKeyframeValue(
            custom,
            '--motion-tilt-x-to',
            asWeb,
          )}) rotateY(${toKeyframeValue(custom, '--motion-tilt-y-rot-to', asWeb)})`,
        },
      ],
    },
    {
      ...options,
      name: tiltScrollRotate,
      ...rangeOffsets,
      fill,
      easing,
      composite: 'add' as const, // add this animation on top of the previous one
      custom,
      keyframes: rotateKeyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
