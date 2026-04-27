import { getClipPolygonParams, parseDirection } from '../../utils';
import type { TimeAnimationOptions, WinkIn } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';

const DIRECTIONS = AXIS_DIRECTIONS;
const DEFAULT_DIRECTION: (typeof DIRECTIONS)[number] = 'horizontal';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-winkInClip', 'motion-winkInRotate'];
}

const PARAM_MAP: Record<(typeof DIRECTIONS)[number], { scaleY: number; scaleX: number }> = {
  vertical: { scaleY: 0, scaleX: 1 },
  horizontal: { scaleY: 1, scaleX: 0 },
};

export function web(options: TimeAnimationOptions) {
  return style(options);
}

export function style(options: TimeAnimationOptions) {
  const namedEffect = options.namedEffect as WinkIn;
  const direction = parseDirection(namedEffect?.direction, AXIS_DIRECTIONS, DEFAULT_DIRECTION);
  const [fadeIn, winkInClip, winkInRotate] = getNames(options);

  const { scaleX, scaleY } = PARAM_MAP[direction];
  const easing = options.easing || 'quintInOut';

  const start = getClipPolygonParams({ direction, minimum: 100 });
  const end = getClipPolygonParams({ direction: 'initial' });

  const custom = {
    '--motion-scale-x': scaleX,
    '--motion-scale-y': scaleY,
    '--motion-clip-start': start,
  };

  return [
    {
      ...options,
      easing: 'quadOut',
      name: fadeIn,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      easing,
      name: winkInClip,
      custom,
      keyframes: [
        {
          clipPath: `var(--motion-clip-start, ${custom['--motion-clip-start']})`,
        },
        {
          clipPath: end,
        },
      ],
    },
    {
      ...options,
      duration: options.duration! * 0.85,
      easing,
      name: winkInRotate,
      custom,
      keyframes: [
        {
          transform: `rotate(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x, ${custom['--motion-scale-x']}), var(--motion-scale-y, ${custom['--motion-scale-y']}))`,
        },
        {
          transform: 'rotate(var(--motion-rotate, 0deg)) scale(1, 1)',
        },
      ],
    },
  ];
}
