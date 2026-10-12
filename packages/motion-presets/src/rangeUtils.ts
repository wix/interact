import type { AnimationDataForScrub } from '@wix/motion';
import type {
  AnimationData,
  AnimationOptions,
  EffectScrollRange,
  RangeOffset,
  ScrubAnimationOptions,
} from './types';
import { SCROLL_RANGES } from './consts';
import { parseKeywordLazy } from './utils';

const SCROLL_RANGE_KEYS = ['startOffset', 'endOffset', 'startOffsetAdd', 'endOffsetAdd'] as const;

// the scroll easing of non-directional motion over continuous, going back to where it started
export const BACK_AND_FORTH_EASING = 'linear(0 0%, 1 50%, 1 50%, 0 100%)';

export function parseRange(
  namedEffect: { range?: unknown } | undefined,
  defaultRange: EffectScrollRange = 'in',
) {
  return parseKeywordLazy<EffectScrollRange>(
    namedEffect?.range as string,
    SCROLL_RANGES,
    defaultRange,
  );
}

// entrance and scroll hold their rest state outside the animation - 'out' is the reversed 'in'
export function getFillOverrides(options: AnimationOptions, range: EffectScrollRange) {
  const defaultFill = range === 'out' ? 'forwards' : range === 'continuous' ? 'both' : 'backwards';
  const { fill = defaultFill } = options;
  return range === 'out' ? { fill, reversed: !options.reversed } : { fill };
}

// fills in a partial range offset - a cover offset defaults to its place in the cover range, any other to 0
function completeRangeOffset(
  rangeOffset: Partial<RangeOffset>,
  defaultName: RangeOffset['name'],
  coverValue: number,
): RangeOffset {
  const name = rangeOffset.name || defaultName;
  const unit = rangeOffset.offset?.unit || 'percentage';
  const value =
    rangeOffset.offset?.value ?? (name === 'cover' && unit === 'percentage' ? coverValue : 0);
  return { ...rangeOffset, name, offset: { ...rangeOffset.offset, unit, value } };
}

// in: cover 0% - 50%, out: cover 50% - 100%, continuous: cover 0% - 100%
export function completeScrollOffsets(options: ScrubAnimationOptions, range: EffectScrollRange) {
  const startOffset = completeRangeOffset(
    options.startOffset ?? {},
    'cover',
    range === 'out' ? 50 : 0,
  );
  const endOffset = completeRangeOffset(
    options.endOffset ?? {},
    startOffset.name,
    range === 'in' ? 50 : 100,
  );
  return { startOffset, endOffset };
}

// the scroll easing of a preset without its own easing (see getScrollEasing):
// directional motion continues through its rest state over continuous, other motion goes back and forth
export function getLinearScrollEasing(range: EffectScrollRange, directional: boolean) {
  return range === 'continuous' && !directional ? BACK_AND_FORTH_EASING : 'linear';
}

// the fill, easing and scroll range a scroll layer sets over the user's options
export function getScrollOverrides(
  options: AnimationOptions,
  range: EffectScrollRange,
  easing: string,
) {
  return {
    ...getFillOverrides(options, range),
    easing,
    ...completeScrollOffsets(options as ScrubAnimationOptions, range),
  };
}

// makes all animations span the scroll range of the first one, e.g. a range widened by parallax
export function withSharedScrollRange(animations: AnimationData[]) {
  const [source, ...rest] = animations as Partial<AnimationDataForScrub>[];
  const range = Object.fromEntries(
    SCROLL_RANGE_KEYS.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]),
  );

  return [source, ...rest.map((animation) => ({ ...animation, ...range }))] as AnimationData[];
}
