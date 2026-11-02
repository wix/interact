import type {
  AnimationFillMode,
  ScrubAnimationOptions,
  RevealScroll,
  DomApi,
  EffectFourDirections,
} from '../../types';
import {
  getOppositeDirection,
  getRevealClipFrom,
  getRevealClipTo,
  toKeyframeValue,
  INITIAL_CLIP,
  parseDirection,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';

const DEFAULTS: Required<RevealScroll> = {
  type: 'RevealScroll',
  direction: 'bottom',
  range: 'in',
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

export function getNames(options: ScrubAnimationOptions) {
  const { range = 'in' } = options.namedEffect as RevealScroll;
  return suffixNames(
    [`motion-revealScroll${range === 'continuous' ? '-continuous' : ''}`],
    options.suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as RevealScroll;
  const parsedDirection = parseDirection(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    DEFAULTS.direction,
  );
  const { range = DEFAULTS.range } = namedEffect;
  // on out the reveal continues in the same direction, hiding the element from the opposite side
  const direction =
    range === 'out'
      ? getOppositeDirection<EffectFourDirections>([...FOUR_DIRECTIONS], parsedDirection)
      : parsedDirection;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill || 'both'
  ) as AnimationFillMode;

  const [revealScroll] = getNames(options);

  const custom = {
    '--motion-clip-from': getRevealClipFrom(direction, range),
    '--motion-clip-to': getRevealClipTo(direction, range),
  };

  const keyframes = [
    {
      clipPath: toKeyframeValue(custom, '--motion-clip-from', asWeb),
    },
    {
      clipPath: toKeyframeValue(custom, '--motion-clip-to', asWeb),
    },
  ];

  if (range === 'continuous') {
    keyframes.splice(1, 0, { clipPath: INITIAL_CLIP });
  }

  const animations = [
    {
      ...options,
      name: revealScroll,
      fill,
      easing,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
