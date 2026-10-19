import type {
  AnimationFillMode,
  ScrubAnimationOptions,
  TiltScroll,
  DomApi,
  EffectSpinDirection,
} from '../../types';
import { cssEasings as easings } from '@wix/motion';
import { toKeyframeValue, parseDirection } from '../../utils';
import { SCROLL_RANGES, SPIN_DIRECTIONS } from '../../consts';

const MAX_Y_TRAVEL = 40;
const EPSILON = 0.01;
const [ROTATION_X, ROTATION_Y, ROTATION_Z] = [10, 25, 25];

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: 'counter-clockwise' },
  perspective: { type: 'number', min: 0, default: 400 },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  speed: { type: 'number', min: 0, default: 1 },
} as const;

const DIRECTIONS_MAP = {
  'counter-clockwise': 1,
  clockwise: -1,
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-tiltScrollTranslate', 'motion-tiltScrollRotate'].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as TiltScroll;
  const direction = parseDirection<EffectSpinDirection>(
    namedEffect?.direction,
    SPIN_DIRECTIONS,
    schema.direction.default,
  );
  const { speed = schema.speed.default, perspective = schema.perspective.default } = namedEffect;
  const { range = schema.range.default } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const travelY = MAX_Y_TRAVEL * (1 - 1 / Math.max(speed, EPSILON));
  const dir = DIRECTIONS_MAP[direction] * (range === 'in' ? 1 : -1);

  const from = {
    x: ROTATION_X * (range === 'out' ? 0 : -1),
    y: ROTATION_Y * (range === 'out' ? 0 : -1),
    z: ROTATION_Z * dir * (range === 'out' ? 0 : range === 'in' ? 1 : -1),
    transY: range === 'out' ? 0 : travelY,
  };
  const to = {
    x: ROTATION_X * (range === 'in' ? 0 : range === 'out' ? -1 : 1),
    y: ROTATION_Y * (range === 'in' ? 0 : range === 'out' ? -1 : 0.5),
    z: ROTATION_Z * dir * (range === 'in' ? 0 : range === 'out' ? 1 : 1.25),
    transY: range === 'in' ? 0 : -1 * travelY,
  };

  const startOffsetAdd = range === 'out' ? '0px' : `${-1 * Math.abs(travelY)}vh`;
  const endOffsetAdd = range === 'in' ? '0px' : `${Math.abs(travelY)}vh`;

  const [tiltScrollTranslate, tiltScrollRotate] = getNames(options);

  const custom = {
    [`--motion-perspective${suffix}`]: `${perspective}px`,
    [`--motion-tilt-y-from${suffix}`]: `${from.transY}vh`,
    [`--motion-tilt-y-to${suffix}`]: `${to.transY}vh`,
    [`--motion-tilt-x-from${suffix}`]: `${from.x}deg`,
    [`--motion-tilt-x-to${suffix}`]: `${to.x}deg`,
    [`--motion-tilt-y-rot-from${suffix}`]: `${from.y}deg`,
    [`--motion-tilt-y-rot-to${suffix}`]: `${to.y}deg`,
    [`--motion-tilt-z-from${suffix}`]: `${from.z}deg`,
    [`--motion-tilt-z-to${suffix}`]: `${to.z}deg`,
  };

  return [
    {
      ...options,
      name: tiltScrollTranslate,
      fill,
      easing,
      startOffsetAdd,
      endOffsetAdd,
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, `--motion-perspective${suffix}`, asWeb)}) translateY(${toKeyframeValue(
            custom,
            `--motion-tilt-y-from${suffix}`,
            asWeb,
          )}) rotateX(${toKeyframeValue(
            custom,
            `--motion-tilt-x-from${suffix}`,
            asWeb,
          )}) rotateY(${toKeyframeValue(custom, `--motion-tilt-y-rot-from${suffix}`, asWeb)})`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, `--motion-perspective${suffix}`, asWeb)}) translateY(${toKeyframeValue(
            custom,
            `--motion-tilt-y-to${suffix}`,
            asWeb,
          )}) rotateX(${toKeyframeValue(
            custom,
            `--motion-tilt-x-to${suffix}`,
            asWeb,
          )}) rotateY(${toKeyframeValue(custom, `--motion-tilt-y-rot-to${suffix}`, asWeb)})`,
        },
      ],
    },
    {
      ...options,
      name: tiltScrollRotate,
      fill,
      easing: easings.sineInOut,
      startOffsetAdd,
      endOffsetAdd,
      composite: 'add' as const, // add this animation on top of the previous one
      custom,
      keyframes: [
        {
          transform: `rotate(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, `--motion-tilt-z-from${suffix}`, asWeb)}))`,
        },
        {
          transform: `rotate(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, `--motion-tilt-z-to${suffix}`, asWeb)}))`,
        },
      ],
    },
  ];
}
