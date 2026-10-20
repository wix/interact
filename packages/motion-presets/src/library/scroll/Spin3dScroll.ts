import type { AnimationFillMode, ScrubAnimationOptions, Spin3dScroll, DomApi } from '../../types';
import { toKeyframeValue, getScrollParallax } from '../../utils';
import { SCROLL_RANGES } from '../../consts';

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
  const { suffix = '' } = options;
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

  const { from, to, ...scrollRange } = getScrollParallax(range, options, speed);

  const fromValues = {
    rotationX: range === 'out' ? 0 : -2 * rotate,
    rotationY: range === 'out' ? 0 : -rotate,
    rotationZ: range === 'out' ? 0 : -rotate,
  };
  const toValues = {
    rotationX: rotate * (range === 'in' ? 0 : range === 'out' ? 3 : 1.8),
    rotationY: rotate * (range === 'in' ? 0 : range === 'out' ? 2 : 1),
    rotationZ: rotate * (range === 'in' ? 0 : range === 'out' ? 1 : 2),
  };

  const [spin3dScroll] = getNames(options);

  const custom = {
    [`--motion-perspective${suffix}`]: `${perspective}px`,
    [`--motion-travel-from${suffix}`]: from,
    [`--motion-travel-to${suffix}`]: to,
    [`--motion-rot-x-from${suffix}`]: `${fromValues.rotationX}deg`,
    [`--motion-rot-x-to${suffix}`]: `${toValues.rotationX}deg`,
    [`--motion-rot-y-from${suffix}`]: `${fromValues.rotationY}deg`,
    [`--motion-rot-y-to${suffix}`]: `${toValues.rotationY}deg`,
    [`--motion-rot-z-from${suffix}`]: `${fromValues.rotationZ}deg`,
    [`--motion-rot-z-to${suffix}`]: `${toValues.rotationZ}deg`,
  };

  return [
    {
      ...options,
      name: spin3dScroll,
      fill,
      easing,
      custom,
      ...scrollRange,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, `--motion-perspective${suffix}`, asWeb)}) translateY(${toKeyframeValue(
            custom,
            `--motion-travel-from${suffix}`,
            asWeb,
          )}) rotateZ(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, `--motion-rot-z-from${suffix}`, asWeb)})) rotateY(${toKeyframeValue(
            custom,
            `--motion-rot-y-from${suffix}`,
            asWeb,
          )}) rotateX(${toKeyframeValue(custom, `--motion-rot-x-from${suffix}`, asWeb)})`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, `--motion-perspective${suffix}`, asWeb)}) translateY(${toKeyframeValue(
            custom,
            `--motion-travel-to${suffix}`,
            asWeb,
          )}) rotateZ(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, `--motion-rot-z-to${suffix}`, asWeb)})) rotateY(${toKeyframeValue(
            custom,
            `--motion-rot-y-to${suffix}`,
            asWeb,
          )}) rotateX(${toKeyframeValue(custom, `--motion-rot-x-to${suffix}`, asWeb)})`,
        },
      ],
    },
  ];
}
