import type { PresetGroup } from './presetUtils';
import { getFillOverrides } from './rangeUtils';

export const entranceGroup: PresetGroup = {
  name: 'entrance',
  getOverrides: getFillOverrides,
};
