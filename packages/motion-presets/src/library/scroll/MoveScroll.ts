import type { AnimationData, DomApi, MoveScroll, ScrubAnimationOptions } from '../../types';
import { SCROLL_RANGES } from '../../consts';
import { angleDirection, toMotionRange } from '../../directions';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  getMotionLayoutRotation,
} from '../../transformUtils';
import { compareKeywordToNonDefaults, parseLength, parseLengthLazy } from '../../utils';

const DEFAULTS: Required<MoveScroll> = {
  type: 'MoveScroll',
  direction: -60,
  range: 'in',
  travel: { value: 400, unit: 'px' },
};

export const schema = {
  direction: { type: 'number', default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  travel: { type: 'length', default: DEFAULTS.travel },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<MoveScroll>;
  const { direction = DEFAULTS.direction, range: inputRange, travel: inputTravel } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);

  // when y direction is positive - moving against the scroll - we need to widen the range like with parallax
  // TODO - teach fizban some more math operations to allow using calc here and accept any string as direction or travel
  const travel = parseLength(inputTravel, DEFAULTS.travel);
  const normalized = ((direction % 360) + 360) % 360;
  const yDirection =
    Math.sign(travel.value) *
    (normalized === 180 || normalized === 0 ? 0 : normalized < 180 ? 1 : -1);

  let startOffsetAdd = '',
    endOffsetAdd = '';
  if (yDirection === 1) {
    const travelY = travel.value * Math.sin((direction * Math.PI) / 180);
    const unit = travel.unit;
    if (!compareKeywordToNonDefaults(inputRange, ['out'])) {
      startOffsetAdd = `${-travelY}${unit}`;
    }
    if (compareKeywordToNonDefaults(inputRange, ['out', 'continuous'])) {
      endOffsetAdd = `${travelY}${unit}`;
    }
  }

  // range out is opposite direction reversed
  const parsedDirection = angleDirection.parse(namedEffect!.direction, DEFAULTS.direction);
  const motionDirection =
    range === 'out' ? angleDirection.opposite(parsedDirection) : parsedDirection;

  return withSharedScrollRange([
    {
      ...options,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      ...getMotionTransRot(
        toMotionRange(angleDirection, motionDirection, range),
        { travel: parseLengthLazy(inputTravel, DEFAULTS.travel) },
        asWeb,
        suffix,
      ),
      startOffsetAdd,
      endOffsetAdd,
    },
    {
      ...options,
      composite: 'add',
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, false)),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ]);
}
