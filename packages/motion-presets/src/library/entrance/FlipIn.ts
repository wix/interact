import {
  parseDirection,
  toKeyframeValue,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import type { FlipIn, TimeAnimationOptions } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<FlipIn> = {
  type: 'FlipIn',
  angle: 90,
  direction: 'vertical',
  perspective: 800,
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-flipIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as FlipIn;
  const direction = parseDirection(namedEffect?.direction, AXIS_DIRECTIONS, DEFAULTS.direction);
  const { angle = DEFAULTS.angle, perspective = DEFAULTS.perspective } = namedEffect;
  const [fadeIn, flipIn] = getNames(options);
  const easing = options.easing || 'backOut';

  const custom = {
    '--motion-perspective': `${perspective}px`,
    '--motion-rotate-x': `${direction === 'vertical' ? angle : 0}deg`,
    '--motion-rotate-y': `${direction === 'horizontal' ? -angle : 0}deg`,
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
      name: flipIn,
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) rotate(var(--motion-rotate, 0deg)) rotateX(var(--motion-rotate-x, ${custom['--motion-rotate-x']})) rotateY(var(--motion-rotate-y, ${custom['--motion-rotate-y']}))`,
        },
        {
          transform: `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) rotate(var(--motion-rotate, 0deg)) rotateX(0deg) rotateY(0deg)`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
