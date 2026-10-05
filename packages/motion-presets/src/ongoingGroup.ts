import type { PresetGroup } from './presetUtils';
import { getLoopOverrides } from './easingUtils';

export const ongoingGroup: PresetGroup = {
  name: 'ongoing',
  getOverrides: (options, _range, { loop }) => getLoopOverrides(options, loop),
};
