import type { EffectFourDirections, SlideIn, TimeAnimationOptions } from '../../types';
import { getClipPolygonParams, parseDirection, getEntranceFill } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: 'left' },
  start: { type: 'number', min: 0, max: 1, default: 0 },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-slideIn', 'motion-fadeIn'].map((name) => name + suffix);
}

const PARAM_MAP: Record<
  EffectFourDirections,
  { dx: number; dy: number; clip: EffectFourDirections }
> = {
  top: { dx: 0, dy: -1, clip: 'bottom' },
  right: { dx: 1, dy: 0, clip: 'left' },
  bottom: { dx: 0, dy: 1, clip: 'top' },
  left: { dx: -1, dy: 0, clip: 'right' },
};

export function web(options: TimeAnimationOptions) {
  return style(options);
}

export function style(options: TimeAnimationOptions) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as SlideIn;
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    schema.from.default,
  );
  const { start: startTranslate = schema.start.default } = namedEffect;
  const [slideIn, fadeIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';
  const minimum = startTranslate * 100;

  const start = getClipPolygonParams({
    direction: PARAM_MAP[direction].clip,
    minimum,
  });
  const clipEnd = getClipPolygonParams({ direction: 'initial' });

  const custom = {
    [`--motion-clip-start${suffix}`]: start,
    [`--motion-translate-x${suffix}`]: `${PARAM_MAP[direction].dx * 100}%`,
    [`--motion-translate-y${suffix}`]: `${PARAM_MAP[direction].dy * 100}%`,
  };

  return [
    {
      ...options,
      name: slideIn,
      fill: getEntranceFill(options),
      easing,
      custom,
      keyframes: [
        {
          transform: `rotate(var(--motion-rotate, 0deg)) translate(var(--motion-translate-x${suffix}, ${custom[`--motion-translate-x${suffix}`]}), var(--motion-translate-y${suffix}, ${custom[`--motion-translate-y${suffix}`]}))`,
          clipPath: `var(--motion-clip-start${suffix}, ${custom[`--motion-clip-start${suffix}`]})`,
        },
        {
          transform: 'rotate(var(--motion-rotate, 0deg)) translate(0px, 0px)',
          clipPath: clipEnd,
        },
      ],
    },
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];
}
