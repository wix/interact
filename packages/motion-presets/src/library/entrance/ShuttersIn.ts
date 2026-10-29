import type { EffectFourDirections, ShuttersIn, TimeAnimationOptions } from '../../types';
import {
  getOppositeDirection,
  getEasing,
  toKeyframeValue,
  parseDirection,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<ShuttersIn> = {
  type: 'ShuttersIn',
  from: 'left',
  shutters: 12,
  staggered: true,
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
  shutters: { type: 'number', min: 1, int: true, default: DEFAULTS.shutters },
  staggered: { type: 'bool', default: DEFAULTS.staggered },
};

function getShuttersClipPaths(
  direction: EffectFourDirections,
  shutterCount: number,
  staggered: boolean,
) {
  const isTopOrLeft = direction === 'top' || direction === 'left';
  const iterStart = isTopOrLeft ? shutterCount : 0;
  // an extra shutter past the edge keeps a single shutter from rendering as a pixel-snapped rect clip
  const iterEnd = isTopOrLeft ? -1 : shutterCount + 1;
  const inc = isTopOrLeft ? -1 : 1;

  const isVerticalPath = direction === 'top' || direction === 'bottom';

  const clipPathStart = [];
  const clipPathEnd = [];

  for (let i = iterStart; i !== iterEnd; i += inc) {
    const shutterEndPosInPercentage = 100 * ((i + inc) / shutterCount);
    const clipStart = 100 * (i / shutterCount);
    let clipEnd;

    if (staggered) {
      const staggerFactor = isTopOrLeft
        ? 1 + (shutterCount - i) / shutterCount
        : 1 + i / shutterCount;

      clipEnd = isTopOrLeft
        ? 100 - (100 - shutterEndPosInPercentage) * staggerFactor
        : shutterEndPosInPercentage * staggerFactor;
    } else {
      clipEnd = shutterEndPosInPercentage;
    }

    if (isVerticalPath) {
      clipPathStart.push(
        `0% ${clipStart}%, 100% ${clipStart}%, 100% ${clipStart}%, 0% ${clipStart}%`,
      );
      clipPathEnd.push(`0% ${clipStart}%, 100% ${clipStart}%, 100% ${clipEnd}%, 0% ${clipEnd}%`);
    } else {
      clipPathStart.push(
        `${clipStart}% 0%, ${clipStart}% 0%, ${clipStart}% 100%, ${clipStart}% 100%, ${clipStart}% 0%`,
      );
      clipPathEnd.push(
        `${clipStart}% 0%, ${clipEnd}% 0%, ${clipEnd}% 100%, ${clipStart}% 100%, ${clipStart}% 0%`,
      );
    }
  }

  return {
    clipStart: `polygon(${clipPathStart.join(', ')})`,
    clipEnd: `polygon(${clipPathEnd.join(', ')})`,
  };
}

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-shuttersIn', 'motion-fadeIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ShuttersIn;
  const from = parseDirection(namedEffect?.from, FOUR_DIRECTIONS, DEFAULTS.from);
  const direction = getOppositeDirection([...FOUR_DIRECTIONS], from);
  const { shutters = DEFAULTS.shutters, staggered = DEFAULTS.staggered } = namedEffect;
  const [shuttersIn, fadeIn] = getNames(options);

  const { clipStart, clipEnd } = getShuttersClipPaths(direction, shutters, staggered);

  const custom = {
    '--motion-shutters-start': clipStart,
    '--motion-shutters-end': clipEnd,
  };

  const easing = getEasing(options.easing || 'sineIn');

  const animations = [
    {
      ...options,
      easing,
      name: shuttersIn,
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          clipPath: toKeyframeValue(custom, '--motion-shutters-start', asWeb),
        },
        {
          clipPath: toKeyframeValue(custom, '--motion-shutters-end', asWeb),
        },
      ],
    },
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      custom: {},
      keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
