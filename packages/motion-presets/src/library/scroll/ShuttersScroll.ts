import type { AnimationFillMode, ScrubAnimationOptions, ShuttersScroll, DomApi } from '../../types';
import {
  getOppositeDirection,
  getShuttersClipPaths,
  getEasing,
  toKeyframeValue,
  FOUR_DIRECTIONS,
  parseDirection,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { SCROLL_RANGES } from '../../consts';

const DEFAULTS: Required<ShuttersScroll> = {
  type: 'ShuttersScroll',
  direction: 'right',
  range: 'in',
  shutters: 12,
  staggered: true,
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  shutters: { type: 'number', min: 1, int: true, default: DEFAULTS.shutters },
  staggered: { type: 'bool', default: DEFAULTS.staggered },
};

// the easing is set on the keyframes and differs per range, and staggered continuous has its own offsets
export function getNames(options: ScrubAnimationOptions) {
  const { range = DEFAULTS.range, staggered = DEFAULTS.staggered } =
    options.namedEffect as ShuttersScroll;
  const variant = range === 'continuous' && staggered ? 'continuous-staggered' : range;
  return suffixNames([`motion-shuttersScroll-${variant}`], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ShuttersScroll;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULTS.direction);
  const {
    shutters = DEFAULTS.shutters,
    staggered = DEFAULTS.staggered,
    range = DEFAULTS.range,
  } = namedEffect;
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  const easing = range === 'in' ? getEasing('sineIn') : getEasing('sineOut');

  const directionOpp = getOppositeDirection(FOUR_DIRECTIONS, direction);

  const { clipStart, clipEnd } = getShuttersClipPaths(
    range === 'out' ? directionOpp : direction,
    shutters,
    staggered,
  );

  const custom = {
    '--motion-shutters-clip-start': range === 'out' ? clipEnd : clipStart,
    '--motion-shutters-clip-end': range === 'out' ? clipStart : clipEnd,
  };

  const [shuttersScroll] = getNames(options);

  const keyframes: {
    clipPath: string | number;
    easing?: string;
    offset?: number;
  }[] = [
    {
      clipPath: toKeyframeValue(custom, '--motion-shutters-clip-start', asWeb),
      easing,
    },
    {
      clipPath: toKeyframeValue(custom, '--motion-shutters-clip-end', asWeb),
    },
  ];

  if (range === 'continuous') {
    // holds the revealed state until the opposite side takes over, without 2 keyframes on the same offset
    // since CSS merges keyframes that share an offset
    keyframes[1].easing = 'step-end';
    keyframes[1].offset = staggered ? 0.45 : 0.4;

    const { clipStart: oppClipStart, clipEnd: oppClipEnd } = getShuttersClipPaths(
      directionOpp,
      shutters,
      staggered,
      true,
    );
    Object.assign(custom, {
      '--motion-shutters-clip-opp-end': oppClipEnd,
      '--motion-shutters-clip-opp-start': oppClipStart,
    });

    const secondOffset = staggered ? 0.55 : 0.6;
    keyframes.push(
      {
        clipPath: toKeyframeValue(custom, '--motion-shutters-clip-opp-end', asWeb),
        offset: secondOffset,
        easing,
      },
      {
        clipPath: toKeyframeValue(custom, '--motion-shutters-clip-opp-start', asWeb),
      },
    );
  }

  const animations = [
    {
      ...options,
      name: shuttersScroll,
      fill,
      easing: 'linear',
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
