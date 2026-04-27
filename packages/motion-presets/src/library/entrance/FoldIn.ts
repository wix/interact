import type { EffectFourDirections, FoldIn, TimeAnimationOptions } from '../../types';
import { parseDirection, toKeyframeValue } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-foldIn'];
}

const DEFAULT_DIRECTION: EffectFourDirections = 'top';

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
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const { initialRotate = 90, perspective = 800 } = namedEffect;
  const [fadeIn, foldIn] = getNames(options);
  const easing = options.easing || 'backOut';
  const { x, y } = PARAM_MAP[direction].origin;

  const from = getRotateFrom(direction, initialRotate);

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
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      easing,
      name: foldIn,
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
