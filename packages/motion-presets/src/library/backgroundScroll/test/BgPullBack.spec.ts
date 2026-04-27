import { describe, expect, test } from 'vitest';

import * as BgPullBack from '../BgPullBack';
import { baseMockOptions } from './testUtils';
import type { BgPullBack as BgPullBackType, AnimationData } from '../../../types';

describe('BgPullBack', () => {
  describe('web', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgPullBackType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [
            {
              transform: `perspective(100px) translate3d(0px, -16%, 50px)`,
            },
            {},
          ],
        },
      ];

      const result = BgPullBack.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom scale', () => {
      const scale = 60;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { scale } as BgPullBackType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        {
          keyframes: [
            {
              transform: `perspective(100px) translate3d(0px, -20%, 60px)`,
            },
            {},
          ],
        },
      ];

      const result = BgPullBack.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgPullBackType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: `perspective(100px) translate3d(0px, var(--motion-trans-y), var(--motion-trans-z))`,
            },
            {},
          ],
        },
      ];

      const result = BgPullBack.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom scale', () => {
      const scale = 60;
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { scale } as BgPullBackType,
      };

      const expectedResult = [
        {
          keyframes: [
            {
              transform: `perspective(100px) translate3d(0px, var(--motion-trans-y), var(--motion-trans-z))`,
            },
            {},
          ],
        },
      ];

      const result = BgPullBack.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
