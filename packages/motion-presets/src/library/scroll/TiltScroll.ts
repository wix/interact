import type {
  AnimationFillMode,
  ScrubAnimationOptions,
  TiltScroll,
  DomApi,
  EffectTwoSides,
} from '../../types';
import { cssEasings as easings } from '@wix/motion';
import { toKeyframeValue, parseDirection } from '../../utils';
import { TWO_SIDES_DIRECTIONS } from '../../consts';

const MAX_Y_TRAVEL = 40;
const [ROTATION_X, ROTATION_Y, ROTATION_Z] = [10, 25, 25];
const DEFAULT_DIRECTION: EffectTwoSides = 'right';

const DIRECTIONS_MAP = {
  right: 1,
  left: -1,
};

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-tiltScrollTranslate', 'motion-tiltScrollRotate'];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as TiltScroll;
  const direction = parseDirection(namedEffect?.direction, TWO_SIDES_DIRECTIONS, DEFAULT_DIRECTION);
  const { parallaxFactor = 0, perspective = 400 } = namedEffect;
  const { range = 'in' } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const travelY = MAX_Y_TRAVEL * parallaxFactor;
  const dir = DIRECTIONS_MAP[direction];

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
    '--motion-perspective': `${perspective}px`,
    '--motion-tilt-y-from': `${from.transY}vh`,
    '--motion-tilt-y-to': `${to.transY}vh`,
    '--motion-tilt-x-from': `${from.x}deg`,
    '--motion-tilt-x-to': `${to.x}deg`,
    '--motion-tilt-y-rot-from': `${from.y}deg`,
    '--motion-tilt-y-rot-to': `${to.y}deg`,
    '--motion-tilt-z-from': `${from.z}deg`,
    '--motion-tilt-z-to': `${to.z}deg`,
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
}
