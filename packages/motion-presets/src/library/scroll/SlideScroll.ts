import type {
  DomApi,
  EffectFourDirections,
  ScrubAnimationOptions,
  SlideScroll,
  Translate,
} from '../../types';
import {
  getOppositeDirection,
  getRevealClipFrom,
  getRevealClipTo,
  toKeyframeValue,
  INITIAL_CLIP,
  parseKeywordLazy,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';

const DEFAULTS: Required<SlideScroll> = {
  type: 'SlideScroll',
  direction: 'top',
  range: 'in',
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

const DIRECTION_TRANSLATION_MAP: Record<EffectFourDirections, Translate> = {
  bottom: { x: '0', y: '100%' },
  left: { x: '-100%', y: '0' },
  top: { x: '0', y: '-100%' },
  right: { x: '100%', y: '0' },
};

export function getNames(options: ScrubAnimationOptions) {
  const { range = DEFAULTS.range } = options.namedEffect as SlideScroll;
  return suffixNames(
    [`motion-slideScroll${range === 'continuous' ? '-continuous' : ''}`],
    options.suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as SlideScroll;
  const { range = DEFAULTS.range } = namedEffect;
  const motionDirection = parseKeywordLazy(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    DEFAULTS.direction,
  );
  const direction =
    range === 'out' ? motionDirection : getOppositeDirection([...FOUR_DIRECTIONS], motionDirection);
  const easing = 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);
  const oppositeDirection = getOppositeDirection([...FOUR_DIRECTIONS], direction);

  const translateFrom = range === 'out' ? { x: '0', y: '0' } : DIRECTION_TRANSLATION_MAP[direction];
  const translateTo =
    range === 'in'
      ? { x: '0', y: '0' }
      : DIRECTION_TRANSLATION_MAP[range === 'out' ? direction : oppositeDirection];

  const custom = {
    '--motion-clip-from': getRevealClipFrom(direction, range),
    '--motion-clip-to': getRevealClipTo(direction, range),
    '--motion-translate-from-x': translateFrom.x,
    '--motion-translate-from-y': translateFrom.y,
    '--motion-translate-to-x': translateTo.x,
    '--motion-translate-to-y': translateTo.y,
  };

  const keyframes = [
    {
      clipPath: toKeyframeValue({}, '--motion-clip-from', false, custom['--motion-clip-from']),
      transform: `rotate(${toKeyframeValue(
        {},
        '--motion-rotate',
        false,
        '0',
      )}) translate(${toKeyframeValue(
        custom,
        `--motion-translate-from-x`,
        asWeb,
      )}, ${toKeyframeValue(custom, `--motion-translate-from-y`, asWeb)})`,
    },
    {
      clipPath: toKeyframeValue({}, '--motion-clip-to', false, custom['--motion-clip-to']),
      transform: `rotate(${toKeyframeValue(
        {},
        '--motion-rotate',
        false,
        '0',
      )}) translate(${toKeyframeValue(
        custom,
        `--motion-translate-to-x`,
        asWeb,
      )}, ${toKeyframeValue(custom, `--motion-translate-to-y`, asWeb)})`,
    },
  ];

  if (range === 'continuous') {
    keyframes.splice(1, 0, {
      clipPath: INITIAL_CLIP,
      transform: `rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')}) translate(0, 0)`,
    });
  }

  const [slideScroll] = getNames(options);

  const animations = [
    {
      ...options,
      name: slideScroll,
      fill,
      ...offsets,
      easing,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
