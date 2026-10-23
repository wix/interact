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
  parseDirection,
} from '../../utils';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: 'top' },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
} as const;

const DIRECTION_TRANSLATION_MAP: Record<EffectFourDirections, Translate> = {
  bottom: { x: '0', y: '100%' },
  left: { x: '-100%', y: '0' },
  top: { x: '0', y: '-100%' },
  right: { x: '100%', y: '0' },
};

export function getNames(options: ScrubAnimationOptions) {
  const { range = schema.range.default } = options.namedEffect as SlideScroll;
  const { suffix = '' } = options;
  return [`motion-slideScroll${range === 'continuous' ? '-continuous' : ''}${suffix}`];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as SlideScroll;
  const { range = schema.range.default } = namedEffect;
  const toDirection = parseDirection<EffectFourDirections>(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    schema.direction.default,
  );
  const direction =
    range === 'out' ? toDirection : getOppositeDirection([...FOUR_DIRECTIONS], toDirection);
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;
  const oppositeDirection = getOppositeDirection([...FOUR_DIRECTIONS], direction);

  const translateFrom = range === 'out' ? { x: '0', y: '0' } : DIRECTION_TRANSLATION_MAP[direction];
  const translateTo =
    range === 'in'
      ? { x: '0', y: '0' }
      : DIRECTION_TRANSLATION_MAP[range === 'out' ? direction : oppositeDirection];

  const custom = {
    [`--motion-clip-from${suffix}`]: getRevealClipFrom(direction, range),
    [`--motion-clip-to${suffix}`]: getRevealClipTo(direction, range),
    [`--motion-translate-from-x${suffix}`]: translateFrom.x,
    [`--motion-translate-from-y${suffix}`]: translateFrom.y,
    [`--motion-translate-to-x${suffix}`]: translateTo.x,
    [`--motion-translate-to-y${suffix}`]: translateTo.y,
  };

  const keyframes = [
    {
      clipPath: toKeyframeValue(
        {},
        `--motion-clip-from${suffix}`,
        false,
        custom[`--motion-clip-from${suffix}`],
      ),
      transform: `rotate(${toKeyframeValue(
        {},
        '--motion-rotate',
        false,
        '0',
      )}) translate(${toKeyframeValue(
        custom,
        `--motion-translate-from-x${suffix}`,
        asWeb,
      )}, ${toKeyframeValue(custom, `--motion-translate-from-y${suffix}`, asWeb)})`,
    },
    {
      clipPath: toKeyframeValue(
        {},
        `--motion-clip-to${suffix}`,
        false,
        custom[`--motion-clip-to${suffix}`],
      ),
      transform: `rotate(${toKeyframeValue(
        {},
        '--motion-rotate',
        false,
        '0',
      )}) translate(${toKeyframeValue(
        custom,
        `--motion-translate-to-x${suffix}`,
        asWeb,
      )}, ${toKeyframeValue(custom, `--motion-translate-to-y${suffix}`, asWeb)})`,
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
