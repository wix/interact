import type { EffectFourDirections, SlideIn, TimeAnimationOptions } from '../../types';
import {
  getClipPolygonParams,
  parseDirection,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<SlideIn> = {
  type: 'SlideIn',
  from: 'left',
  start: 0,
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
  start: { type: 'number', min: 0, max: 1, default: DEFAULTS.start },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-slideIn', 'motion-fadeIn'], options.suffix);
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
  const namedEffect = options.namedEffect as SlideIn;
  const direction = parseDirection(namedEffect?.from, FOUR_DIRECTIONS, DEFAULTS.from);
  const { start = DEFAULTS.start } = namedEffect;
  const [slideIn, fadeIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';
  const clipStart = getClipPolygonParams({
    direction: PARAM_MAP[direction].clip,
    minimum: start * 100,
  });
  const clipEnd = getClipPolygonParams({ direction: 'initial' });

  const custom = {
    '--motion-clip-start': clipStart,
    '--motion-translate-x': `${PARAM_MAP[direction].dx * 100}%`,
    '--motion-translate-y': `${PARAM_MAP[direction].dy * 100}%`,
  };

  const animations = [
    {
      ...options,
      name: slideIn,
      fill: getEntranceFill(options),
      easing,
      custom,
      keyframes: [
        {
          transform: `rotate(var(--motion-rotate, 0deg)) translate(var(--motion-translate-x, ${custom['--motion-translate-x']}), var(--motion-translate-y, ${custom['--motion-translate-y']}))`,
          clipPath: `var(--motion-clip-start, ${custom['--motion-clip-start']})`,
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

  return suffixCustomProperties(animations, options.suffix);
}
