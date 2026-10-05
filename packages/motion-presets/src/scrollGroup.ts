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
function completeScrollOffsets(options: ScrubAnimationOptions, range: EffectScrollRange) {
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
