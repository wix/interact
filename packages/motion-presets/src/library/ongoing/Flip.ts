import type { AnimationExtraOptions, DomApi, Flip, TimeAnimationOptions } from '../../types';
import { getEasing, getTimingFactor, toKeyframeValue, parseDirection } from '../../utils';
import { AXIS_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: (typeof AXIS_DIRECTIONS)[number] = 'horizontal';

const DIRECTION_MAP = {
  vertical: { x: '1', y: '0' },
  horizontal: { x: '0', y: '1' },
};

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Flip;
  const direction = parseDirection(namedEffect?.direction, AXIS_DIRECTIONS, DEFAULT_DIRECTION);
  const { perspective = 800 } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const offset = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const rotationAxes = DIRECTION_MAP[direction];
  const easing = options.easing || 'linear';

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-rotate-x': rotationAxes.x,
    '--motion-rotate-y': rotationAxes.y,
  };

  const rotateStart = `rotate3d(${toKeyframeValue(
    custom,
    '--motion-rotate-x',
    asWeb,
  )}, ${toKeyframeValue(custom, '--motion-rotate-y', asWeb)}, 0, 0deg)`;

  const rotateEnd = `rotate3d(${toKeyframeValue(
    custom,
    '--motion-rotate-x',
    asWeb,
  )}, ${toKeyframeValue(custom, '--motion-rotate-y', asWeb)}, 0, 360deg)`;

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes: [
        {
          offset: 0,
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) rotateZ(var(--motion-rotate, 0deg)) ${rotateStart}`,
          easing: getEasing(easing),
        },
        {
          offset,
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) rotateZ(var(--motion-rotate, 0deg)) ${rotateEnd}`,
        },
        {
          offset: 1,
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) rotateZ(var(--motion-rotate, 0deg)) ${rotateEnd}`,
        },
      ],
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Flip)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return [`motion-flip-${timingFactor}`];
}
