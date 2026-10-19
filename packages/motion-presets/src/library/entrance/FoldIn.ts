import type { EffectFourDirections, FoldIn, TimeAnimationOptions } from '../../types';
import { parseDirection, toKeyframeValue, getEntranceFill } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  angle: { type: 'number', default: -90 },
  perspective: { type: 'number', min: 0, default: 800 },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: 'top' },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-foldIn'].map((name) => name + suffix);
}

const PARAM_MAP: Record<
  EffectFourDirections,
  { x: number; y: number; origin: { x: number; y: number } }
> = {
  top: { x: -1, y: 0, origin: { x: 0, y: -50 } },
  right: { x: 0, y: -1, origin: { x: 50, y: 0 } },
  bottom: { x: 1, y: 0, origin: { x: 0, y: 50 } },
  left: { x: 0, y: 1, origin: { x: -50, y: 0 } },
};

function getRotateFrom(direction: EffectFourDirections, rotate: number) {
  return {
    x: PARAM_MAP[direction].x * rotate,
    y: PARAM_MAP[direction].y * rotate,
  };
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as FoldIn;
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.pivot,
    FOUR_DIRECTIONS,
    schema.pivot.default,
  );
  const { angle = schema.angle.default, perspective = schema.perspective.default } = namedEffect;
  const [fadeIn, foldIn] = getNames(options);
  const easing = options.easing || 'backOut';
  const { x, y } = PARAM_MAP[direction].origin;

  const from = getRotateFrom(direction, -angle);

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-origin-x': `${x}%`,
    '--motion-origin-y': `${y}%`,
    '--motion-rotate-x': `${from.x}deg`,
    '--motion-rotate-y': `${from.y}deg`,
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
      name: foldIn,
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          transform: `rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, ${custom['--motion-origin-x']}), var(--motion-origin-y, ${custom['--motion-origin-y']})) perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) rotateX(var(--motion-rotate-x, ${custom['--motion-rotate-x']})) rotateY(var(--motion-rotate-y, ${custom['--motion-rotate-y']})) translate(calc(-1 * var(--motion-origin-x, ${custom['--motion-origin-x']})), calc(-1 * var(--motion-origin-y, ${custom['--motion-origin-y']})))`,
        },
        {
          transform: `rotate(var(--motion-rotate, 0deg)) translate(var(--motion-origin-x, ${custom['--motion-origin-x']}), var(--motion-origin-y, ${custom['--motion-origin-y']})) perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) rotateX(0deg) rotateY(0deg) translate(calc(-1 * var(--motion-origin-x, ${custom['--motion-origin-x']})), calc(-1 * var(--motion-origin-y, ${custom['--motion-origin-y']})))`,
        },
      ],
    },
  ];
}
