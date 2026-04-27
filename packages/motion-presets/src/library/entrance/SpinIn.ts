import type { SpinIn, TimeAnimationOptions } from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { SPIN_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: (typeof SPIN_DIRECTIONS)[number] = 'clockwise';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-spinIn'];
}

const DIRECTION_MAP = {
  clockwise: -1,
  'counter-clockwise': 1,
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as SpinIn;
  const direction = parseDirection(namedEffect?.direction, SPIN_DIRECTIONS, DEFAULT_DIRECTION);
  const { spins = 0.5, initialScale = 0 } = namedEffect;
  const [fadeIn, spinIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';
  const transformRotate = (DIRECTION_MAP[direction] > 0 ? 1 : -1) * 360 * spins;

  const custom = {
    '--motion-scale': `${initialScale}`,
    '--motion-rotate': `${transformRotate}deg`,
  };

  return [
    {
      ...options,
      name: fadeIn,
      easing: 'cubicIn',
      duration: options.duration! * initialScale,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: spinIn,
      easing,
      custom,
      keyframes: [
        {
          scale: toKeyframeValue(custom, '--motion-scale', asWeb),
          rotate: toKeyframeValue(custom, '--motion-rotate', asWeb),
        },
        {
          scale: '1',
          rotate: `0deg`,
        },
      ],
    },
  ];
}
