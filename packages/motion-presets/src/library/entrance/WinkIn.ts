import { getClipPolygonParams, parseDirection, getEntranceFill } from '../../utils';
import type { TimeAnimationOptions, WinkIn } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';

const DIRECTIONS = AXIS_DIRECTIONS;

export const schema = {
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: 'horizontal' },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-winkInClip', 'motion-winkInRotate'].map((name) => name + suffix);
}

const PARAM_MAP: Record<(typeof DIRECTIONS)[number], { scaleY: number; scaleX: number }> = {
  vertical: { scaleY: 0, scaleX: 1 },
  horizontal: { scaleY: 1, scaleX: 0 },
};

export function web(options: TimeAnimationOptions) {
  return style(options);
}

export function style(options: TimeAnimationOptions) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as WinkIn;
  const direction = parseDirection<(typeof DIRECTIONS)[number]>(
    namedEffect?.direction,
    AXIS_DIRECTIONS,
    schema.direction.default,
  );
  const [fadeIn, winkInClip, winkInRotate] = getNames(options);

  const { scaleX, scaleY } = PARAM_MAP[direction];
  const easing = options.easing || 'quintInOut';

  const start = getClipPolygonParams({ direction, minimum: 100 });
  const end = getClipPolygonParams({ direction: 'initial' });

  const custom = {
    [`--motion-scale-x${suffix}`]: scaleX,
    [`--motion-scale-y${suffix}`]: scaleY,
    [`--motion-clip-start${suffix}`]: start,
  };

  return [
    {
      ...options,
      easing: 'quadOut',
      name: fadeIn,
      fill: getEntranceFill(options),
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      easing,
      name: winkInClip,
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          clipPath: `var(--motion-clip-start${suffix}, ${custom[`--motion-clip-start${suffix}`]})`,
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
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          transform: `rotate(var(--motion-rotate, 0deg)) scale(var(--motion-scale-x${suffix}, ${custom[`--motion-scale-x${suffix}`]}), var(--motion-scale-y${suffix}, ${custom[`--motion-scale-y${suffix}`]}))`,
        },
        {
          transform: 'rotate(var(--motion-rotate, 0deg)) scale(1, 1)',
        },
      ],
    },
  ];
}
