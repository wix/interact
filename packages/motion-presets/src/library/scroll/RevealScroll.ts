import type { ScrubAnimationOptions, RevealScroll, DomApi } from '../../types';
import {
  getClipPolygonParams,
  getRevealClipFrom,
  toKeyframeValue,
  INITIAL_CLIP,
  parseDirection,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
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
  const { range = DEFAULTS.range } = options.namedEffect as RevealScroll;
  return suffixNames(
    [`motion-revealScroll${range === 'continuous' ? '-continuous' : ''}`],
    options.suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options);
}

export function style(options: ScrubAnimationOptions) {
  const namedEffect = options.namedEffect as RevealScroll;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULTS.direction);
  const { range = DEFAULTS.range } = namedEffect;
  const easing = 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const [revealScroll] = getNames(options);

  const custom = {
    '--motion-clip-from': getRevealClipFrom(direction, range),
    '--motion-clip-to': range === 'in' ? INITIAL_CLIP : getClipPolygonParams({ direction }),
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

  const animations = [
    {
      ...options,
      name: revealScroll,
      fill,
      ...offsets,
      easing,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
