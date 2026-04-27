import type {
  AnimationFillMode,
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
  FOUR_DIRECTIONS,
  parseDirection,
} from '../../utils';

const DEFAULT_DIRECTION: EffectFourDirections = 'bottom';

const DIRECTION_TRANSLATION_MAP: Record<EffectFourDirections, Translate> = {
  bottom: { x: '0', y: '100%' },
  left: { x: '-100%', y: '0' },
  top: { x: '0', y: '-100%' },
  right: { x: '100%', y: '0' },
};

export function getNames(options: ScrubAnimationOptions) {
  const { range = 'in' } = options.namedEffect as SlideScroll;
  return [`motion-slideScroll${range === 'continuous' ? '-continuous' : ''}`];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as SlideScroll;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const { range = 'in' } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;
  const oppositeDirection = getOppositeDirection(FOUR_DIRECTIONS, direction);

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

  return [
    {
      ...options,
      name: slideScroll,
      fill,
      easing,
      custom,
      keyframes,
    },
  ];
}
