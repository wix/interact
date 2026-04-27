import type {
  AnimationFillMode,
  ScrubAnimationOptions,
  RevealScroll,
  DomApi,
  EffectFourDirections,
} from '../../types';
import {
  getRevealClipFrom,
  getRevealClipTo,
  toKeyframeValue,
  INITIAL_CLIP,
  parseDirection,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectFourDirections = 'bottom';

export function getNames(options: ScrubAnimationOptions) {
  const { range = 'in' } = options.namedEffect as RevealScroll;
  return [`motion-revealScroll${range === 'continuous' ? '-continuous' : ''}`];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options);
}

export function style(options: ScrubAnimationOptions) {
  const namedEffect = options.namedEffect as RevealScroll;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const { range = 'in' } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const [revealScroll] = getNames(options);

  const custom = {
    '--motion-clip-from': getRevealClipFrom(direction, range),
    '--motion-clip-to': getRevealClipTo(direction, range),
  };

  const keyframes = [
    {
      clipPath: toKeyframeValue({}, '--motion-clip-from', false, custom['--motion-clip-from']),
    },
    {
      clipPath: toKeyframeValue({}, '--motion-clip-to', false, custom['--motion-clip-to']),
    },
  ];

  if (range === 'continuous') {
    keyframes.splice(1, 0, { clipPath: INITIAL_CLIP });
  }

  return [
    {
      ...options,
      name: revealScroll,
      fill,
      easing,
      custom,
      keyframes,
    },
  ];
}
