import type { AnimationOptions, EffectScrollRange, RangeOffset } from './types';
import type { PresetGroup } from './presetUtils';
import { getScrollOverrides } from './rangeUtils';
import type { ScrollEasingOptions } from './easingUtils';
import { getScrollEasing } from './easingUtils';
import { createParallax } from './parallaxUtils';

// directional motion continues through its rest state over continuous, other motion goes back and forth
function getOverrides(
  options: AnimationOptions,
  range: EffectScrollRange,
  easingOptions: ScrollEasingOptions,
  directional: boolean,
) {
  return getScrollOverrides(options, range, getScrollEasing(range, directional, easingOptions));
}

export const scrollGroup: PresetGroup = {
  name: 'scroll',
  getOverrides,
};

// for presets with a parallax layer - kept apart so the other scroll presets don't bundle the parallax
export const parallaxScrollGroup: PresetGroup = {
  name: 'scroll',
  getOverrides,
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
