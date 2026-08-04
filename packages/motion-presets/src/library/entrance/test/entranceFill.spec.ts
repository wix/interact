import { describe, expect, test } from 'vitest';

import * as entrancePresets from '../index';
import { baseMockOptions } from './testUtils';
import type { TimeAnimationOptions } from '../../../types';

const presetEntries = Object.entries(entrancePresets) as [
  string,
  { style: (options: TimeAnimationOptions) => unknown[] },
][];

describe('entrance presets fill defaults', () => {
  test.each(presetEntries)(
    '%s defaults every animation descriptor to backwards fill',
    (_name, preset) => {
      const mockOptions = {
        ...baseMockOptions,
        duration: 500,
        namedEffect: { type: _name },
      } as TimeAnimationOptions;

      const result = preset.style(mockOptions);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((animation) => {
        expect((animation as { fill?: string }).fill).toBe('backwards');
      });
    },
  );

  test.each(presetEntries)('%s preserves an explicit fill override', (_name, preset) => {
    const mockOptions = {
      ...baseMockOptions,
      duration: 500,
      fill: 'forwards',
      namedEffect: { type: _name },
    } as TimeAnimationOptions;

    const result = preset.style(mockOptions);

    result.forEach((animation) => {
      expect((animation as { fill?: string }).fill).toBe('forwards');
    });
  });
});
