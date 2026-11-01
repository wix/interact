import type { AnimationFillMode, ScrubAnimationOptions, TiltScroll, DomApi } from '../../types';
import { cssEasings as easings } from '@wix/motion';
import { toKeyframeValue, parseDirection, suffixNames, suffixCustomProperties } from '../../utils';
import { SCROLL_RANGES, SPIN_DIRECTIONS } from '../../consts';
import { getPresetScrollParallax } from '../../parallaxUtils';

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

// the sign of the rotation it starts from on 'in', so it turns in that direction into place
const DIRECTIONS_MAP = {
  'counter-clockwise': 1,
  clockwise: -1,
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-tiltScrollTranslate', 'motion-tiltScrollRotate'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as TiltScroll;
  const direction = parseDirection(namedEffect?.direction, SPIN_DIRECTIONS, DEFAULTS.direction);
  const {
    speed = DEFAULTS.speed,
    perspective = DEFAULTS.perspective,
    range = DEFAULTS.range,
  } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  const dir = DIRECTIONS_MAP[direction];

  // the 3d tilt is not directional - out is in reversed, while the rotation continues in its direction
  const from = {
    x: ROTATION_X * (range === 'out' ? 0 : -1),
    y: ROTATION_Y * (range === 'out' ? 0 : -1),
    z: ROTATION_Z * dir * (range === 'out' ? 0 : 1),
  };
  const to = {
    x: ROTATION_X * (range === 'in' ? 0 : range === 'out' ? -1 : 1),
    y: ROTATION_Y * (range === 'in' ? 0 : range === 'out' ? -1 : 1),
    z: ROTATION_Z * dir * (range === 'in' ? 0 : -1),
  };

  const [tiltScrollTranslate, tiltScrollRotate] = getNames(options);

  const custom: Record<string, string | number> = {
    '--motion-perspective': `${perspective}px`,
    '--motion-tilt-x-from': `${from.x}deg`,
    '--motion-tilt-x-to': `${to.x}deg`,
    '--motion-tilt-y-rot-from': `${from.y}deg`,
    '--motion-tilt-y-rot-to': `${to.y}deg`,
    '--motion-tilt-z-from': `${from.z}deg`,
    '--motion-tilt-z-to': `${to.z}deg`,
  };
  const rangeOffsets = getPresetScrollParallax(options, range, speed)(
    custom,
    '--motion-tilt',
    asWeb,
  );

  const animations = [
    {
      ...options,
      name: tiltScrollTranslate,
      fill,
      easing,
      ...rangeOffsets,
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateY(${toKeyframeValue(
            custom,
            '--motion-tilt-parallax-from',
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
            '--motion-tilt-parallax-to',
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
      fill,
      easing: easings.sineInOut,
      ...rangeOffsets,
      composite: 'add' as const, // add this animation on top of the previous one
      custom,
      keyframes: [
        {
          transform: `rotate(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-tilt-z-from', asWeb)}))`,
        },
        {
          transform: `rotate(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-tilt-z-to', asWeb)}))`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
