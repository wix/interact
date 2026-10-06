import type { ScrubAnimationOptions, ShuttersScroll, DomApi, AnimationData } from '../../types';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import { MOTION_SHUTTERS_NAME, getMotionShutters } from '../../clipUtils';
import { sideDirection, toMotionRange } from '../../directions';
import { getScrollEasing } from '../../easingUtils';
import { getScrollOverrides, parseRange } from '../../rangeUtils';
import { compareKeywordToNonDefaults } from '../../utils';

const EASING = 'sineOut';
const IN_EASING = 'sineIn';

// continuous holds the fully revealed state in the middle of the range, before closing towards the other side
const CONTINUOUS_HOLD = 0.2;

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

export function getNames({ namedEffect, suffix = '' }: ScrubAnimationOptions) {
  const {
    shutters = DEFAULTS.shutters,
    staggered = DEFAULTS.staggered,
    range,
  } = namedEffect as ShuttersScroll;
  const staggerContinuous = staggered && compareKeywordToNonDefaults(range, ['continuous']);

  return [
    `${MOTION_SHUTTERS_NAME}${suffix}-${shutters}${staggerContinuous ? '-cont-stagger' : ''}`,
  ];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<ShuttersScroll>;
  const {
    range: inputRange,
    shutters = DEFAULTS.shutters,
    staggered = DEFAULTS.staggered,
  } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);

  // range out is opposite direction reversed
  const direction = sideDirection.parse(namedEffect!.direction, DEFAULTS.direction);
  const side = range === 'out' ? sideDirection.opposite(direction) : direction;

  const shuttersOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      shutters,
      staggered,
    },
  } as ScrubAnimationOptions;

  // staggered continuous motion has its timing set on its keyframes by getMotionShutters
  const isContinuous = compareKeywordToNonDefaults(inputRange, ['continuous']);
  const easingOptions =
    isContinuous && staggered
      ? {}
      : {
          easing: IN_EASING,
          outEasing: EASING,
          continuousEasing: EASING,
          continuousHold: CONTINUOUS_HOLD,
        };

  return [
    {
      ...shuttersOptions,
      ...getScrollOverrides(options, range, getScrollEasing(range, true, easingOptions)),
      ...getMotionShutters(
        toMotionRange(sideDirection, side, range),
        { shutters, staggered },
        asWeb,
        suffix,
      ),
    },
  ];
}
