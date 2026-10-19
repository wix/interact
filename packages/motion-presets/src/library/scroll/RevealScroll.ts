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
  getOppositeDirection,
  FOUR_DIRECTIONS as CLIP_DIRECTIONS,
} from '../../utils';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: 'bottom' },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
} as const;

export function getNames(options: ScrubAnimationOptions) {
  const { range = schema.range.default } = options.namedEffect as RevealScroll;
  const { suffix = '' } = options;
  return [`motion-revealScroll${range === 'continuous' ? '-continuous' : ''}${suffix}`];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options);
}

export function style(options: ScrubAnimationOptions) {
  const namedEffect = options.namedEffect as RevealScroll;
  const { range = schema.range.default } = namedEffect;
  const toDirection = parseDirection<EffectFourDirections>(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    schema.direction.default,
  );
  const direction =
    range === 'out' ? getOppositeDirection(CLIP_DIRECTIONS, toDirection) : toDirection;
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
