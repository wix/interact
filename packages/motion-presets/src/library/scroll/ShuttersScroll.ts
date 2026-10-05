import type { ScrubAnimationOptions, ShuttersScroll, DomApi } from '../../types';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import { MOTION_SHUTTERS_NAME, getMotionShutters } from '../../clipUtils';
import { compareKeywordToNonDefaults } from '../../utils';
import { useDirectionalPreset } from '../../presetUtils';
import { scrollGroup } from '../../scrollGroup';
import { sideDirection } from '../../directions';

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

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<ShuttersScroll>;
  const { range, shutters = DEFAULTS.shutters, staggered = DEFAULTS.staggered } = namedEffect!;

  const shuttersOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      shutters,
      staggered,
    },
  } as ScrubAnimationOptions;

  // staggered continuous motion has its timing set on its keyframes by getMotionShutters
  const isContinuous = compareKeywordToNonDefaults(range, ['continuous']);
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
    useDirectionalPreset(
      getMotionShutters,
      shuttersOptions,
      scrollGroup,
      {
        defaultDirection: DEFAULTS.direction,
        defaultRange: DEFAULTS.range,
        directionType: sideDirection,
        ...easingOptions,
      },
      asWeb,
      suffix,
    ),
  ];
}
