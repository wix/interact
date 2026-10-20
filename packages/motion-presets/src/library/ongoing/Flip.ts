import type { AnimationExtraOptions, DomApi, Flip, TimeAnimationOptions } from '../../types';
import {
  getEasing,
  getTimingFactor,
  holdAtRest,
  toKeyframeValue,
  parseDirection,
  getEasingKey,
} from '../../utils';
import { AXIS_DIRECTIONS } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: 'horizontal' },
  iterationDelay: { type: 'number', min: 0, default: 0 },
  perspective: { type: 'number', min: 0, default: 800 },
} as const;

const DIRECTION_MAP = {
  vertical: { x: '1', y: '0' },
  horizontal: { x: '0', y: '1' },
};

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Flip;
  const direction = parseDirection<(typeof AXIS_DIRECTIONS)[number]>(
    namedEffect?.direction,
    AXIS_DIRECTIONS,
    schema.direction.default,
  );
  const { perspective = schema.perspective.default } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const rotationAxes = DIRECTION_MAP[direction];
  const easing = options.easing || 'linear';

  const custom = {
    [`--motion-perspective${suffix}`]: `${perspective}px`,
    [`--motion-rotate-x${suffix}`]: rotationAxes.x,
    [`--motion-rotate-y${suffix}`]: rotationAxes.y,
  };

  const rotateStart = `rotate3d(${toKeyframeValue(
    custom,
    `--motion-rotate-x${suffix}`,
    asWeb,
  )}, ${toKeyframeValue(custom, `--motion-rotate-y${suffix}`, asWeb)}, 0, 0deg)`;

  const rotateEnd = `rotate3d(${toKeyframeValue(
    custom,
    `--motion-rotate-x${suffix}`,
    asWeb,
  )}, ${toKeyframeValue(custom, `--motion-rotate-y${suffix}`, asWeb)}, 0, 360deg)`;

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes: holdAtRest(
        [
          {
            offset: 0,
            transform: `perspective(${toKeyframeValue(custom, `--motion-perspective${suffix}`, asWeb)}) rotateZ(var(--motion-rotate, 0deg)) ${rotateStart}`,
            easing: getEasing(easing),
          },
          {
            offset: 1,
            transform: `perspective(${toKeyframeValue(custom, `--motion-perspective${suffix}`, asWeb)}) rotateZ(var(--motion-rotate, 0deg)) ${rotateEnd}`,
          },
        ],
        timingFactor,
      ),
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay =
    (options.namedEffect as Flip)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;
  const easingKey = getEasingKey(options.easing);

  return [`motion-flip-${timingFactor}`].map((name) => name + easingKey + suffix);
}
