import { describe, expect, test } from 'vitest';

import * as BgCloseUp from '../BgCloseUp';
import { baseMockOptions } from './testUtils';
import type { BgCloseUp as BgCloseUpType, AnimationData } from '../../../types';

describe('BgCloseUp', () => {
  describe('web', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgCloseUpType,
      };

      const expectedResult: Partial<AnimationData>[] = [
        { ...baseMockOptions },
        {
          ...baseMockOptions,
          keyframes: [{}, { transform: `perspective(100px) translateZ(80px)` }],
        },
      ];

      const result = BgCloseUp.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom values', () => {
      const depth = { value: 50, unit: 'px' };
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { depth } as BgCloseUpType,
      };
      const expectedResult: Partial<AnimationData>[] = [
        { ...baseMockOptions },
        {
          ...baseMockOptions,
          keyframes: [{}, { transform: `perspective(100px) translateZ(50px)` }],
        },
      ];

      const result = BgCloseUp.web(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('style', () => {
    test('Default values', () => {
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: {} as BgCloseUpType,
      };

      const expectedResult = [
        { ...baseMockOptions },
        {
          ...baseMockOptions,
          keyframes: [
            {},
            {
              transform: `perspective(100px) translateZ(var(--motion-trans-z))`,
            },
          ],
        },
      ];

      const result = BgCloseUp.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });

    test('Custom values', () => {
      const depth = { value: 50, unit: 'px' };
      const mockOptions = {
        ...baseMockOptions,
        namedEffect: { depth } as BgCloseUpType,
      };
      const expectedResult = [
        { ...baseMockOptions },
        {
          ...baseMockOptions,
          keyframes: [
            {},
            {
              transform: `perspective(100px) translateZ(var(--motion-trans-z))`,
            },
          ],
        },
      ];

      const result = BgCloseUp.style(mockOptions);

      expect(result).toMatchObject(expectedResult);
    });
  });
});
