import { describe, expect, test } from 'vitest';

import * as BgFadeBack from '../BgFadeBack';
import { baseMockOptions } from './testUtils';
import type { BgFadeBack as BgFadeBackType, AnimationData } from '../../../types';

describe('BgFadeBack', () => {
  describe('web', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgFadeBackType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {},
        {
          ...baseMockOptions,
          keyframes: [{ scale: 1 }, { scale: 0.7 }],
        },
      ];

      const result = BgFadeBack.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom scale', () => {
      const scale = 0.7;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { scale } as BgFadeBackType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {},
        {
          ...baseMockOptions,
          keyframes: [{ scale: 1 }, { scale }],
        },
      ];

      const result = BgFadeBack.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgFadeBackType,
      };

      const expectedResult = [
        {},
        {
          ...baseMockOptions,
          keyframes: [{ scale: 1 }, { scale: 'var(--motion-scale)' }],
        },
      ];

      const result = BgFadeBack.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom scale', () => {
      const scale = 0.7;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { scale } as BgFadeBackType,
      };

      const expectedResult = [
        {},
        {
          ...baseMockOptions,
          keyframes: [{ scale: 1 }, { scale: 'var(--motion-scale)' }],
        },
      ];

      const result = BgFadeBack.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
