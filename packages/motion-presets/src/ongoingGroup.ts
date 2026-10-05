import type { TimeAnimationOptions } from './types';
import type { PresetGroup } from './presetUtils';
import { getActiveFraction, getLoopEasing } from './easingUtils';

export const ongoingGroup: PresetGroup = {
  name: 'ongoing',
  // the iteration delay is a hold at rest at the end of each iteration
  getOverrides(options, _range, { loop }) {
    const activeFraction = getActiveFraction(options);
    return {
      duration: ((options as TimeAnimationOptions).duration || 1) / activeFraction,
      easing: loop ? getLoopEasing(loop, activeFraction) : 'linear',
    };
  },
};
