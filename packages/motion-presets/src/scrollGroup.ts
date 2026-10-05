import type {
  AnimationOptions,
  EffectScrollRange,
  RangeOffset,
  ScrubAnimationOptions,
} from './types';
import type { EasingParsingOptions, PresetGroup } from './presetUtils';
import { getFillOverrides } from './presetUtils';
import { getContinuousEasing, mirrorEasing, toCssEasing } from './easingUtils';
import { createParallax } from './parallaxUtils';

const SCROLL_RANGE_COVER_0: RangeOffset = {
  name: 'cover',
  offset: { value: 0, unit: 'percentage' },
};
const SCROLL_RANGE_COVER_50: RangeOffset = {
  name: 'cover',
  offset: { value: 50, unit: 'percentage' },
};
const SCROLL_RANGE_COVER_100: RangeOffset = {
  name: 'cover',
  offset: { value: 100, unit: 'percentage' },
};

function cloneRangeOffset({ offset, ...rest }: RangeOffset): RangeOffset {
  return { ...rest, ...(offset && { offset: { ...offset } }) };
}

function completeScrollOffsets(options: ScrubAnimationOptions, range: EffectScrollRange) {
  // copies, since the offsets are completed in place below
  const startOffset = cloneRangeOffset(
    options.startOffset ?? (range === 'out' ? SCROLL_RANGE_COVER_50 : SCROLL_RANGE_COVER_0),
  );
  const endOffset = cloneRangeOffset(
    options.endOffset ?? (range === 'in' ? SCROLL_RANGE_COVER_50 : SCROLL_RANGE_COVER_100),
  );

  startOffset.name = startOffset.name || 'cover';
  endOffset.name = endOffset.name || startOffset.name;

  startOffset.offset = startOffset.offset || {
    value: range === 'out' && startOffset.name === 'cover' ? 50 : 0,
    unit: 'percentage',
  };
  endOffset.offset = endOffset.offset || {
    value: endOffset.name === 'cover' ? (range === 'in' ? 50 : 100) : 0,
    unit: 'percentage',
  };

  startOffset.offset.unit = startOffset.offset.unit || 'percentage';
  endOffset.offset.unit = endOffset.offset.unit || 'percentage';

  startOffset.offset.value =
    startOffset.offset.value ??
    (range === 'out' && startOffset.name === 'cover' && startOffset.offset.unit === 'percentage'
      ? 50
      : 0);
  endOffset.offset.value =
    endOffset.offset.value ??
    (endOffset.name === 'cover' && endOffset.offset.unit === 'percentage'
      ? range === 'in'
        ? 50
        : 100
      : 0);

  return { startOffset, endOffset };
}

// scroll animations use only the preset's easing, applied per range to keep in + out = continuous
// easing - the visual easing of the in-motion
// outEasing - the visual easing of the out-motion (defaults to the in-motion reversed)
// continuousEasing - the in-half of continuous (defaults to easing), the out-half uses outEasing
function resolveScrollEasing(
  range: EffectScrollRange,
  directional: boolean,
  parsingOptions: EasingParsingOptions,
) {
  const { easing, outEasing, continuousEasing = easing, continuousHold } = parsingOptions;
  if (range === 'in') {
    return toCssEasing(easing);
  }
  if (range === 'out') {
    // 'out' is played reversed, so its visual easing is mirrored
    return outEasing ? mirrorEasing(outEasing) : toCssEasing(easing);
  }
  return getContinuousEasing(continuousEasing, outEasing, directional, continuousHold);
}

function getScrollOverrides(
  options: AnimationOptions,
  range: EffectScrollRange,
  easingOptions: EasingParsingOptions,
  directional: boolean,
) {
  const { startOffset, endOffset } = completeScrollOffsets(options as ScrubAnimationOptions, range);
  return {
    ...getFillOverrides(options, range),
    easing: resolveScrollEasing(range, directional, easingOptions),
    startOffset,
    endOffset,
  };
}

export const scrollGroup: PresetGroup = {
  name: 'scroll',
  getOverrides: getScrollOverrides,
};

// for presets with a parallax layer - kept apart so the other scroll presets don't bundle the parallax
export const parallaxScrollGroup: PresetGroup = {
  name: 'scroll',
  getOverrides: getScrollOverrides,
  // the parallax spans the scroll range, with its center defaulting to the element's rest state
  applyParallax(params, range, { startOffset, endOffset }) {
    const parallax = params.parallax as { speed: number; center?: number } | undefined;
    if (!parallax) {
      return;
    }
    const { speed, center = range === 'continuous' ? 0.5 : range === 'out' ? 0 : 1 } = parallax;
    params.parallax = createParallax(
      { startOffset, endOffset } as {
        startOffset: Required<RangeOffset>;
        endOffset: Required<RangeOffset>;
      },
      range === 'out',
      speed,
      center,
    );
  },
};
