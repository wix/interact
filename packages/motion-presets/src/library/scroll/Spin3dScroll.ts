import type { AnimationFillMode, ScrubAnimationOptions, Spin3dScroll, DomApi } from '../../types';
import { toKeyframeValue } from '../../utils';
import { SCROLL_RANGES } from '../../consts';

const MAX_Y_TRAVEL = 40;
const EPSILON = 0.01;

export const schema = {
  angle: { type: 'number', default: 100 },
  perspective: { type: 'number', min: 0, default: 1000 },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  speed: { type: 'number', min: 0, default: 1 },
} as const;

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-spin3dScroll'].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const {
    angle = schema.angle.default,
    speed = schema.speed.default,
    range = schema.range.default,
    perspective = schema.perspective.default,
  } = options.namedEffect as Spin3dScroll;
  const rotate = -angle;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const travel = (1 / Math.max(speed, EPSILON) - 1) * MAX_Y_TRAVEL;

  const fromValues = {
    rotationX: range === 'out' ? 0 : -2 * rotate,
    rotationY: range === 'out' ? 0 : -rotate,
    rotationZ: range === 'out' ? 0 : -rotate,
    travel: range === 'out' ? 0 : -travel,
  };
  const toValues = {
    rotationX: rotate * (range === 'in' ? 0 : range === 'out' ? 3 : 1.8),
    rotationY: rotate * (range === 'in' ? 0 : range === 'out' ? 2 : 1),
    rotationZ: rotate * (range === 'in' ? 0 : range === 'out' ? 1 : 2),
    travel: range === 'in' ? 0 : travel,
  };

  const offset = Math.abs(travel);
  const startOffsetAdd = range === 'out' ? '0px' : `${-offset}vh`;
  const endOffsetAdd = range === 'in' ? '0px' : `${offset}vh`;

  const [spin3dScroll] = getNames(options);

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-travel-from': `${fromValues.travel}vh`,
    '--motion-travel-to': `${toValues.travel}vh`,
    '--motion-rot-x-from': `${fromValues.rotationX}deg`,
    '--motion-rot-x-to': `${toValues.rotationX}deg`,
    '--motion-rot-y-from': `${fromValues.rotationY}deg`,
    '--motion-rot-y-to': `${toValues.rotationY}deg`,
    '--motion-rot-z-from': `${fromValues.rotationZ}deg`,
    '--motion-rot-z-to': `${toValues.rotationZ}deg`,
  };

  return [
    {
      ...options,
      name: spin3dScroll,
      fill,
      easing,
      custom,
      startOffsetAdd,
      endOffsetAdd,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateY(${toKeyframeValue(
            custom,
            '--motion-travel-from',
            asWeb,
          )}) rotateZ(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-rot-z-from', asWeb)})) rotateY(${toKeyframeValue(
            custom,
            '--motion-rot-y-from',
            asWeb,
          )}) rotateX(${toKeyframeValue(custom, '--motion-rot-x-from', asWeb)})`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateY(${toKeyframeValue(
            custom,
            '--motion-travel-to',
            asWeb,
          )}) rotateZ(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-rot-z-to', asWeb)})) rotateY(${toKeyframeValue(
            custom,
            '--motion-rot-y-to',
            asWeb,
          )}) rotateX(${toKeyframeValue(custom, '--motion-rot-x-to', asWeb)})`,
        },
      ],
    },
  ];
}
