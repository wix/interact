import { describe, expect, test } from 'vitest';

import * as BgFade from '../BgFade';
import { baseMockOptions } from './testUtils';
import type { AnimationData, BgFade as BgFadeType } from '../../../types';

describe('BgFade', () => {
  describe('web', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgFadeType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          ...baseMockOptions,
          easing: 'sineIn',
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
        },
      ];

      const result = BgFade.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom range - out', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as BgFadeType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          easing: 'sineOut',
          keyframes: [{ opacity: 1 }, { opacity: 0 }],
        },
      ];

      const result = BgFade.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgFadeType,
      };

      const expectedResult = [
        {
          ...baseMockOptions,
          easing: 'sineIn',
          keyframes: [
            { opacity: 'var(--motion-bg-fade-from)' },
            { opacity: 'var(--motion-bg-fade-to)' },
          ],
        },
      ];

      const result = BgFade.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom range - out', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { range: 'out' } as BgFadeType,
      };

      const expectedResult = [
        {
          easing: 'sineOut',
          keyframes: [
            { opacity: 'var(--motion-bg-fade-from)' },
            { opacity: 'var(--motion-bg-fade-to)' },
          ],
        },
      ];

      const result = BgFade.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
