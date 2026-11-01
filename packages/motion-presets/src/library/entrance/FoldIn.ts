import type { EffectFourDirections, FoldIn, TimeAnimationOptions } from '../../types';
import {
  parseDirection,
  toKeyframeValue,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-foldIn'], options.suffix);
}

const DEFAULTS: Required<FoldIn> = {
  type: 'FoldIn',
  angle: -90,
  perspective: 800,
  pivot: 'top',
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.pivot },
};

const PARAM_MAP: Record<
  EffectFourDirections,
  { x: number; y: number; origin: { x: number; y: number } }
> = {
  top: { x: 1, y: 0, origin: { x: 0, y: -50 } },
  right: { x: 0, y: 1, origin: { x: 50, y: 0 } },
  bottom: { x: -1, y: 0, origin: { x: 0, y: 50 } },
  left: { x: 0, y: -1, origin: { x: -50, y: 0 } },
};

function getRotateFrom(pivot: EffectFourDirections, angle: number) {
  return {
    x: PARAM_MAP[pivot].x * angle,
    y: PARAM_MAP[pivot].y * angle,
  };
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as FoldIn;
  const pivot = parseDirection(namedEffect?.pivot, FOUR_DIRECTIONS, DEFAULTS.pivot);
  const { angle = DEFAULTS.angle, perspective = DEFAULTS.perspective } = namedEffect;
  const [fadeIn, foldIn] = getNames(options);
  const easing = options.easing || 'backOut';
  const { x, y } = PARAM_MAP[pivot].origin;

  const from = getRotateFrom(pivot, angle);

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-origin-x': `${x}%`,
    '--motion-origin-y': `${y}%`,
    '--motion-rotate-x': `${from.x}deg`,
    '--motion-rotate-y': `${from.y}deg`,
  };

  const animations = [
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
          transform: `rotate(var(--motion-rotate, 0deg)) perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translate(var(--motion-origin-x, ${custom['--motion-origin-x']}), var(--motion-origin-y, ${custom['--motion-origin-y']})) rotateX(var(--motion-rotate-x, ${custom['--motion-rotate-x']})) rotateY(var(--motion-rotate-y, ${custom['--motion-rotate-y']})) translate(calc(-1 * var(--motion-origin-x, ${custom['--motion-origin-x']})), calc(-1 * var(--motion-origin-y, ${custom['--motion-origin-y']})))`,
        },
        {
          transform: `rotate(var(--motion-rotate, 0deg)) perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translate(var(--motion-origin-x, ${custom['--motion-origin-x']}), var(--motion-origin-y, ${custom['--motion-origin-y']})) rotateX(0deg) rotateY(0deg) translate(calc(-1 * var(--motion-origin-x, ${custom['--motion-origin-x']})), calc(-1 * var(--motion-origin-y, ${custom['--motion-origin-y']})))`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
