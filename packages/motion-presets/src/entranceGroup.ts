import type { PresetGroup } from './presetUtils';
import { getFillOverrides } from './presetUtils';

export const entranceGroup: PresetGroup = {
  name: 'entrance',
  getOverrides: getFillOverrides,
};
