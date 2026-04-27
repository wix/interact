import { parseDirection, toKeyframeValue } from '../../utils';
import type { EffectFourDirections, FlipIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectFourDirections = 'top';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-flipIn'];
}

function getRotateFrom(direction: EffectFourDirections, rotate: number) {
  return {
    x: ROTATE_MAP[direction].x * rotate,
    y: ROTATE_MAP[direction].y * rotate,
  };
}

const ROTATE_MAP: Record<EffectFourDirections, { x: number; y: number }> = {
  top: { x: 1, y: 0 },
  right: { x: 0, y: 1 },
  bottom: { x: -1, y: 0 },
  left: { x: 0, y: -1 },
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as FlipIn;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const { initialRotate = 90, perspective = 800 } = namedEffect;
  const [fadeIn, flipIn] = getNames(options);
  const easing = options.easing || 'backOut';

  const from = getRotateFrom(direction, initialRotate);

  const custom = {
    '--motion-perspective': `${perspective}px`,
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
      name: flipIn,
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
}
