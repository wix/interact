import type { DomApi, EffectFourDirections, ScrubAnimationOptions, SlideScroll } from '../../types';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import { MOTION_REVEAL_NAME, getMotionReveal } from '../../clipUtils';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';
import { oppositeDirection, useDirectionalPreset, withSharedScrollRange } from '../../presetUtils';
import { scrollGroup } from '../../scrollGroup';

const TRAVEL = '100%';

const DEFAULTS: Required<SlideScroll> = {
  type: 'SlideScroll',
  direction: 'top',
  range: 'in',
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_LAYOUT_ROTATION_NAME, MOTION_TRANS_ROT_NAME, MOTION_REVEAL_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<SlideScroll>;

  // SlideScroll reveals in the opposite direction to the movement to create its entrance-exit feel
  const clipDirection = oppositeDirection(
    parseKeywordLazy(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULTS.direction),
    'four-sides',
  );

  const transformOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      travel: TRAVEL,
    },
  } as ScrubAnimationOptions;
  const revealOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: clipDirection,
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    // the layout rotation comes first, so the motion moves along the element's rotated axes
    useLayoutRotation(
      transformOptions,
      scrollGroup,
      { composite: 'replace', defaultRange: DEFAULTS.range },
      asWeb,
      suffix,
    ),
    useDirectionalPreset(
      getMotionTransRot,
      transformOptions,
      scrollGroup,
      {
        defaultDirection: DEFAULTS.direction,
        defaultRange: DEFAULTS.range,
        directionType: 'four-sides',
      },
      asWeb,
      suffix,
    ),
    useDirectionalPreset(
      getMotionReveal,
      revealOptions,
      scrollGroup,
      {
        defaultDirection: oppositeDirection(
          DEFAULTS.direction,
          'four-sides',
        ) as EffectFourDirections,
        defaultRange: DEFAULTS.range,
        directionType: 'four-sides',
      },
      asWeb,
      suffix,
    ),
  ]);
}
